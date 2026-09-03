import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

export const Logo = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden fill="currentColor" {...p}>
    <path d="M16 1c-1.9 0-3.4 1.1-4.4 3L3.4 20.6C2.7 22.1 2.3 23.4 2.3 24.6c0 3.2 2.4 5.4 5.7 5.4 2.6 0 4.7-1.2 6.6-3.5l1.4-1.8 1.4 1.8c1.9 2.3 4 3.5 6.6 3.5 3.3 0 5.7-2.2 5.7-5.4 0-1.2-.4-2.5-1.1-4L20.4 4c-1-1.9-2.5-3-4.4-3zm0 2.6c.9 0 1.6.6 2.2 1.8l8.2 16.6c.5 1.1.8 2 .8 2.6 0 1.8-1.3 3-3.3 3-1.9 0-3.4-.9-4.9-2.8l-2.1-2.7 1.4-1.8c1.2-1.6 1.8-3 1.8-4.4 0-2.6-2-4.5-4.6-4.5s-4.6 1.9-4.6 4.5c0 1.4.6 2.8 1.8 4.4l1.4 1.8-2.1 2.7C10.4 26.7 8.9 27.6 7 27.6c-2 0-3.3-1.2-3.3-3 0-.6.3-1.5.8-2.6L13.8 5.4c.6-1.2 1.3-1.8 2.2-1.8zm0 12.4c1.2 0 2 .8 2 2 0 .9-.4 1.8-1.3 3l-.7.9-.7-.9c-.9-1.2-1.3-2.1-1.3-3 0-1.2.8-2 2-2z" />
  </svg>
)

export const Search = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden fill="none" stroke="currentColor" strokeWidth={4} {...p}>
    <circle cx="13" cy="13" r="10" />
    <path d="M21 21l9 9" strokeLinecap="round" />
  </svg>
)

export const Globe = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
    <circle cx="8" cy="8" r="7" />
    <path d="M1 8h14M8 1c2 2.2 3 4.5 3 7s-1 4.8-3 7c-2-2.2-3-4.5-3-7s1-4.8 3-7z" />
  </svg>
)

export const Menu = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} {...p}>
    <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
  </svg>
)

export const UserCircle = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden fill="currentColor" {...p}>
    <path d="M16 .7C7.6.7.7 7.6.7 16S7.6 31.3 16 31.3 31.3 24.4 31.3 16 24.4.7 16 .7zm0 4a5.3 5.3 0 110 10.6 5.3 5.3 0 010-10.6zm0 22.6a11.3 11.3 0 01-8.4-3.7c1.6-3 5-4.9 8.4-4.9s6.8 1.9 8.4 4.9a11.3 11.3 0 01-8.4 3.7z" />
  </svg>
)

export const Star = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden fill="currentColor" {...p}>
    <path d="M15.1 1.6a1 1 0 011.8 0l4 8.2 9 1.3a1 1 0 01.6 1.7l-6.5 6.4 1.5 9a1 1 0 01-1.5 1L16 24.9l-8 4.3a1 1 0 01-1.5-1l1.5-9L1.5 12.8a1 1 0 01.6-1.7l9-1.3z" />
  </svg>
)

export const Heart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg
    viewBox="0 0 32 32"
    aria-hidden
    fill={filled ? 'var(--color-rausch)' : 'rgba(0,0,0,0.5)'}
    stroke="#fff"
    strokeWidth={2}
    {...p}
  >
    <path d="M16 28c.3 0 .6-.1.8-.3C25.6 20.2 30 15.4 30 10.4 30 6.3 26.9 3 23 3c-2.9 0-5.4 1.7-7 4.3C14.4 4.7 11.9 3 9 3 5.1 3 2 6.3 2 10.4c0 5 4.4 9.8 13.2 17.3.2.2.5.3.8.3z" />
  </svg>
)

export const ChevronLeft = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} {...p}>
    <path d="M10.5 2.5L5 8l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ChevronRight = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth={2.2} {...p}>
    <path d="M5.5 2.5L11 8l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Close = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
  </svg>
)

export const Filters = (p: P) => (
  <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} {...p}>
    <path d="M1 4h3m3 0h8M1 12h8m3 0h3" strokeLinecap="round" />
    <circle cx="5.5" cy="4" r="1.8" />
    <circle cx="10.5" cy="12" r="1.8" />
  </svg>
)

export const Superhost = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...p}>
    <path d="M12 1.5l2.6 6.4 6.9.5-5.3 4.4 1.7 6.7L12 15.9 6.1 19.5l1.7-6.7L2.5 8.4l6.9-.5z" />
  </svg>
)
