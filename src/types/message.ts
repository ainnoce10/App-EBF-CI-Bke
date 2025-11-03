export interface AppMessage {
  id: string

  // Sender info
  name?: string
  senderName?: string
  email?: string
  senderEmail?: string
  phone?: string
  senderPhone?: string

  // Content
  subject?: string
  content?: string

  // Classification
  type?:
    | 'REQUEST'
    | 'CONTACT'
    | 'REVIEW'
    | 'SYSTEM'
    | 'COMPLAINT'
    | 'INFO'
  priority?: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status?:
    | 'UNREAD'
    | 'READ'
    | 'ARCHIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'URGENT'
    | 'PENDING'
    | 'RESOLVED'
    | 'CLOSED'
    | 'ANSWERED'

  // Media
  audioUrl?: string
  photoUrl?: string

  // Timestamps
  createdAt: string
  updatedAt?: string

  // Optional relation
  request?: any
}

export type Message = AppMessage
