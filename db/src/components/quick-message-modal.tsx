'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, Calendar, Clock, Tag, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  content: string
  type: 'CONTACT' | 'REQUEST' | 'COMPLAINT' | 'INFO'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'UNREAD' | 'READ' | 'ANSWERED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

interface QuickMessageModalProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (messageId: string) => void
  onReply: (messageId: string) => void
}

export default function QuickMessageModal({
  message,
  isOpen,
  onClose,
  onMarkAsRead,
  onReply
}: QuickMessageModalProps) {
  if (!message) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CONTACT': return 'bg-blue-100 text-blue-800'
      case 'REQUEST': return 'bg-purple-100 text-purple-800'
      case 'COMPLAINT': return 'bg-red-100 text-red-800'
      case 'INFO': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNREAD': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'READ': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'ANSWERED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ARCHIVED': return <CheckCircle className="h-4 w-4 text-gray-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {message.subject}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(message.status)}
              <Badge className={getPriorityColor(message.priority)}>
                {message.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations de contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{message.name}</span>
              </div>
              <div className="text-sm text-gray-600 ml-6">
                {message.email}
              </div>
              {message.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                  <Phone className="h-3 w-3" />
                  {message.phone}
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(message.createdAt), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </span>
              </div>
              <div className="flex justify-end">
                <Badge className={getTypeColor(message.type)}>
                  <Tag className="h-3 w-3 mr-1" />
                  {message.type}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contenu du message */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Message</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              ID: {message.id}
            </div>
            <div className="flex items-center gap-2">
              {message.status === 'UNREAD' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsRead(message.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme lu
                </Button>
              )}
              <Button
                onClick={() => onReply(message.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Répondre
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}