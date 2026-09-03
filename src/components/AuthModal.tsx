import { useState } from 'react'
import { Close } from './icons'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(email, password)
      else await signUp(email, password, fullName || email.split('@')[0])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-lg border border-neutral-400 px-4 py-3.5 text-sm outline-none transition focus:border-hof focus:ring-1 focus:ring-hof'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signin' ? 'Log in' : 'Sign up'}
        data-testid="auth-modal"
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in w-full max-w-[568px] overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="relative border-b border-bar px-6 py-4 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 transition hover:bg-neutral-100"
          >
            <Close className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold">
            {mode === 'signin' ? 'Log in' : 'Sign up'}
          </h2>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-6">
          <div>
            <h3 className="text-2xl font-semibold">Welcome to StayNest</h3>
            <p className="pt-1 text-sm text-foggy">
              {mode === 'signin'
                ? 'Log in to book, save homes and see your trips.'
                : 'Create an account to start booking.'}
            </p>
          </div>

          {mode === 'signup' && (
            <input
              className={field}
              placeholder="Full name"
              aria-label="Full name"
              data-testid="auth-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <input
            className={field}
            type="email"
            required
            placeholder="Email"
            aria-label="Email"
            data-testid="auth-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className={field}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            aria-label="Password"
            data-testid="auth-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" data-testid="auth-error" className="text-sm text-rausch">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="auth-submit"
            className="w-full rounded-lg bg-rausch py-3.5 text-base font-semibold text-white transition hover:bg-rausch-dark disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Agree and continue'}
          </button>

          <p className="text-center text-sm text-foggy">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              data-testid="auth-switch"
              className="font-semibold text-hof underline"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            >
              {mode === 'signin' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
