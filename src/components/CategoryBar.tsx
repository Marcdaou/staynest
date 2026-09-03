import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'
import { ChevronLeft, ChevronRight, Filters } from './icons'

export function CategoryBar() {
  const [params, setParams] = useSearchParams()
  const active = params.get('category')
  const railRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = () => {
    const el = railRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  const scrollBy = (delta: number) => railRef.current?.scrollBy({ left: delta, behavior: 'smooth' })

  const select = (label: string) => {
    const next = new URLSearchParams(params)
    if (active === label) next.delete('category')
    else next.set('category', label)
    setParams(next)
  }

  const arrow =
    'absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-bar bg-white p-2 shadow-md transition hover:scale-105'

  return (
    <div className="sticky top-[80px] z-30 border-b border-bar bg-white">
      <div className="relative mx-auto flex max-w-[1760px] items-center gap-6 px-6 md:px-10">
        {!atStart && (
          <button type="button" aria-label="Scroll categories left" className={`${arrow} left-4`} onClick={() => scrollBy(-320)}>
            <ChevronLeft className="h-3 w-3" />
          </button>
        )}

        <div
          ref={railRef}
          onScroll={sync}
          data-testid="category-bar"
          className="no-scrollbar flex flex-1 items-center gap-8 overflow-x-auto py-3"
        >
          {CATEGORIES.map((c) => {
            const on = active === c.label
            return (
              <button
                key={c.label}
                type="button"
                data-testid={`category-${c.label}`}
                aria-pressed={on}
                onClick={() => select(c.label)}
                className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-3 pt-1 text-xs transition ${
                  on
                    ? 'border-hof font-semibold text-hof'
                    : 'border-transparent text-foggy hover:border-neutral-300 hover:text-hof'
                }`}
              >
                <span className={`text-2xl leading-none transition ${on ? 'opacity-100' : 'opacity-70'}`}>
                  {c.emoji}
                </span>
                <span className="whitespace-nowrap">{c.label}</span>
              </button>
            )
          })}
        </div>

        {!atEnd && (
          <button type="button" aria-label="Scroll categories right" className={`${arrow} right-[136px]`} onClick={() => scrollBy(320)}>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}

        <button
          type="button"
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-bar px-4 py-3 text-xs font-semibold transition hover:border-hof sm:flex"
        >
          <Filters className="h-4 w-4" />
          Filters
        </button>
      </div>
    </div>
  )
}
