import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const { status, technicianId, scheduledDate, notes } = body;

    // Validate the request exists
    const existingRequest = await db.request.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    // Update the request
    const updatedRequest = await db.request.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(technicianId && { technicianId }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(notes !== undefined && { notes })
      },
      include: {
        customer: true,
        technician: true
      }
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la demande' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get the request with customer and technician details
    const requestDetails = await db.request.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true
      }
    });

    if (!requestDetails) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(requestDetails);

  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la demande' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate the request exists
    const existingRequest = await db.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    // Delete the request
    await db.request.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Demande supprimée avec succès',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la demande' },
      { status: 500 }
    );
  }
}