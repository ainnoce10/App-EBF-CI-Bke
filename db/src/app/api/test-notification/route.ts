import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, content, type = 'CONTACT', priority = 'MEDIUM' } = await request.json()

    // Créer un nouveau message de test
    const message = await db.message.create({
      data: {
        name: name || 'Client Test',
        email: email || 'test@example.com',
        subject: subject || 'Message de test',
        content: content || 'Ceci est un message de test pour vérifier le système de notifications.',
        type,
        priority,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Message de test créé avec succès',
      data: message
    })
  } catch (error) {
    console.error('Erreur lors de la création du message de test:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du message de test' },
      { status: 500 }
    )
  }
}