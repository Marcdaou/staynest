import { expect, test } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from './helpers'

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!URL || !KEY) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env')
}

async function token() {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  })
  const body = await res.json()
  expect(body.access_token, JSON.stringify(body)).toBeTruthy()
  return body.access_token as string
}

const get = (path: string, jwt?: string) =>
  fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
  })

test('listings are readable without signing in', async () => {
  const res = await get('listings?select=id&limit=1')
  expect(res.status).toBe(200)
  expect((await res.json()).length).toBe(1)
})

test('bookings are invisible to anonymous callers', async () => {
  const res = await get('bookings?select=id')
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual([])
})

test('a signed-in user only sees their own bookings', async () => {
  const jwt = await token()
  const res = await get('bookings?select=id,guest_id', jwt)
  expect(res.status).toBe(200)

  const rows = (await res.json()) as { guest_id: string }[]
  const me = JSON.parse(atob(jwt.split('.')[1])).sub
  for (const row of rows) expect(row.guest_id).toBe(me)
})

test('another user’s wishlist is not readable', async () => {
  const jwt = await token()
  const res = await get('wishlists?select=id,user_id', jwt)
  expect(res.status).toBe(200)

  const rows = (await res.json()) as { user_id: string }[]
  const me = JSON.parse(atob(jwt.split('.')[1])).sub
  for (const row of rows) expect(row.user_id).toBe(me)
})

test('a client cannot insert a booking for someone else', async () => {
  const jwt = await token()
  const res = await fetch(`${URL}/rest/v1/bookings`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listing_id: '00000000-0000-0000-0000-000000000000',
      guest_id: '00000000-0000-0000-0000-000000000001',
      check_in: '2030-01-01',
      check_out: '2030-01-05',
      total_cents: 1,
    }),
  })
  expect(res.status).toBeGreaterThanOrEqual(400)
})

test('a client cannot confirm its own booking', async () => {
  const jwt = await token()
  const res = await fetch(`${URL}/rest/v1/bookings?status=eq.pending`, {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status: 'confirmed' }),
  })
  // either rejected outright, or the RLS check silently matches no rows
  if (res.ok) expect(await res.json()).toEqual([])
  else expect(res.status).toBeGreaterThanOrEqual(400)
})
