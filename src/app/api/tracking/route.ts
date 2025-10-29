import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Code de suivi requis'
      }, { status: 400 })
    }

    // Rechercher la demande avec le code de suivi
    const serviceRequest = await db.request.findFirst({
      where: {
        trackingCode: {
          equals: code.trim().toUpperCase(),
          not: null
        }
      },
      include: {
        customer: true
      }
    })

    if (!serviceRequest) {
      return NextResponse.json({
        success: false,
        error: 'Code de suivi invalide'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: serviceRequest.id,
        trackingCode: serviceRequest.trackingCode,
        status: serviceRequest.status,
        customerName: serviceRequest.customer.name,
        serviceType: serviceRequest.type === 'TEXT' ? 'Message texte' : 'Message audio',
        description: serviceRequest.description || 'Aucune description',
        address: serviceRequest.customer.address || `${serviceRequest.customer.neighborhood || ''}, ${serviceRequest.customer.city}`,
        phone: serviceRequest.customer.phone,
        createdAt: serviceRequest.createdAt,
        updatedAt: serviceRequest.updatedAt
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du code de suivi:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}