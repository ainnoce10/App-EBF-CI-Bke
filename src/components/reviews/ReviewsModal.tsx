'use client'

import { useState, useEffect } from 'react'
import { Star, Calendar, User, TrendingUp, X } from 'lucide-react'
import { toast } from 'sonner'

interface Review {
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

interface ReviewsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReviewsModal({ isOpen, onClose }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(true) // Changé à true pour afficher le formulaire par défaut
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const fetchReviews = async () => {
        try {
          const response = await fetch('/api/reviews')
          const data = await response.json()
          
          if (data.success) {
            setReviews(data.reviews)
          } else {
            toast.error('Erreur lors du chargement des avis')
          }
        } catch (error) {
          console.error('Error fetching reviews:', error)
          toast.error('Erreur de connexion')
        } finally {
          setIsLoading(false)
        }
      }

      fetchReviews()
    }
  }, [isOpen])

  // Écouter les nouveaux avis via Socket.IO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Importer dynamiquement socket.io-client
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:3000');
        
        const handleNewReview = (data) => {
          const newReview = data.review;
          setReviews(prev => [newReview, ...prev]);
          setShowForm(false);
          toast.success('Nouvel avis ajouté !');
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
  }, []);

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
      console.log('Réponse de l\'API:', data);

      if (data.success) {
        toast.success('Merci pour votre avis !')
        setNewReview({ name: '', rating: 5, comment: '' })
        setShowForm(false)
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

  // Calculer les statistiques
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const totalReviews = reviews.length

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ce que nos clients disent de nous</h2>
            <p className="text-gray-600">Découvrez les avis de nos clients à Bouaké</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Statistiques */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Statistiques
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {averageRating}
                    </div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                    <div className="text-base font-semibold text-gray-800">
                      {totalReviews}+ clients satisfaits
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6">{rating}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-6">{count}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Star className="w-4 h-4" />
                    {showForm ? 'Masquer le formulaire' : 'Ajouter un avis'}
                  </button>
                </div>
              </div>

              {/* Formulaire d'avis */}
              {showForm && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-3">Donnez votre avis</h4>
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={newReview.name}
                        onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Note</label>
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
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
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
                      <textarea
                        placeholder="Votre commentaire..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={3}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting || !newReview.name.trim() || !newReview.comment.trim()}
                      className={`w-full py-2 px-4 rounded-md transition-colors text-sm ${
                        isSubmitting || !newReview.name.trim() || !newReview.comment.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Liste des avis */}
            <div className="md:col-span-2">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun avis pour le moment</p>
                  <p className="text-sm text-gray-400 mt-1">Soyez le premier à donner votre avis !</p>
                </div>
              ) : (
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
                      
                      {(review.requestId || review.trackingCode) && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}