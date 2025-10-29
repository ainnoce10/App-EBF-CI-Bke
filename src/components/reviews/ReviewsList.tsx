'use client'

import { Star, Calendar, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  trackingCode?: string
  serviceType?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ReviewsListProps {
  reviews: Review[]
  showTitle?: boolean
}

export function ReviewsList({ reviews, showTitle = false }: ReviewsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return null
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Avis des clients
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 text-sm">{review.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.date)}</span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
              
              {(review.trackingCode || review.serviceType) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {review.trackingCode && (
                      <span>Code: {review.trackingCode}</span>
                    )}
                    {review.serviceType && (
                      <span>Service: {review.serviceType}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}