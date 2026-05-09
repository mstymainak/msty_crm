import { NextRequest, NextResponse } from 'next/server';
import { createEnquiry, getEnquiries } from '@/lib/enquiryService';

export async function GET() {
  try {
    const enquiries = await getEnquiries();
    return NextResponse.json(enquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const enquiry = await createEnquiry(body);
    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create enquiry' }, { status: 500 });
  }
}