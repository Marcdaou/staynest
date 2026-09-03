// Confirms bookings once Stripe reports the payment succeeded.
// Runs with --no-verify-jwt: Stripe authenticates via the signature header.
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!stripeKey || !signingSecret) {
    return new Response('Stripe env vars are not configured', { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, signingSecret)
  } catch (e) {
    return new Response(`Invalid signature: ${e instanceof Error ? e.message : e}`, { status: 400 })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const bookingIdFrom = (o: { metadata?: Record<string, string> | null; id?: string }) =>
    o.metadata?.booking_id ?? null

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = bookingIdFrom(session)
      if (!bookingId) break
      // paid check guards against async payment methods that complete later
      if (session.payment_status !== 'paid') break

      await admin
        .from('bookings')
        .update({
          status: 'confirmed',
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
        })
        .eq('id', bookingId)
        .eq('status', 'pending')
      break
    }

    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = bookingIdFrom(session)
      if (bookingId) {
        await admin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)
      }
      break
    }

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = bookingIdFrom(session)
      if (bookingId) {
        await admin
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId)
          .eq('status', 'pending')
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
