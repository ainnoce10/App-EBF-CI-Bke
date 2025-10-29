'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AdminLogin } from './AdminLogin'
import { AdminNotificationIcon } from '@/components/notifications/AdminNotificationIcon'

export function AdminAccessButton() {
  const [showLogin, setShowLogin] = useState(false)
  const [authKey, setAuthKey] = useState(0) // Forcer le re-rendu
  const { isAdmin, login } = useAuthStore()

  const handleCloseLogin = () => {
    setShowLogin(false)
    // Forcer un re-rendu après la fermeture
    setTimeout(() => setAuthKey(prev => prev + 1), 100)
  }

  const handleLogin = (password: string) => {
    const success = login(password)
    if (success) {
      // Forcer un re-rendu après connexion réussie
      setTimeout(() => setAuthKey(prev => prev + 1), 100)
    }
    return success
  }

  if (isAdmin) {
    return (
      <div key={authKey}>
        <AdminNotificationIcon />
        {showLogin && <AdminLogin onClose={handleCloseLogin} />}
      </div>
    )
  }

  return (
    <div key={authKey}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowLogin(true)}
        className="flex items-center gap-2 hover:bg-gray-100"
        title="Accès administrateur"
      >
        <Shield className="h-4 w-4 text-gray-600" />
      </Button>
      {showLogin && <AdminLogin onClose={handleCloseLogin} />}
    </div>
  )
}