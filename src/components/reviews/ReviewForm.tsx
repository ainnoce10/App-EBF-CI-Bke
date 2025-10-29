'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

interface ReviewFormProps {
  trackingCode: string
  onSubmit: () => void
}

export function ReviewForm({ trackingCode, onSubmit }: ReviewFormProps) {
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newReview.name.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }
    
    if (!newReview.comment.trim()) {
      toast.error('Veuillez laisser un commentaire')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newReview.name.trim(),
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          trackingCode: trackingCode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Merci pour votre avis !')
        setNewReview({ name: '', rating: 5, comment: '' })
        onSubmit()
      } else {
        toast.error(data.error || 'Erreur lors de la soumission de l\'avis')
      }
    } catch (error) {
      console.error('Review submission error:', error)
      toast.error('Erreur de connexion. Veuillez réessayer plus tard.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingChange = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }))
  }

  return (
    <form onSubmit={handleSubmitReview} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre nom *
        </label>
        <input
          type="text"
          placeholder="Entrez votre nom"
          value={newReview.name}
          onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`p-1 rounded-full transition-colors ${
                star <= newReview.rating
                  ? 'text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
              onClick={() => handleRatingChange(star)}
              disabled={isSubmitting}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {newReview.rating}/5
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre commentaire *
        </label>
        <textarea
          placeholder="Dites-nous ce que vous avez pensé de notre service..."
          value={newReview.comment}
          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
          rows={3}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !newReview.name.trim() || !newReview.comment.trim()}
          className={`flex-1 px-4 py-2 rounded-md transition-colors disabled:opacity-50 text-sm ${
            isSubmitting || !newReview.name.trim() || !newReview.comment.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  )
}