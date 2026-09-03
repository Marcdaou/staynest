export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export const moneyCents = (cents: number) => money(Math.round(cents / 100))

export const nightsBetween = (checkIn: string, checkOut: string) => {
  const a = new Date(`${checkIn}T00:00:00`)
  const b = new Date(`${checkOut}T00:00:00`)
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000))
}

export interface PriceBreakdown {
  nights: number
  nightly: number
  accommodation: number
  cleaning: number
  serviceFee: number
  total: number
}

/**
 * Mirrors the calculation in the create-checkout-session edge function.
 * The server recomputes this from the database — the client copy is for display.
 */
export function priceBreakdown(
  listing: { price_per_night: number; cleaning_fee: number; service_fee_pct: number },
  checkIn: string,
  checkOut: string,
): PriceBreakdown {
  const nights = nightsBetween(checkIn, checkOut)
  const accommodation = listing.price_per_night * nights
  const cleaning = nights > 0 ? listing.cleaning_fee : 0
  const serviceFee = Math.round((accommodation + cleaning) * listing.service_fee_pct)
  return {
    nights,
    nightly: listing.price_per_night,
    accommodation,
    cleaning,
    serviceFee,
    total: accommodation + cleaning + serviceFee,
  }
}

export const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const addDaysISO = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
