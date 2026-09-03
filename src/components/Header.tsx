import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Logo, Menu, UserCircle } from './icons'
import { SearchBar } from './SearchBar'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'

export function Header({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAuth()
  const { open } = useAuthModal()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const item =
    'block w-full px-4 py-2.5 text-left text-sm text-hof transition hover:bg-neutral-100'

  return (
    <header className="sticky top-0 z-40 border-b border-bar bg-white">
      <div className="mx-auto flex max-w-[1760px] items-center gap-4 px-6 py-4 md:px-10">
        <Link to="/" aria-label="StayNest home" className="flex shrink-0 items-center gap-1.5">
          <Logo className="h-8 w-8 text-rausch" />
          <span className="hidden text-xl font-bold tracking-tight text-rausch lg:block">
            staynest
          </span>
        </Link>

        <div className={`min-w-0 flex-1 ${compact ? 'max-w-md' : ''}`}>
          <SearchBar />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/hosting"
            className="hidden rounded-full px-4 py-3 text-sm font-semibold text-hof transition hover:bg-neutral-100 lg:block"
          >
            StayNest your home
          </Link>
          <button
            type="button"
            aria-label="Choose a language"
            className="rounded-full p-3 transition hover:bg-neutral-100"
          >
            <Globe className="h-4 w-4" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-testid="profile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-3 rounded-full border border-bar py-1.5 pl-3 pr-1.5 transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
            >
              <Menu className="h-4 w-4" />
              <UserCircle className="h-7 w-7 text-neutral-500" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="animate-fade-in absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white py-2 shadow-[0_2px_16px_rgba(0,0,0,0.12)]"
              >
                {user ? (
                  <>
                    <div className="border-b border-neutral-200 px-4 pb-2 text-sm font-semibold">
                      {user.user_metadata?.full_name ?? user.email}
                    </div>
                    <button className={item} onClick={() => { setMenuOpen(false); navigate('/trips') }}>
                      Trips
                    </button>
                    <button className={item} onClick={() => { setMenuOpen(false); navigate('/wishlists') }}>
                      Wishlists
                    </button>
                    <button
                      className={`${item} border-t border-neutral-200`}
                      data-testid="sign-out"
                      onClick={async () => { setMenuOpen(false); await signOut(); navigate('/') }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${item} font-semibold`}
                      data-testid="header-signup"
                      onClick={() => { setMenuOpen(false); open() }}
                    >
                      Sign up
                    </button>
                    <button
                      className={item}
                      data-testid="header-login"
                      onClick={() => { setMenuOpen(false); open() }}
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
