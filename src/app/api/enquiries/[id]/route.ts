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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const currentEnquiry = await getEnquiryById(id);
    if (!currentEnquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });

    const acquiredById = currentEnquiry.acquiredBy?._id?.toString() || currentEnquiry.acquiredBy?.toString();
    if (acquiredById && acquiredById !== user.userId && user.role !== 'admin') {
      if ('status' in body || 'priority' in body) {
        return NextResponse.json({ error: 'Forbidden: Enquiry is acquired by another user' }, { status: 403 });
      }
    }

    // Add attribution to adminNote if present and being updated
    if (body.adminNote && body.adminNote.trim()) {
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
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentEnquiry = await getEnquiryById(id);
    if (!currentEnquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });

    const acquiredById = currentEnquiry.acquiredBy?._id?.toString() || currentEnquiry.acquiredBy?.toString();
    if (acquiredById && acquiredById !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Enquiry is acquired by another user' }, { status: 403 });
    }

    await deleteEnquiry(id);
    return NextResponse.json({ message: 'Enquiry deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}
