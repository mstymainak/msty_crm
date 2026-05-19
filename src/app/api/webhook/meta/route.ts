import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Enquiry from '@/models/Enquiry';
import { parseMetaWebhook } from '@/lib/metaService';

/**
 * Meta Business Suite Webhook (Facebook Messenger + Instagram)
 * 
 * SETUP STEPS:
 * 1. Go to developers.facebook.com → Your App → Webhooks
 * 2. Callback URL: https://YOUR-DOMAIN/api/webhook/meta
 * 3. Verify Token: set same value as META_VERIFY_TOKEN in .env.local
 * 4. Subscribe to: messages, messaging_postbacks
 * 5. Generate Page Access Token and add to .env.local
 */

// GET — Meta webhook verification (required for setup)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN || 'msty_crm_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Meta webhook verified successfully');
    return new Response(challenge, { status: 200 });
  }

  console.warn('❌ Meta webhook verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST — Receive incoming messages from Facebook/Instagram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📘 Meta webhook received:', JSON.stringify(body).substring(0, 200));

    const messages = parseMetaWebhook(body);

    if (messages.length === 0) {
      // Meta requires 200 OK even for events we don't handle
      return NextResponse.json({ status: 'ok' });
    }

    await dbConnect();

    for (const msg of messages) {
      // Find or create customer by platform ID
      const platformField = msg.platform === 'instagram' ? 'instagramId' : 'facebookId';

      let customer = await Customer.findOne({ [platformField]: msg.senderId });

      if (!customer) {
        customer = await Customer.create({
          name: `${msg.platform === 'instagram' ? 'IG' : 'FB'} User ${msg.senderId.substring(0, 6)}`,
          email: `${msg.platform}_${msg.senderId}@placeholder.com`,
          phone: '',
          [platformField]: msg.senderId,
        });
        console.log(`👤 New customer from ${msg.platform}:`, msg.senderId);
      }

      // Create enquiry
      const enquiry = await Enquiry.create({
        customer: customer._id,
        source: msg.platform,
        message: msg.message,
        status: 'new',
        priority: 'medium',
      });

      console.log(`📩 New ${msg.platform} enquiry from`, msg.senderId);

      // Trigger mobile push notification to all subscribers (PWA) even if the app is closed
      try {
        const { sendPushNotification } = await import('@/lib/pushService');
        const platformName = msg.platform === 'instagram' ? 'Instagram' : 'Facebook';
        const cleanMessage = msg.message.length > 100 ? `${msg.message.substring(0, 97)}...` : msg.message;
        await sendPushNotification(
          `New ${platformName} Enquiry! 💬`,
          `From: ${customer.name || 'Chat User'}\nMessage: ${cleanMessage}`,
          '/dashboard/enquiries'
        );
      } catch (pushErr: any) {
        console.error('⚠️ Failed to send Meta webhook push notification:', pushErr.message);
      }
    }

    // Meta requires 200 within 20 seconds
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Meta webhook error:', error);
    // Still return 200 to prevent Meta from disabling the webhook
    return NextResponse.json({ status: 'error_logged' }, { status: 200 });
  }
}
