export interface Category {
  label: string
  emoji: string
}

/** Mirrors the `categories` text[] on listings. */
export const CATEGORIES: Category[] = [
  { label: 'Iconic cities', emoji: '🏙️' },
  { label: 'Cabins', emoji: '🛖' },
  { label: 'Amazing views', emoji: '🏔️' },
  { label: 'Amazing pools', emoji: '🏊' },
  { label: 'Beachfront', emoji: '🏖️' },
  { label: 'Design', emoji: '🎨' },
  { label: 'Countryside', emoji: '🌾' },
  { label: 'Historical homes', emoji: '🏛️' },
  { label: 'Tiny homes', emoji: '🏡' },
  { label: 'Treehouses', emoji: '🌳' },
  { label: 'Arctic', emoji: '❄️' },
  { label: 'Desert', emoji: '🌵' },
  { label: 'Tropical', emoji: '🌴' },
  { label: 'Lakefront', emoji: '🛶' },
  { label: 'Skiing', emoji: '⛷️' },
  { label: 'Surfing', emoji: '🏄' },
  { label: 'Castles', emoji: '🏰' },
  { label: 'Boats', emoji: '⛵' },
  { label: 'National parks', emoji: '🏞️' },
]
