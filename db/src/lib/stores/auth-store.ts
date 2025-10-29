'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAdmin: boolean
  adminPassword: string
  login: (password: string) => boolean
  logout: () => void
  checkAdminStatus: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      adminPassword: 'ebf2024', // Mot de passe admin simple

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
      partialize: (state) => ({
        isAdmin: state.isAdmin
      })
    }
  )
)