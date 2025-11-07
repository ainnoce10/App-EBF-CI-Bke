'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthStore {
  isAdmin: boolean
  adminPassword: string
  login: (password: string) => boolean
  logout: () => void
  checkAdminStatus: () => boolean
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminPassword: 'ebf2024', // Mot de passe admin simple
      _hasHydrated: false,
      
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },

      login: (password: string) => {
        const { adminPassword } = get()
        if (password === adminPassword) {
          set({ isAdmin: true })
          return true
        }
        return false
      },

      logout: () => {
        set({ isAdmin: false })
      },

      checkAdminStatus: () => {
        return get().isAdmin
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        isAdmin: state.isAdmin
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)