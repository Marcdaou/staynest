import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Listing, Profile, ReviewWithAuthor } from '../lib/database.types'
import { addDaysISO, dateLabel, money, priceBreakdown, todayISO } from '../lib/format'
import { Star, Superhost } from '../components/icons'
import { Heart } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useWishlist } from '../hooks/useWishlist'
import { startCheckout } from '../lib/checkout'

export function ListingDetail() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { open } = useAuthModal()
  const { isSaved, toggle } = useWishlist()

  const [checkIn, setCheckIn] = useState(addDaysISO(todayISO(), 14))
  const [checkOut, setCheckOut] = useState(addDaysISO(todayISO(), 19))
  const [guests, setGuests] = useState(2)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error

      const [{ data: host }, { data: reviews }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', listing.host_id).single(),
        supabase
          .from('reviews')
          .select('*, author:profiles(*)')
          .eq('listing_id', id)
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      return {
        listing: listing as Listing,
        host: (host ?? null) as Profile | null,
        reviews: (reviews ?? []) as unknown as ReviewWithAuthor[],
      }
    },
  })

  const listing = data?.listing
  const price = useMemo(
    () => (listing ? priceBreakdown(listing, checkIn, checkOut) : null),
    [listing, checkIn, checkOut],
  )

  const book = async () => {
    if (!user) return open()
    if (!listing || !price || price.nights <= 0) return
    setBusy(true)
    setError(null)
    try {
      const url = await startCheckout({ listingId: listing.id, checkIn, checkOut, guests })
      window.location.href = url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout')
      setBusy(false)
    }
  }

  if (isLoading || !listing || !price) {
    return (
      <div className="mx-auto max-w-[1120px] animate-pulse px-6 py-8">
        <div className="h-8 w-1/2 rounded bg-neutral-200" />
        <div className="mt-6 h-[480px] rounded-xl bg-neutral-200" />
      </div>
    )
  }

  const saved = isSaved(listing.id)
  const [hero, ...rest] = listing.images

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-6" data-testid="listing-detail">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-hof">{listing.title}</h1>
        <button
          type="button"
          onClick={() => (user ? toggle(listing.id) : open())}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold underline transition hover:bg-neutral-100"
        >
          <Heart filled={saved} className="h-4 w-4" />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* photo mosaic */}
      <div className="mt-4 grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:h-[440px]">
        <img src={hero} alt={listing.title} className="col-span-2 row-span-2 h-full w-full object-cover" />
        {rest.slice(0, 4).map((src, i) => (
          <img key={src + i} src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        ))}
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_372px]">
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-bar pb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {listing.room_type === 'entire_place' ? 'Entire place' : 'Room'} in {listing.city},{' '}
                {listing.country}
              </h2>
              <p className="pt-1 text-sm text-foggy">
                {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{' '}
                {listing.bathrooms} baths
              </p>
              <p className="flex items-center gap-1.5 pt-2 text-sm font-semibold">
                <Star className="h-3 w-3" /> {listing.rating.toFixed(2)}
                <span className="font-normal text-foggy">· {listing.review_count} reviews</span>
              </p>
            </div>
            {data.host && (
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">Hosted by {data.host.full_name}</p>
                  {data.host.is_superhost && (
                    <p className="flex items-center justify-end gap-1 text-xs text-foggy">
                      <Superhost className="h-3 w-3 text-rausch" /> Superhost
                    </p>
                  )}
                </div>
                {data.host.avatar_url && (
                  <img
                    src={data.host.avatar_url}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <p className="whitespace-pre-line border-b border-bar py-6 text-[15px] leading-relaxed text-hof">
            {listing.description}
          </p>

          <section className="border-b border-bar py-6">
            <h3 className="pb-4 text-xl font-semibold">What this place offers</h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {listing.amenities.map((a) => (
                <li key={a} className="text-[15px] text-hof">
                  {a}
                </li>
              ))}
            </ul>
          </section>

          {data.reviews.length > 0 && (
            <section className="py-6">
              <h3 className="flex items-center gap-2 pb-5 text-xl font-semibold">
                <Star className="h-4 w-4" /> {listing.rating.toFixed(2)} · {listing.review_count} reviews
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {data.reviews.map((r) => (
                  <article key={r.id}>
                    <div className="flex items-center gap-3 pb-2">
                      {r.author?.avatar_url && (
                        <img src={r.author.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">{r.author?.full_name ?? 'Guest'}</p>
                        <p className="text-xs text-foggy">
                          {new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[15px] leading-relaxed text-hof">{r.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* booking card */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-bar p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <p className="text-[22px] text-hof">
              <span className="font-semibold">{money(listing.price_per_night)}</span>
              <span className="text-base text-foggy"> night</span>
            </p>

            <div className="mt-4 rounded-lg border border-neutral-400">
              <div className="grid grid-cols-2">
                <label className="border-r border-neutral-400 px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wide">Check-in</span>
                  <input
                    type="date"
                    data-testid="detail-checkin"
                    className="w-full bg-transparent text-sm outline-none"
                    min={todayISO()}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value)
                      if (e.target.value >= checkOut) setCheckOut(addDaysISO(e.target.value, 1))
                    }}
                  />
                </label>
                <label className="px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wide">Checkout</span>
                  <input
                    type="date"
                    data-testid="detail-checkout"
                    className="w-full bg-transparent text-sm outline-none"
                    min={addDaysISO(checkIn, 1)}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </label>
              </div>
              <label className="block border-t border-neutral-400 px-3 py-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wide">Guests</span>
                <select
                  data-testid="detail-guests"
                  className="w-full bg-transparent text-sm outline-none"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={book}
              disabled={busy || price.nights <= 0}
              data-testid="reserve-button"
              className="mt-4 w-full rounded-lg bg-rausch py-3.5 text-base font-semibold text-white transition hover:bg-rausch-dark disabled:opacity-60"
            >
              {busy ? 'Redirecting…' : user ? 'Reserve' : 'Log in to reserve'}
            </button>

            {error && (
              <p role="alert" data-testid="booking-error" className="pt-3 text-sm text-rausch">
                {error}
              </p>
            )}

            {price.nights > 0 && (
              <div className="mt-5 space-y-3 text-[15px]" data-testid="price-breakdown">
                <p className="text-center text-sm text-foggy">You won't be charged yet</p>
                <div className="flex justify-between">
                  <span className="underline">
                    {money(price.nightly)} × {price.nights} nights
                  </span>
                  <span>{money(price.accommodation)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span>{money(price.cleaning)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">StayNest service fee</span>
                  <span>{money(price.serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t border-bar pt-3 font-semibold">
                  <span>
                    Total · {dateLabel(checkIn)} – {dateLabel(checkOut)}
                  </span>
                  <span data-testid="price-total">{money(price.total)}</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
