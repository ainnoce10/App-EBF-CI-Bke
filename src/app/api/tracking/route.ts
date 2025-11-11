import { NextRequest, NextResponse } from 'next/server'

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

    // Placeholder: In a full implementation, would query database
    // For now, return a stub response indicating tracking code is not found
    return NextResponse.json({
      success: false,
      error: 'Code de suivi invalide ou demande non trouvée'
    }, { status: 404 })

  } catch (error) {
    console.error('Erreur lors de la vérification du code de suivi:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}