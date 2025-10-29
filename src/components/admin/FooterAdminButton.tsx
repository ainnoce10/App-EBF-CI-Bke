'use client'

import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { useState } from 'react'

export function FooterAdminButton() {
  const [showLogin, setShowLogin] = useState(false)

  const handleLoginClick = () => {
    setShowLogin(true)
  }

  const handleCloseLogin = () => {
    setShowLogin(false)
  }

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