export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-neutral-200" />
      <div className="space-y-2 pt-3">
        <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
        <div className="h-3.5 w-1/2 rounded bg-neutral-200" />
        <div className="h-3.5 w-1/3 rounded bg-neutral-200" />
      </div>
    </div>
  )
}
