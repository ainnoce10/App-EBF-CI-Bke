'use client'

import { Button } from '@/components/ui/button'
import { Shield, LogOut } from 'lucide-react'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function FooterAdminButton() {
  const [showLogin, setShowLogin] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const { isAdmin, logout, _hasHydrated } = useAuthStore()
  const router = useRouter()

  // Attendre que le store soit hydraté
  useEffect(() => {
    if (_hasHydrated) {
      setIsHydrated(true)
    } else {
      // Fallback : considérer comme hydraté après un court délai
      const timer = setTimeout(() => setIsHydrated(true), 100)
      return () => clearTimeout(timer)
    }
  }, [_hasHydrated])

  const handleLoginClick = () => {
    setShowLogin(true)
  }

  const handleCloseLogin = () => {
    setShowLogin(false)
  }

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    router.push('/')
  }

  // Ne rien afficher jusqu'à l'hydratation
  if (!isHydrated) {
    return null
  }

  // Si l'utilisateur est admin, afficher le bouton de déconnexion
  if (isAdmin) {
    return (
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="text-xs text-red-400 hover:text-red-300 transition-colors p-0 h-auto opacity-60 hover:opacity-100 flex items-center gap-1"
        title="Déconnexion administrateur"
      >
        <LogOut className="w-3 h-3" />
        Déconnexion
      </Button>
    )
  }

  // Sinon, afficher le bouton de connexion admin
  return (
    <>
      <Button
        variant="ghost"
        onClick={handleLoginClick}
        className="text-xs text-gray-600 hover:text-gray-300 transition-colors p-0 h-auto opacity-60 hover:opacity-100"
        title="Accès administrateur"
      >
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Button>
      
      {showLogin && <AdminLogin onClose={handleCloseLogin} />}
    </>
  )
}