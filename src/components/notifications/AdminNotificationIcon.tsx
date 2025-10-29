'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useMessageStore } from '@/lib/stores/message-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AdminNotificationIcon() {
  const [isAnimating, setIsAnimating] = useState(false)
  const { isAdmin, logout } = useAuthStore()
  const { messages, fetchMessages } = useMessageStore()
  const router = useRouter()

  // Calculer le nombre de messages non lus
  const unreadCount = messages.filter(msg => msg.status === 'PENDING' || msg.status === 'UNREAD').length

  // Effet de clignotement pour les messages non lus
  useEffect(() => {
    if (unreadCount > 0) {
      const interval = setInterval(() => {
        setIsAnimating(prev => !prev)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setIsAnimating(false)
    }
  }, [unreadCount])

  // Rafraîchir les messages périodiquement
  useEffect(() => {
    if (isAdmin) {
      fetchMessages()
      const interval = setInterval(() => {
        fetchMessages()
      }, 30000) // Toutes les 30 secondes
      return () => clearInterval(interval)
    }
  }, [isAdmin, fetchMessages])

  // Écouter les événements de nouveaux messages
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      // Rafraîchir les messages quand un nouveau message est créé
      fetchMessages()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('newMessage', handleNewMessage as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newMessage', handleNewMessage as EventListener);
      }
    };
  }, [fetchMessages])

  const handleNotificationClick = () => {
    // Rediriger directement vers la page des messages
    router.push('/messages')
  }

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
  }

  // Ne pas afficher si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Icône de notification avec effet de clignotement */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNotificationClick}
          className={`relative p-2 transition-all duration-300 ${
            isAnimating && unreadCount > 0 
              ? 'animate-pulse bg-red-100 hover:bg-red-200' 
              : 'hover:bg-gray-100'
          }`}
          title="Voir les messages"
        >
          {unreadCount > 0 ? (
            <BellRing className={`h-5 w-5 ${isAnimating ? 'text-red-600' : 'text-gray-700'}`} />
          ) : (
            <Bell className="h-5 w-5 text-gray-600" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-bounce"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Bouton de déconnexion admin */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="p-2 hover:bg-gray-100"
        title="Déconnexion"
      >
        <LogOut className="h-4 w-4 text-gray-600" />
      </Button>
    </div>
  )
}