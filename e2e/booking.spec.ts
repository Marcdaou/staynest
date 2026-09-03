import { expect, test } from '@playwright/test'
import { login } from './helpers'

// Walks the whole payment path: reserve → Stripe Checkout → test card →
// success page → the webhook flips the booking to confirmed → Trips shows it.
test('a test-card booking ends up confirmed in Trips', async ({ page }) => {
  test.setTimeout(180_000)

  await page.goto('/')
  await login(page)

  await page.getByTestId('listing-card').first().click()
  await page.getByTestId('listing-detail').waitFor()
  const title = (await page.locator('h1').first().textContent())!.trim()

  // dates far enough out that repeated runs do not collide with each other
  const start = new Date()
  start.setDate(start.getDate() + 200 + Math.floor(Math.random() * 120))
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const end = new Date(start)
  end.setDate(end.getDate() + 3)

  await page.getByTestId('detail-checkin').fill(iso(start))
  await page.getByTestId('detail-checkout').fill(iso(end))

  const total = await page.getByTestId('price-total').textContent()

  await page.getByTestId('reserve-button').click()
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 })

  // Stripe's hosted page should be charging exactly what we displayed
  await expect(page.locator('body')).toContainText(total!.replace('$', ''))

  // this account offers several methods, so select Card to reveal its fields
  const cardNumber = page.locator('#cardNumber')
  if (!(await cardNumber.isVisible().catch(() => false))) {
    // the radio sits under an invisible accordion overlay, so click through it
    await page.locator('#payment-method-accordion-item-title-card').click({ force: true })
  }
  await cardNumber.waitFor({ timeout: 30_000 })

  await page.locator('#cardNumber').fill('4242424242424242')
  await page.locator('#cardExpiry').fill('12' + String(new Date().getFullYear() + 3).slice(-2))
  await page.locator('#cardCvc').fill('123')
  await page.locator('#billingName').fill('Demo Guest')
  const postal = page.locator('#billingPostalCode')
  if (await postal.count()) await postal.fill('10001')

  await page.locator('.SubmitButton').click()

  await page.waitForURL(/\/booking\/success/, { timeout: 90_000 })
  await expect(page.getByTestId('booking-success')).toBeVisible()

  // the webhook confirms asynchronously; the page polls until it does
  await expect(page.getByTestId('success-status')).toContainText('confirmed', {
    timeout: 60_000,
  })

  await page.goto('/trips')

  // match this booking by its date range — the listing may appear more than once
  const label = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const row = page
    .getByTestId('trip-row')
    .filter({ hasText: title.slice(0, 20) })
    .filter({ hasText: `${label(start)} – ${label(end)}` })
  await expect(row).toHaveCount(1)
  await expect(row.getByTestId('trip-status')).toHaveText('confirmed')
})
