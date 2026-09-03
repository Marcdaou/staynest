import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import type { Listing } from '../lib/database.types'
import { ListingCard } from '../components/ListingCard'

export function Wishlists() {
  const { user } = useAuth()
  const { open } = useAuthModal()

  const { data, isLoading } = useQuery({
    queryKey: ['saved-listings', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('listing:listings(*), wishlists!inner(user_id)')
        .eq('wishlists.user_id', user!.id)
      if (error) throw error
      return (data ?? [])
        .map((row) => (row as unknown as { listing: Listing }).listing)
        .filter(Boolean)
    },
  })

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="pb-6 text-2xl font-semibold">Log in to view your wishlists</h1>
        <button onClick={open} className="rounded-lg bg-rausch px-6 py-3 font-semibold text-white">
          Log in
        </button>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-[1760px] px-6 py-10 md:px-10" data-testid="wishlists-page">
      <h1 className="pb-8 text-3xl font-semibold">Wishlists</h1>

      {isLoading && <p className="text-foggy">Loading…</p>}

      {!isLoading && data?.length === 0 && (
        <div className="py-24 text-center">
          <h2 className="text-xl font-semibold">Nothing saved yet</h2>
          <p className="pt-2 text-foggy">
            Tap the heart on any home to start your collection.
          </p>
          <Link to="/" className="mt-6 inline-block rounded-lg bg-rausch px-6 py-3 font-semibold text-white">
            Browse homes
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {data?.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </main>
  )
}
