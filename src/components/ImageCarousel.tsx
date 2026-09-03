import { useState } from 'react'
import { ChevronLeft, ChevronRight } from './icons'

interface Props {
  images: string[]
  alt: string
  className?: string
}

/** Card-sized carousel: arrows appear on hover, dots track position. */
export function ImageCarousel({ images, alt, className = '' }: Props) {
  const [index, setIndex] = useState(0)
  const count = images.length || 1

  const go = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i + delta + count) % count)
  }

  return (
    <div className={`group/car relative overflow-hidden rounded-xl bg-neutral-100 ${className}`}>
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={i === 0 ? alt : ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`carousel-img absolute inset-0 h-full w-full object-cover ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={go(-1)}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-hof shadow-md transition hover:scale-105 hover:bg-white group-hover/car:block"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={go(1)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-hof shadow-md transition hover:scale-105 hover:bg-white group-hover/car:block"
          >
            <ChevronRight className="h-3 w-3" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`rounded-full bg-white transition-all ${
                  i === index ? 'h-1.5 w-1.5 opacity-100' : 'h-1 w-1 opacity-60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
