// Creates a Stripe Checkout session for a booking.
//
// The client sends only listing id, dates and guest count. Price and
// availability are recomputed here from the database, so a tampered client
// cannot change what it is charged.
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) return json({ error: 'STRIPE_SECRET_KEY is not configured' }, 500)

    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader) return json({ error: 'Not signed in' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // identify the caller from their JWT
    const asUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await asUser.auth.getUser()
    if (userError || !userData.user) return json({ error: 'Not signed in' }, 401)
    const user = userData.user

    const body = await req.json()
    const listingId: string = body.listing_id
    const checkIn: string = body.check_in
    const checkOut: string = body.check_out
    const guests = Number(body.guests ?? 1)

    if (!listingId || !checkIn || !checkOut) return json({ error: 'Missing booking details' }, 400)
    if (!(checkOut > checkIn)) return json({ error: 'Checkout must be after check-in' }, 400)
    if (checkIn < new Date().toISOString().slice(0, 10)) {
      return json({ error: 'Check-in cannot be in the past' }, 400)
    }

    const admin = createClient(supabaseUrl, serviceKey)

    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, title, city, country, images, price_per_night, cleaning_fee, service_fee_pct, max_guests')
      .eq('id', listingId)
      .single()
    if (listingError || !listing) return json({ error: 'Listing not found' }, 404)

    if (guests < 1 || guests > listing.max_guests) {
      return json({ error: `This home sleeps up to ${listing.max_guests} guests` }, 400)
    }

    const { data: available } = await admin.rpc('is_listing_available', {
      p_listing_id: listingId,
      p_check_in: checkIn,
      p_check_out: checkOut,
    })
    if (available === false) return json({ error: 'Those dates are no longer available' }, 409)

    const nights = Math.round(
      (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000,
    )
    const accommodation = listing.price_per_night * nights
    const cleaning = listing.cleaning_fee
    const serviceFee = Math.round((accommodation + cleaning) * Number(listing.service_fee_pct))
    const total = accommodation + cleaning + serviceFee
    const totalCents = total * 100

    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .insert({
        listing_id: listingId,
        guest_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        total_cents: totalCents,
        status: 'pending',
      })
      .select('id')
      .single()
    if (bookingError) return json({ error: bookingError.message }, 400)

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: totalCents,
            product_data: {
              name: listing.title,
              description: `${listing.city}, ${listing.country} · ${nights} nights · ${guests} guests`,
              images: listing.images?.slice(0, 1) ?? [],
            },
          },
        },
      ],
      metadata: { booking_id: booking.id, listing_id: listingId, guest_id: user.id },
      success_url: body.success_url ?? `${req.headers.get('origin')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancel_url ?? `${req.headers.get('origin')}/listings/${listingId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })

    await admin.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id)

    return json({ url: session.url, booking_id: booking.id })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500)
  }
})
