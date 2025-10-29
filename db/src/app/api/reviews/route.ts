import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const { name, rating, comment } = body;

    // Validation des données
    if (!name || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Le commentaire doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    // Créer le nouvel avis
    const review = await db.review.create({
      data: {
        name: name.trim(),
        rating,
        comment: comment.trim(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      review: {
        id: review.id,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt.toISOString().split('T')[0],
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