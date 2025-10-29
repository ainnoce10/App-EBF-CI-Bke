'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff, X } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'

interface AdminLoginProps {
  onClose?: () => void
}

export function AdminLogin({ onClose }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = login(password)
      if (success) {
        toast.success('Connexion administrateur réussie')
        setPassword('')
        // Fermer le modal après connexion réussie
        if (onClose) {
          setTimeout(() => {
            onClose()
          }, 500) // Laisser le temps au toast de s'afficher
        }
      } else {
        toast.error('Mot de passe incorrect')
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-center">
              <Lock className="h-5 w-5" />
              Connexion Administrateur
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe administrateur"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Espace réservé aux administrateurs d'EBF Bouaké
          </p>
        </CardContent>
      </Card>
    </div>
  )
}