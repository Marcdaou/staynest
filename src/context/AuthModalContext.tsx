import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AuthModal } from '../components/AuthModal'

const AuthModalContext = createContext<{ open: () => void } | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])

  return (
    <AuthModalContext.Provider value={{ open }}>
      {children}
      {isOpen && <AuthModal onClose={() => setIsOpen(false)} />}
    </AuthModalContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider')
  return ctx
}
