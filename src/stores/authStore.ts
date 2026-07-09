import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PosyanduInfo {
  id: string
  nama: string
  rw?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: Record<string, unknown> | null
  posyandu: PosyanduInfo | null
  selectedPosyanduId: string | null
  login: (token: string, user: Record<string, unknown>, posyandu?: PosyanduInfo) => void
  logout: () => void
  setSelectedPosyanduId: (id: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: !!localStorage.getItem('token'),
      user: null,
      posyandu: null,
      selectedPosyanduId: null,
      login: (token, user, posyandu) => {
        localStorage.setItem('token', token)
        set({ isAuthenticated: true, user, posyandu: posyandu ?? null, selectedPosyanduId: posyandu?.id ?? null })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ isAuthenticated: false, user: null, posyandu: null, selectedPosyanduId: null })
      },
      setSelectedPosyanduId: (id) => set({ selectedPosyanduId: id }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user, posyandu: state.posyandu, selectedPosyanduId: state.selectedPosyanduId }),
    }
  )
)
