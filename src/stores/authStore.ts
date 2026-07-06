import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  user: Record<string, unknown> | null
  login: (token: string, user: Record<string, unknown>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ isAuthenticated: true, user })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ isAuthenticated: false, user: null })
  },
}))
