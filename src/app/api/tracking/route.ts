import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database'

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
    const requestsResult = await databaseService.safeFindMany('request', {
      where: {
        trackingCode: code.trim().toUpperCase()
      },
      include: {
        customer: true
      }
    })

    if (requestsResult.error || !requestsResult.data || requestsResult.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Code de suivi invalide'
      }, { status: 404 })
    }

    const serviceRequest = requestsResult.data[0]

    return NextResponse.json({
      success: true,
      data: {
        id: serviceRequest.id,
        trackingCode: serviceRequest.trackingCode,
        status: serviceRequest.status,
        customerName: serviceRequest.customer?.name || 'Client inconnu',
        serviceType: serviceRequest.type === 'TEXT' ? 'Message texte' : 'Message audio',
        description: serviceRequest.description || 'Aucune description',
        address: serviceRequest.customer?.neighborhood 
          ? `${serviceRequest.customer.neighborhood}, ${serviceRequest.customer.city || 'Bouaké'}`
          : serviceRequest.customer?.city || 'Bouaké',
        phone: serviceRequest.customer?.phone || '',
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