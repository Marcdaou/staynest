import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/** Returns the user's default wishlist id, creating it on first use. */
async function ensureWishlist(userId: string) {
  const { data: existing, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (existing) return existing.id

  const { data: created, error: createError } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, name: 'My favourites' })
    .select('id')
    .single()
  if (createError) throw createError
  return created.id
}

export function useWishlist() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const saved = useQuery({
    queryKey: ['wishlist', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('listing_id, wishlists!inner(user_id)')
        .eq('wishlists.user_id', user!.id)
      if (error) throw error
      return new Set((data ?? []).map((r) => r.listing_id as string))
    },
  })

  const toggle = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('Not signed in')
      const wishlistId = await ensureWishlist(user.id)

      // Delete first and use the affected rows as the source of truth: the
      // cached set can be stale (or still loading) right after a page load.
      const { data: removed, error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('wishlist_id', wishlistId)
        .eq('listing_id', listingId)
        .select('listing_id')
      if (deleteError) throw deleteError
      if (removed && removed.length > 0) return

      const { error } = await supabase
        .from('wishlist_items')
        .insert({ wishlist_id: wishlistId, listing_id: listingId })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      qc.invalidateQueries({ queryKey: ['saved-listings'] })
    },
  })

  return {
    savedIds: saved.data ?? new Set<string>(),
    isSaved: (id: string) => saved.data?.has(id) ?? false,
    toggle: toggle.mutate,
    isToggling: toggle.isPending,
  }
}
