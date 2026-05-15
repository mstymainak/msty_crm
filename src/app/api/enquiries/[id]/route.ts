import { NextRequest, NextResponse } from 'next/server';
import { getEnquiryById, updateEnquiry, deleteEnquiry } from '@/lib/enquiryService';
import { getAuthUser } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const enquiry = await getEnquiryById(id);
    if (!enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    return NextResponse.json(enquiry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enquiry' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    const body = await request.json();

    // Add attribution to adminNote if present and being updated
    if (user && body.adminNote && body.adminNote.trim()) {
      const firstName = user.name.split(' ')[0];
      // Remove any existing attribution first to avoid duplicates
      const cleanNote = body.adminNote.trim().replace(/\s-\s\w+$/, '');
      body.adminNote = `${cleanNote} - ${firstName}`;
    }

    const enquiry = await updateEnquiry(id, body);
    if (!enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    return NextResponse.json(enquiry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteEnquiry(id);
    return NextResponse.json({ message: 'Enquiry deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}
