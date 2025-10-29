'use client'

import { useEffect, useState, useRef } from 'react'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { useMessageStore } from '@/lib/stores/message-store'
import { toast } from 'sonner'

export function useRealTimeMessages() {
  const { addNotification } = useNotificationStore()
  const { messages, fetchMessages } = useMessageStore()
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const lastProcessedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Charger les messages initiaux
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    // Vérifier les nouveaux messages toutes les 5 secondes
    const interval = setInterval(async () => {
      if (isProcessing) return // Éviter les traitements simultanés
      
      try {
        setIsProcessing(true)
        const response = await fetch('/api/messages?limit=10')
        const data = await response.json()
        
        if (data.messages && Array.isArray(data.messages)) {
          const currentMessageIds = new Set(data.messages.map((m: any) => m.id))
          const newMessages = data.messages.filter((message: any) => !lastProcessedIds.current.has(message.id))
          
          if (newMessages.length > 0) {
            // Traiter uniquement les nouveaux messages
            newMessages.forEach((message: any) => {
              // Ajouter une notification pour chaque nouveau message
              addNotification(message)
              
              // Afficher une notification toast sans clignotement excessif
              if (message.priority === 'URGENT' || message.priority === 'HIGH') {
                toast.error(`Nouveau message urgent de ${message.senderName || message.name}: ${message.subject}`, {
                  duration: 5000,
                  action: {
                    label: 'Voir',
                    onClick: () => {
                      // Ouvrir le modal du message
                      const event = new CustomEvent('open-message', { detail: message })
                      window.dispatchEvent(event)
                    }
                  }
                })
              } else {
                toast.success(`Nouveau message de ${message.senderName || message.name}: ${message.subject}`, {
                  duration: 3000,
                  action: {
                    label: 'Voir',
                    onClick: () => {
                      const event = new CustomEvent('open-message', { detail: message })
                      window.dispatchEvent(event)
                    }
                  }
                })
              }
            })
            
            // Mettre à jour les IDs traités
            lastProcessedIds.current = currentMessageIds
          }
          
          setLastMessageCount(data.messages.length)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des nouveaux messages:', error)
      } finally {
        setIsProcessing(false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [addNotification, lastMessageCount, fetchMessages, isProcessing])

  // Écouter les événements personnalisés pour ouvrir les messages
  useEffect(() => {
    const handleOpenMessage = (event: CustomEvent) => {
      const message = event.detail
      // Déclencher l'ouverture du modal dans le composant NotificationIcon
      const openEvent = new CustomEvent('open-notification-modal', { detail: message })
      window.dispatchEvent(openEvent)
    }

    window.addEventListener('open-message', handleOpenMessage as EventListener)
    
    return () => {
      window.removeEventListener('open-message', handleOpenMessage as EventListener)
    }
  }, [])
}