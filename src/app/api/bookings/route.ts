import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/lib/bookingService';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const body = await request.json();
    
    // Automatically set who created the booking
    if (user) {
      body.bookedBy = user.userId;
      
      // Add attribution to notes if present
      if (body.notes && body.notes.trim()) {
        const firstName = user.name.split(' ')[0];
        body.notes = `${body.notes.trim()} - ${firstName}`;
      }
    }

    const booking = await createBooking(body);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
