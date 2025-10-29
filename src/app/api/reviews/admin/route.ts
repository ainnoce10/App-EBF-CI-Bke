import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { useAuthStore } from '@/lib/stores/auth-store';

// Fonction pour vérifier l'authentification admin
async function isAdminAuthenticated(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return false;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const adminToken = cookies['admin_token'];
    if (!adminToken) return false;
    
    // Vérifier le token avec le store d'authentification
    // Note: Dans un environnement serveur, nous ne pouvons pas accéder directement au store
    // Nous allons utiliser une vérification simple basée sur un token prédéfini
    // Dans une application réelle, vous utiliseriez JWT ou une session sécurisée
    
    // Pour l'instant, nous allons considérer que l'admin est authentifié si le token existe
    // Vous devriez implémenter une vérification plus sécurisée en production
    return adminToken === 'admin_authenticated';
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const isAuthenticated = await isAdminAuthenticated(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'avis manquant' },
        { status: 400 }
      );
    }

    // Vérifier si l'avis existe
    const existingReview = await db.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Avis non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'avis (désactiver au lieu de supprimer physiquement)
    await db.review.update({
      where: { id: reviewId },
      data: { isActive: false }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Avis supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'avis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const isAuthenticated = await isAdminAuthenticated(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer tous les avis (actifs et inactifs) pour l'admin
    const reviews = await db.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formater les avis pour le frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split('T')[0],
      requestId: review.requestId,
      trackingCode: review.trackingCode,
      serviceType: review.serviceType,
      isActive: review.isActive,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}