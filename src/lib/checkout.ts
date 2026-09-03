import { supabase } from './supabase'

export interface CheckoutRequest {
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
}

/**
 * Asks the edge function for a Stripe Checkout session. The function recomputes
 * the price and re-checks availability server-side, so the client never sends a total.
 */
export async function startCheckout(req: CheckoutRequest): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url: string; error?: string }>(
    'create-checkout-session',
    {
      body: {
        listing_id: req.listingId,
        check_in: req.checkIn,
        check_out: req.checkOut,
        guests: req.guests,
        success_url: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/listings/${req.listingId}`,
      },
    },
  )

  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error(data?.error ?? 'Checkout session could not be created')
  return data.url
}
