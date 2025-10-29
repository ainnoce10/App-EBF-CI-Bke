'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewsList } from '@/components/reviews/ReviewsList'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  Wrench,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { Review } from '@/types/review'

interface RequestData {
  id: string
  trackingCode: string
  status: string
  customerName: string
  serviceType: string
  description: string
  address: string
  phone: string
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Votre demande a été reçue et est en attente de traitement'
  },
  CONFIRMED: {
    icon: CheckCircle,
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Votre demande a été confirmée et sera traitée prochainement'
  },
  IN_PROGRESS: {
    icon: Wrench,
    label: 'En cours',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Un technicien est en train de traiter votre demande'
  },
  COMPLETED: {
    icon: CheckCircle,
    label: 'Terminée',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Votre demande a été traitée avec succès'
  },
  CANCELLED: {
    icon: XCircle,
    label: 'Annulée',
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Votre demande a été annulée'
  }
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const [requestData, setRequestData] = useState<RequestData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const trackingCode = params.code as string

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        const response = await fetch(`/api/tracking?code=${encodeURIComponent(trackingCode)}`)
        const data = await response.json()

        if (data.success) {
          setRequestData(data.data)
        } else {
          setError(data.error || 'Code de suivi invalide')
        }
      } catch (error) {
        setError('Erreur lors du chargement des données')
        console.error('Tracking error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        const data = await response.json()
        
        if (data.success) {
          // Filtrer les avis pour ce tracking code spécifique
          const filteredReviews = data.reviews.filter((review: Review) => 
            review.trackingCode === trackingCode
          )
          setReviews(filteredReviews)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    if (trackingCode) {
      fetchRequestData()
      fetchReviews()
    }
  }, [trackingCode])

  // Écouter les nouveaux avis via Socket.IO
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Importer dynamiquement socket.io-client
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:3000');
        
        const handleNewReview = (data) => {
          const newReview = data.review;
          if (newReview.trackingCode === trackingCode) {
            setReviews(prev => [newReview, ...prev]);
            setShowReviewForm(false);
            toast.success('Merci pour votre avis !');
          }
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
  }, [trackingCode]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
          
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !requestData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
          
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Code de suivi invalide
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'Le code de suivi que vous avez entré n\'existe pas.'}
                </p>
                <Button onClick={() => router.push('/')}>
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[requestData.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <div className="space-y-6">
          {/* En-tête avec statut */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Suivi de votre demande
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    Code: {requestData.trackingCode}
                  </p>
                </div>
                <Badge className={`${statusInfo.color} border px-3 py-1`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{statusInfo.description}</p>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Nom:</span>
                  <span>{requestData.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Téléphone:</span>
                  <span>{requestData.phone}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <span className="font-medium">Adresse:</span>
                <span>{requestData.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Détails de la demande */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Détails de la demande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Type de service:</span>
                  <p className="text-gray-700 mt-1">{requestData.serviceType}</p>
                </div>
                <div>
                  <span className="font-medium">Statut:</span>
                  <p className="text-gray-700 mt-1">{statusInfo.label}</p>
                </div>
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-gray-700 mt-1">{requestData.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Demande créée le:</span>
                <span>{formatDate(requestData.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Dernière mise à jour:</span>
                <span>{formatDate(requestData.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Section Avis - Toujours visible pour le débogage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Votre avis compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                {requestData.status === 'COMPLETED' 
                  ? "Votre demande a été traitée avec succès. Nous serions ravis d'avoir votre avis sur notre service !"
                  : "Votre avis est important pour nous ! Partagez votre expérience."
                }
              </p>
              
              {!showReviewForm ? (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="w-full"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Donner mon avis
                </Button>
              ) : (
                <ReviewForm 
                  trackingCode={trackingCode}
                  onSubmit={() => setShowReviewForm(false)}
                />
              )}
            </CardContent>
          </Card>

          {/* Avis existants */}
          {reviews.length > 0 && (
            <ReviewsList 
              reviews={reviews} 
              showTitle={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}