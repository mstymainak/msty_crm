import { NextRequest, NextResponse } from 'next/server';
import { createEnquiry, getEnquiries } from '@/lib/enquiryService';
import { getAuthUser } from '@/lib/auth';

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
    const user = await getAuthUser();
    const body = await request.json();
    
    if (user) {
      body.acquiredBy = user.userId;
    }
    
    const enquiry = await createEnquiry(body);
    
    // Trigger mobile push notification to all subscribers (PWA) even if the app is closed
    try {
      const { sendPushNotification } = await import('@/lib/pushService');
      const Customer = (await import('@/models/Customer')).default;
      const customer = await Customer.findById(body.customer);
      const cleanMessage = body.message ? (body.message.length > 100 ? `${body.message.substring(0, 97)}...` : body.message) : 'Manual entry';
      await sendPushNotification(
        `New Manual Enquiry Added! 📝`,
        `By: ${user?.name || 'User'}\nCustomer: ${customer?.name || 'Customer'}\nMessage: ${cleanMessage}`,
        '/dashboard/enquiries'
      );
    } catch (pushErr: any) {
      console.error('⚠️ Failed to send manual push notification:', pushErr.message);
    }

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create enquiry' }, { status: 500 });
  }
}