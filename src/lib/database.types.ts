export type PropertyType =
  | 'house' | 'apartment' | 'cabin' | 'villa' | 'loft'
  | 'cottage' | 'treehouse' | 'boat' | 'tiny_home' | 'castle'

export type RoomType = 'entire_place' | 'private_room' | 'shared_room'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  is_superhost: boolean
  created_at: string
}

export interface Listing {
  id: string
  host_id: string
  title: string
  description: string
  property_type: PropertyType
  room_type: RoomType
  address: string | null
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  price_per_night: number
  cleaning_fee: number
  service_fee_pct: number
  max_guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  images: string[]
  categories: string[]
  rating: number
  review_count: number
  is_guest_favorite: boolean
  created_at: string
}

export interface ListingWithHost extends Listing {
  host: Profile | null
}

export interface Booking {
  id: string
  listing_id: string
  guest_id: string
  check_in: string
  check_out: string
  guests: number
  nights: number
  total_cents: number
  status: BookingStatus
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface BookingWithListing extends Booking {
  listing: Listing | null
}

export interface Review {
  id: string
  listing_id: string
  author_id: string
  rating: number
  comment: string
  created_at: string
}

export interface ReviewWithAuthor extends Review {
  author: Profile | null
}

export interface Wishlist {
  id: string
  user_id: string
  name: string
  created_at: string
}
