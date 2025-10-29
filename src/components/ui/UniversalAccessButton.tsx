'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, Search } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { AdminNotificationIcon } from '@/components/notifications/AdminNotificationIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

export function UniversalAccessButton() {
  const [showLogin, setShowLogin] = useState(false)
  const [authKey, setAuthKey] = useState(0) // Forcer le re-rendu
  const [trackingCode, setTrackingCode] = useState('')
  const [isTracking, setIsTracking] = useState(false)
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

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingCode.trim()) {
      toast.error('Veuillez entrer un code de suivi')
      return
    }

    setIsTracking(true)
    try {
      const response = await fetch(`/api/tracking?code=${encodeURIComponent(trackingCode.trim())}`)
      const data = await response.json()

      if (data.success) {
        // Rediriger vers la page de suivi avec le code
        window.location.href = `/tracking/${trackingCode.trim()}`
      } else {
        toast.error(data.error || 'Code de suivi invalide')
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification du code')
      console.error('Tracking error:', error)
    } finally {
      setIsTracking(false)
    }
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
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100 animate-pulse"
            title="Suivre votre demande ou accès administrateur"
          >
            <Search className="h-4 w-4 text-blue-600" />
          </Button>
          <span className="text-xs text-blue-600 mt-1 animate-pulse text-center">Suivre sa demande ici</span>
        </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Suivre votre demande</DialogTitle>
            <DialogDescription>
              Entrez votre code de suivi pour vérifier l'état de votre demande
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTrackingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-code">Code de suivi</Label>
              <Input
                id="tracking-code"
                placeholder="Ex: EBF-1234"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setTrackingCode('')}>
                Annuler
              </Button>
              <Button type="submit" disabled={isTracking}>
                {isTracking ? 'Vérification...' : 'Suivre'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Garder le bouton admin pour la connexion */}
      {showLogin && <AdminLogin onClose={handleCloseLogin} />}
    </div>
  )
}