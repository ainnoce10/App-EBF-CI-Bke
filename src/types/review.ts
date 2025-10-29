export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  requestId?: string
  trackingCode?: string
  serviceType?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}