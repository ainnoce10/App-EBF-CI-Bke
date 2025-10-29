'use client'

import { useState, useEffect } from 'react'
import { Star, X } from 'lucide-react'
import { toast } from 'sonner'

interface SimpleReviewFormProps {
  isOpen: boolean
  onClose: () => void
}

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function SimpleReviewForm({ isOpen, onClose }: SimpleReviewFormProps) {
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Réinitialiser le formulaire à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setNewReview({ name: '', rating: 5, comment: '' })
    }
  }, [isOpen])

  // Écouter les nouveaux avis via Socket.IO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Importer dynamiquement socket.io-client
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:3000');
        
        const handleNewReview = (data) => {
          toast.success('Merci pour votre avis ! Il a été ajouté avec succès.');
          onClose();
        };

        socket.on('newReview', handleNewReview);

        return () => {
          socket.off('newReview', handleNewReview);
          socket.disconnect();
        };
      }).catch(error => {
        console.error('Erreur lors du chargement de Socket.IO:', error);
      });
    }
  }, [onClose]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Tentative de soumission d\'avis:', newReview);
    
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
      const reviewData = {
        name: newReview.name.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      };
      
      console.log('Données envoyées à l\'API:', reviewData);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Merci pour votre avis !')
        setNewReview({ name: '', rating: 5, comment: '' })
        onClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Donner votre avis</h2>
            <p className="text-gray-600 text-sm">Partagez votre expérience avec EBF Bouaké</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <div className="p-6">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                    <Star className="w-6 h-6 fill-current" />
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
                rows={4}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newReview.name.trim() || !newReview.comment.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isSubmitting || !newReview.name.trim() || !newReview.comment.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer mon avis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}