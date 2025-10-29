import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Server } from 'socket.io';

// Récupérer l'instance Socket.IO du serveur
function getSocketIOServer() {
  if (typeof window !== 'undefined') {
    return null; // Côté client, pas de Socket.IO
  }
  
  // Essayer de récupérer l'instance Socket.IO du serveur
  try {
    // @ts-ignore
    const globalSocket = global.io;
    if (globalSocket) {
      return globalSocket;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de Socket.IO:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Récupérer tous les avis actifs, triés par date de création (du plus récent au plus ancien)
    const reviews = await db.review.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limiter à 50 avis pour éviter de surcharger la page
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Données reçues par l\'API:', body);
    
    const { name, rating, comment, requestId, trackingCode } = body;

    // Validation des données
    if (!name || !rating || !comment) {
      console.log('Validation échouée: champs manquants', { name, rating, comment });
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      console.log('Validation échouée: rating invalide', rating);
      return NextResponse.json(
        { success: false, error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      console.log('Validation échouée: nom trop court', name);
      return NextResponse.json(
        { success: false, error: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      console.log('Validation échouée: commentaire trop court', comment);
      return NextResponse.json(
        { success: false, error: 'Le commentaire doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    // Si un trackingCode est fourni, récupérer les informations de la demande
    let serviceType = null;
    if (trackingCode) {
      try {
        const request = await db.request.findFirst({
          where: { 
            trackingCode: {
              equals: trackingCode.trim().toUpperCase(),
              not: null
            }
          },
          include: { customer: true }
        });
        
        if (request) {
          serviceType = request.type === 'TEXT' ? 'Message texte' : 'Message audio';
        }
      } catch (error) {
        console.error('Error fetching request details:', error);
      }
    }

    // Créer le nouvel avis
    const review = await db.review.create({
      data: {
        name: name.trim(),
        rating,
        comment: comment.trim(),
        requestId: requestId || null,
        trackingCode: trackingCode || null,
        serviceType: serviceType || null,
      },
    });

    console.log('Avis créé avec succès:', review);

    // Émettre un événement Socket.IO pour mettre à jour tous les clients en temps réel
    const io = getSocketIOServer();
    if (io) {
      const reviewData = {
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
      };
      
      io.emit('newReview', { review: reviewData });
      console.log('Événement newReview émis via Socket.IO');
    }

    return NextResponse.json({ 
      success: true, 
      review: {
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
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'avis' },
      { status: 500 }
    );
  }
}