import { Link } from 'react-router-dom'
import type { Listing } from '../lib/database.types'
import { money } from '../lib/format'
import { ImageCarousel } from './ImageCarousel'
import { Heart, Star } from './icons'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useWishlist } from '../hooks/useWishlist'

export function ListingCard({ listing }: { listing: Listing }) {
  const { user } = useAuth()
  const { open } = useAuthModal()
  const { isSaved, toggle } = useWishlist()
  const saved = isSaved(listing.id)

  const onHeart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return open()
    toggle(listing.id)
  }

  return (
    <Link to={`/listings/${listing.id}`} className="group block" data-testid="listing-card">
      <div className="relative aspect-square w-full">
        <ImageCarousel images={listing.images} alt={listing.title} className="h-full w-full" />

        <button
          type="button"
          onClick={onHeart}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={saved}
          data-testid="wishlist-toggle"
          className="absolute right-3 top-3 z-10 transition hover:scale-110"
        >
          <Heart filled={saved} className="h-6 w-6" />
        </button>

        {listing.is_guest_favorite && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm">
            Guest favourite
          </span>
        )}
      </div>

      <div className="pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold text-hof">
            {listing.city}, {listing.country}
          </h3>
          {listing.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[15px] text-hof">
              <Star className="h-3 w-3" />
              {listing.rating.toFixed(2)}
            </span>
          )}
        </div>
        <p className="truncate text-[15px] text-foggy">{listing.title}</p>
        <p className="pt-1 text-[15px] text-hof">
          <span className="font-semibold">{money(listing.price_per_night)}</span>
          <span className="text-foggy"> night</span>
        </p>
      </div>
    </Link>
  )
}
