import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Support for both primary path and /tmp fallback (serverless environments)
const getTrackingPaths = () => {
  try {
    const cwd = process.cwd();
    return {
      dir: path.join(cwd, 'data'),
      file: path.join(cwd, 'data', 'tracking.json'),
    };
  } catch (err) {
    console.warn('⚠️ process.cwd() unavailable, using fallback paths');
    return {
      dir: '/tmp/data',
      file: '/tmp/data/tracking.json',
    };
  }
};

const getPaths = () => getTrackingPaths();

async function loadTrackingData(): Promise<Record<string, any>> {
  const paths = getPaths();
  try {
    const data = await fs.readFile(paths.file, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // Try fallback path if primary fails
    if (paths.file !== '/tmp/data/tracking.json') {
      try {
        const data = await fs.readFile('/tmp/data/tracking.json', 'utf-8');
        return JSON.parse(data);
      } catch (tmpErr) {
        console.log('📝 Fichier tracking.json non trouvé sur les deux chemins');
        return {};
      }
    }
    console.log('📝 Fichier tracking.json non trouvé');
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
    const trackingEntry = trackingData[code];

    if (!trackingEntry) {
      console.log('❌ Code de suivi non trouvé:', code);
      return NextResponse.json({
        success: false,
        error: 'Code de suivi invalide ou demande non trouvée'
      }, { status: 404 })
    }

    console.log('✅ Code de suivi trouvé:', code);
    
    // Transform the tracking data into the expected format for the frontend
    const formattedData = {
      id: trackingEntry.code || code,
      trackingCode: trackingEntry.code || code,
      status: trackingEntry.status || 'NEW',
      customerName: trackingEntry.name || 'Client inconnu',
      serviceType: trackingEntry.inputType === 'audio' ? 'Demande vocale' : 'Demande écrite',
      description: trackingEntry.description || (trackingEntry.inputType === 'audio' ? 'Message vocal' : 'Pas de description'),
      address: trackingEntry.neighborhood || (trackingEntry.latitude && trackingEntry.longitude ? `${trackingEntry.latitude}, ${trackingEntry.longitude}` : 'Non spécifiée'),
      phone: trackingEntry.phone || 'Non spécifié',
      createdAt: trackingEntry.createdAt || new Date().toISOString(),
      updatedAt: trackingEntry.updatedAt || trackingEntry.createdAt || new Date().toISOString(),
      // Additional fields
      latitude: trackingEntry.latitude,
      longitude: trackingEntry.longitude,
      hasAudio: trackingEntry.hasAudio,
      hasPhoto: trackingEntry.hasPhoto,
      audioUrl: trackingEntry.audioUrl,
      photoUrl: trackingEntry.photoUrl
    };

    return NextResponse.json({
      success: true,
      data: formattedData
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du code de suivi:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}