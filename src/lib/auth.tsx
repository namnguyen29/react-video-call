import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const AUTH_STORAGE_KEY = 'demo-authenticated'

type DemoUser = {
  id: string
  name: string
}

export type AuthState = {
  isAuthenticated: boolean
  user: DemoUser | null
  login: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function getInitialUser() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    ? {
        id: 'demo-user',
        name: 'Demo User',
      }
    : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => getInitialUser())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      return
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [user])

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: user !== null,
      user,
      login: async () => {
        setUser({
          id: 'demo-user',
          name: 'Demo User',
        })
      },
      logout: () => {
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)

  if (!auth) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return auth
}
