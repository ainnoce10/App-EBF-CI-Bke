import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const TRACKING_DATA_DIR = path.join(process.cwd(), 'data');
const TRACKING_FILE = path.join(TRACKING_DATA_DIR, 'tracking.json');

async function loadTrackingData(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(TRACKING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.log('Fichier tracking.json non trouvé');
    return {};
  }
}

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

    const trackingData = await loadTrackingData();
    const request_data = trackingData[code];

    if (!request_data) {
      console.log('Code de suivi non trouvé:', code);
      return NextResponse.json({
        success: false,
        error: 'Code de suivi invalide ou demande non trouvée'
      }, { status: 404 })
    }

    console.log('✅ Code de suivi trouvé:', code);
    return NextResponse.json({
      success: true,
      data: request_data
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du code de suivi:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}