import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Listing } from '../lib/database.types'
import { CategoryBar } from '../components/CategoryBar'
import { ListingCard } from '../components/ListingCard'
import { ListingCardSkeleton } from '../components/ListingCardSkeleton'

export function Home() {
  const [params] = useSearchParams()
  const where = params.get('where')?.trim() ?? ''
  const category = params.get('category')
  const guests = Number(params.get('guests') ?? 0)
  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')

  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', { where, category, guests, checkIn, checkOut }],
    queryFn: async () => {
      let q = supabase.from('listings').select('*').order('rating', { ascending: false })

      if (where) q = q.or(`city.ilike.%${where}%,country.ilike.%${where}%,title.ilike.%${where}%`)
      if (category) q = q.contains('categories', [category])
      if (guests > 0) q = q.gte('max_guests', guests)

      const { data, error } = await q
      if (error) throw error
      const listings = (data ?? []) as Listing[]

      // when dates are given, drop anything already booked for that range
      if (checkIn && checkOut && checkOut > checkIn) {
        const checks = await Promise.all(
          listings.map(async (l) => {
            const { data: ok } = await supabase.rpc('is_listing_available', {
              p_listing_id: l.id,
              p_check_in: checkIn,
              p_check_out: checkOut,
            })
            return ok !== false
          }),
        )
        return listings.filter((_, i) => checks[i])
      }
      return listings
    },
  })

  const heading = category
    ? category
    : where
      ? `Stays in ${where}`
      : 'Popular homes around the world'

  return (
    <>
      <CategoryBar />

      <main className="mx-auto max-w-[1760px] px-6 py-8 md:px-10">
        <h1 className="pb-5 text-xl font-semibold text-hof" data-testid="results-heading">
          {heading}
        </h1>

        {error && (
          <p role="alert" className="text-sm text-rausch">
            Could not load homes: {(error as Error).message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {isLoading
            ? Array.from({ length: 10 }, (_, i) => <ListingCardSkeleton key={i} />)
            : data?.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>

        {!isLoading && data?.length === 0 && (
          <div className="py-24 text-center">
            <h2 className="text-xl font-semibold">No exact matches</h2>
            <p className="pt-2 text-foggy">
              Try changing or removing some of your filters.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
