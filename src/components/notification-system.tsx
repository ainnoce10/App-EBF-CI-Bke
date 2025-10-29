'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageSquare, X, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  content: string
  type: 'CONTACT' | 'REQUEST' | 'COMPLAINT' | 'INFO'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'UNREAD' | 'READ' | 'ANSWERED' | 'ARCHIVED'
  createdAt: string
}

interface NotificationProps {
  messages: Message[]
  onMessageClick: (message: Message) => void
  onMarkAsRead: (messageId: string) => void
  onMarkAllAsRead: () => void
}

export default function NotificationSystem({ 
  messages, 
  onMessageClick, 
  onMarkAsRead,
  onMarkAllAsRead 
}: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculer le nombre de messages non lus
  useEffect(() => {
    const unread = messages.filter(m => m.status === 'UNREAD').length
    setUnreadCount(unread)
    
    // Déclencher l'animation quand il y a de nouveaux messages
    if (unread > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [messages])

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
      case 'CONTACT': return <MessageSquare className="h-4 w-4" />
      case 'REQUEST': return <Bell className="h-4 w-4" />
      case 'COMPLAINT': return <Bell className="h-4 w-4" />
      case 'INFO': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const unreadMessages = messages.filter(m => m.status === 'UNREAD')

  return (
    <div className="relative">
      {/* Bouton de notification avec animation */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-all duration-300 ${
          isAnimating && unreadCount > 0 
            ? 'animate-pulse bg-red-50 border-red-300' 
            : 'hover:bg-gray-50'
        }`}
      >
        <Bell className={`h-5 w-5 ${
          isAnimating && unreadCount > 0 
            ? 'text-red-600 animate-bounce' 
            : 'text-gray-600'
        }`} />
        
        {/* Badge avec compteur */}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panneau de notifications */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 shadow-lg border z-50 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tout marquer comme lu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {unreadMessages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune nouvelle notification</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="p-2">
                  {unreadMessages.map((message) => (
                    <div
                      key={message.id}
                      className="mb-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                      onClick={() => {
                        onMessageClick(message)
                        onMarkAsRead(message.id)
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(message.type)}
                          <span className="font-medium text-sm">{message.name}</span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsRead(message.id)
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="mb-2">
                        <p className="font-medium text-sm text-gray-900 mb-1">
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {message.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}