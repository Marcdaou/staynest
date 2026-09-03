import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from './icons'
import { todayISO } from '../lib/format'

type Field = 'where' | 'checkin' | 'checkout' | 'who' | null

/** The Airbnb pill: collapsed by default, expands into four segments on click. */
export function SearchBar() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  const [active, setActive] = useState<Field>(null)
  const [where, setWhere] = useState(params.get('where') ?? '')
  const [checkIn, setCheckIn] = useState(params.get('checkIn') ?? '')
  const [checkOut, setCheckOut] = useState(params.get('checkOut') ?? '')
  const [guests, setGuests] = useState(Number(params.get('guests') ?? 0))

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const next = new URLSearchParams()
    if (where.trim()) next.set('where', where.trim())
    if (checkIn) next.set('checkIn', checkIn)
    if (checkOut) next.set('checkOut', checkOut)
    if (guests > 0) next.set('guests', String(guests))
    setActive(null)
    navigate({ pathname: '/', search: next.toString() })
  }

  const seg = (field: Field, extra = '') =>
    `relative flex flex-col justify-center rounded-full px-6 py-2.5 text-left transition ${
      active === field ? 'bg-white shadow-[0_3px_12px_rgba(0,0,0,0.15)]' : 'hover:bg-neutral-100'
    } ${extra}`

  const label = 'text-[12px] font-semibold text-hof'
  const input =
    'w-full bg-transparent text-[14px] text-hof outline-none placeholder:text-foggy'

  return (
    <form
      ref={ref as never}
      onSubmit={submit}
      role="search"
      data-testid="search-bar"
      className="mx-auto flex w-full max-w-[850px] items-center rounded-full border border-bar bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
    >
      <div className={seg('where', 'flex-[1.2]')} onClick={() => setActive('where')}>
        <span className={label}>Where</span>
        <input
          className={input}
          placeholder="Search destinations"
          aria-label="Where"
          data-testid="search-where"
          value={where}
          onChange={(e) => setWhere(e.target.value)}
        />
      </div>

      <span className="h-8 w-px shrink-0 bg-bar" />

      <div className={seg('checkin', 'flex-1')} onClick={() => setActive('checkin')}>
        <span className={label}>Check in</span>
        <input
          type="date"
          className={input}
          aria-label="Check in"
          data-testid="search-checkin"
          min={todayISO()}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>

      <span className="h-8 w-px shrink-0 bg-bar" />

      <div className={seg('checkout', 'flex-1')} onClick={() => setActive('checkout')}>
        <span className={label}>Check out</span>
        <input
          type="date"
          className={input}
          aria-label="Check out"
          data-testid="search-checkout"
          min={checkIn || todayISO()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>

      <span className="h-8 w-px shrink-0 bg-bar" />

      <div className={seg('who', 'flex-1')} onClick={() => setActive('who')}>
        <span className={label}>Who</span>
        <input
          type="number"
          min={0}
          className={input}
          placeholder="Add guests"
          aria-label="Guests"
          data-testid="search-guests"
          value={guests || ''}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
      </div>

      <button
        type="submit"
        aria-label="Search"
        data-testid="search-submit"
        className="m-2 flex shrink-0 items-center gap-2 rounded-full bg-rausch px-4 py-3 text-white transition hover:bg-rausch-dark"
      >
        <Search className="h-3.5 w-3.5" />
        {active && <span className="text-[15px] font-semibold">Search</span>}
      </button>
    </form>
  )
}
