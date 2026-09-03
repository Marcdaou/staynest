import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { BookingWithListing } from '../lib/database.types'
import { dateLabel, moneyCents } from '../lib/format'

/**
 * Landing page after Stripe Checkout. The webhook confirms the booking
 * asynchronously, so this polls briefly until the status flips.
 */
export function BookingSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [booking, setBooking] = useState<BookingWithListing | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    let attempts = 0

    const poll = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, listing:listings(*)')
        .eq('stripe_session_id', sessionId)
        .maybeSingle()

      if (cancelled) return
      const row = data as unknown as BookingWithListing | null
      if (row) setBooking(row)

      if (row?.status === 'confirmed') return
      if (++attempts > 15) return setTimedOut(true)
      setTimeout(poll, 1000)
    }
    poll()
    return () => { cancelled = true }
  }, [sessionId])

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center" data-testid="booking-success">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rausch text-3xl text-white">
        ✓
      </div>
      <h1 className="pt-6 text-3xl font-semibold">
        {booking?.status === 'confirmed' ? 'Your trip is booked' : 'Payment received'}
      </h1>

      {booking?.listing && (
        <div className="mt-8 rounded-xl border border-bar p-6 text-left">
          <img
            src={booking.listing.images[0]}
            alt=""
            className="h-44 w-full rounded-lg object-cover"
          />
          <h2 className="pt-4 text-lg font-semibold">{booking.listing.title}</h2>
          <p className="text-sm text-foggy">
            {booking.listing.city}, {booking.listing.country}
          </p>
          <p className="pt-3 text-sm">
            {dateLabel(booking.check_in)} – {dateLabel(booking.check_out)} · {booking.nights} nights
          </p>
          <p className="pt-1 font-semibold">{moneyCents(booking.total_cents)} total</p>
          <p className="pt-3 text-sm capitalize text-foggy" data-testid="success-status">
            Status: {booking.status}
          </p>
        </div>
      )}

      {booking?.status !== 'confirmed' && !timedOut && (
        <p className="pt-6 text-sm text-foggy">Confirming your reservation…</p>
      )}
      {timedOut && booking?.status !== 'confirmed' && (
        <p className="pt-6 text-sm text-foggy">
          Payment went through. Confirmation is taking a moment — check Trips shortly.
        </p>
      )}

      <Link
        to="/trips"
        className="mt-8 inline-block rounded-lg bg-rausch px-6 py-3 font-semibold text-white"
      >
        Go to Trips
      </Link>
    </main>
  )
}
