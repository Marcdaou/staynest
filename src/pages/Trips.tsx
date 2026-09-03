import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import type { BookingWithListing } from '../lib/database.types'
import { dateLabel, moneyCents } from '../lib/format'

const badge: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-neutral-100 text-foggy',
}

export function Trips() {
  const { user } = useAuth()
  const { open } = useAuthModal()

  const { data, isLoading } = useQuery({
    queryKey: ['trips', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, listing:listings(*)')
        .order('check_in', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as BookingWithListing[]
    },
  })

  if (!user) {
    return (
      <Empty title="Log in to see your trips">
        <button onClick={open} className="rounded-lg bg-rausch px-6 py-3 font-semibold text-white">
          Log in
        </button>
      </Empty>
    )
  }

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10" data-testid="trips-page">
      <h1 className="pb-8 text-3xl font-semibold">Trips</h1>

      {isLoading && <p className="text-foggy">Loading…</p>}

      {!isLoading && data?.length === 0 && (
        <Empty title="No trips booked… yet!">
          <Link to="/" className="rounded-lg bg-rausch px-6 py-3 font-semibold text-white">
            Start searching
          </Link>
        </Empty>
      )}

      <ul className="divide-y divide-bar border-t border-bar">
        {data?.map((b) => (
          <li key={b.id} className="flex gap-5 py-6" data-testid="trip-row">
            {b.listing?.images[0] && (
              <img
                src={b.listing.images[0]}
                alt=""
                className="h-28 w-40 shrink-0 rounded-xl object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="truncate text-lg font-semibold">
                  {b.listing ? (
                    <Link to={`/listings/${b.listing_id}`} className="hover:underline">
                      {b.listing.title}
                    </Link>
                  ) : (
                    'Listing removed'
                  )}
                </h2>
                <span
                  data-testid="trip-status"
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badge[b.status]}`}
                >
                  {b.status}
                </span>
              </div>
              <p className="pt-1 text-sm text-foggy">
                {b.listing?.city}, {b.listing?.country}
              </p>
              <p className="pt-2 text-sm text-hof">
                {dateLabel(b.check_in)} – {dateLabel(b.check_out)} · {b.nights} nights ·{' '}
                {b.guests} guests
              </p>
              <p className="pt-1 text-sm font-semibold">{moneyCents(b.total_cents)} total</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <h1 className="pb-6 text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  )
}
