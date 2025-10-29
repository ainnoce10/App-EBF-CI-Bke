'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, X, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { useMessageStore } from '@/lib/stores/message-store'
import { toast } from 'sonner'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  content: string
  type: 'CONTACT' | 'REQUEST' | 'COMPLAINT' | 'INFO'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
}

export function NotificationIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const { unreadCount, notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore()
  const { fetchMessages, updateMessageStatus } = useMessageStore()
  const [isAnimating, setIsAnimating] = useState(false)

  // Effet de clignotement pour les notifications non lues
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

  // Écouter les événements personnalisés pour ouvrir directement un message
  useEffect(() => {
    const handleOpenNotificationModal = (event: CustomEvent) => {
      const message = event.detail
      setSelectedMessage(message)
      setIsOpen(false)
      
      // Marquer la notification comme lue si elle existe
      const notification = notifications.find(n => n.message.id === message.id)
      if (notification) {
        markAsRead(notification.id)
      }
    }

    window.addEventListener('open-notification-modal', handleOpenNotificationModal as EventListener)
    
    return () => {
      window.removeEventListener('open-notification-modal', handleOpenNotificationModal as EventListener)
    }
  }, [notifications, markAsRead])

  // Rafraîchir les messages périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages()
    }, 30000) // Toutes les 30 secondes

    return () => clearInterval(interval)
  }, [fetchMessages])

  const handleNotificationClick = (notification: any) => {
    setSelectedMessage(notification.message)
    markAsRead(notification.id)
    setIsOpen(false)
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateMessageStatus(messageId, 'IN_PROGRESS')
      toast.success('Message marqué comme en cours')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleMarkAsResolved = async (messageId: string) => {
    try {
      await updateMessageStatus(messageId, 'RESOLVED')
      toast.success('Message marqué comme résolu')
      setSelectedMessage(null)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CONTACT': return '📧'
      case 'REQUEST': return '📋'
      case 'COMPLAINT': return '⚠️'
      case 'INFO': return 'ℹ️'
      default: return '📄'
    }
  }

  return (
    <>
      {/* Icône de notification avec effet de clignotement */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 transition-all duration-300 ${
            isAnimating && unreadCount > 0 
              ? 'animate-pulse bg-red-100 hover:bg-red-200' 
              : 'hover:bg-gray-100'
          }`}
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

        {/* Panneau de notifications */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllAsRead()}
                        className="text-xs"
                      >
                        Tout marquer comme lu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucune notification
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="p-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.read 
                              ? 'hover:bg-gray-50' 
                              : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="text-xl">
                                {getTypeIcon(notification.message.type)}
                              </div>
                              <div className={`w-2 h-2 rounded-full mt-1 ${getPriorityColor(notification.message.priority)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">
                                  {notification.message.name}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: fr
                                  })}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.message.subject}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {notification.message.content}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {notification.message.type}
                                </Badge>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    notification.message.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                    notification.message.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                    notification.message.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {notification.message.priority}
                                </Badge>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal pour afficher le contenu du message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {getTypeIcon(selectedMessage.type)} {selectedMessage.subject}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {/* Informations sur l'expéditeur */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom</p>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <Badge variant="outline">{selectedMessage.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Priorité</p>
                      <Badge 
                        variant="secondary"
                        className={
                          selectedMessage.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          selectedMessage.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          selectedMessage.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {selectedMessage.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Statut</p>
                      <Badge 
                        variant="outline"
                        className={
                          selectedMessage.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          selectedMessage.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          selectedMessage.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {selectedMessage.status === 'PENDING' ? 'En attente' :
                         selectedMessage.status === 'IN_PROGRESS' ? 'En cours' :
                         selectedMessage.status === 'RESOLVED' ? 'Résolu' :
                         'Fermé'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(selectedMessage.createdAt), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Contenu du message */}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {selectedMessage.status === 'PENDING' && (
                      <Button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Marquer comme en cours
                      </Button>
                    )}
                    {selectedMessage.status !== 'RESOLVED' && selectedMessage.status !== 'CLOSED' && (
                      <Button
                        variant="outline"
                        onClick={() => handleMarkAsResolved(selectedMessage.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCheck className="h-4 w-4" />
                        Marquer comme résolu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedMessage(null)}
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}