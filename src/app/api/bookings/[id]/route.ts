import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, updateBooking, deleteBooking } from '@/lib/bookingService';
import { getAuthUser } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const booking = await getBookingById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    const body = await request.json();

    // Permission check
    const existing = await getBookingById(id);
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const isOwner = user && existing.bookedBy && existing.bookedBy._id.toString() === user.userId;
    const isAdmin = user && user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied. Only the creator or an admin can edit this booking.' }, { status: 403 });
    }

    // Add attribution to notes if present and being updated
    if (body.notes && body.notes.trim()) {
      const firstName = user.name.split(' ')[0];
      // Remove any existing attribution first to avoid duplicates
      const cleanNote = body.notes.trim().replace(/\s-\s\w+$/, '');
      body.notes = `${cleanNote} - ${firstName}`;
    }

    const booking = await updateBooking(id, body);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    // Permission check
    const existing = await getBookingById(id);
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const isOwner = user && existing.bookedBy && existing.bookedBy._id.toString() === user.userId;
    const isAdmin = user && user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied. Only the creator or an admin can delete this booking.' }, { status: 403 });
    }

    await deleteBooking(id);
    return NextResponse.json({ message: 'Booking deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
