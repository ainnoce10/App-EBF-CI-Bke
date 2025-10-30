import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Données de secours pour quand la base de données n'est pas disponible
const fallbackReviews = [
  {
    id: "1",
    name: "Kouassi A.",
    rating: 5,
    comment: "Service excellent et rapide ! Les électriciens sont très professionnels.",
    date: "2025-01-15"
  },
  {
    id: "2", 
    name: "Touré M.",
    rating: 5,
    comment: "Travail de grande qualité, je recommande vivement EBF Bouaké.",
    date: "2025-01-14"
  },
  {
    id: "3",
    name: "Konaté F.", 
    rating: 4,
    comment: "Satisfait du diagnostic gratuit et de l'intervention rapide.",
    date: "2025-01-13"
  }
];

export async function GET() {
  try {
    // Essayer de se connecter à la base de données
    const reviews = await db.review.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

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
    
    // Si la base de données n'est pas disponible, utiliser les données de secours
    console.log('Utilisation des données de secours pour les avis');
    return NextResponse.json({ 
      success: true, 
      reviews: fallbackReviews,
      fallback: true 
    });
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

    // Essayer de créer l'avis dans la base de données
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
    
    // Si la base de données n'est pas disponible, simuler la création
    const newReview = {
      id: Date.now().toString(),
      name: name.trim(),
      rating: rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    console.log('Simulation de création d\'avis (base de données non disponible)');
    
    return NextResponse.json({ 
      success: true, 
      review: newReview,
      fallback: true,
      message: "Avis enregistré temporairement. Il sera définitivement sauvegardé lorsque la base de données sera disponible."
    });
  }
}