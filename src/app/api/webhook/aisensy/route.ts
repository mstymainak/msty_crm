import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Enquiry from '@/models/Enquiry';
import { parseAiSensyWebhook, sendWhatsAppMessage } from '@/lib/aisensyService';

/**
 * AiSensy WhatsApp Webhook
 * 
 * SETUP STEPS:
 * 1. Go to AiSensy Dashboard → Integration Settings
 * 2. Set Webhook URL to: https://YOUR-DOMAIN/api/webhook/aisensy
 * 3. Subscribe to: Incoming Messages + Message Status Updates
 * 4. Set your AISENSY_API_KEY in .env.local
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('📱 AiSensy webhook received:', JSON.stringify(payload).substring(0, 200));

    const parsed = parseAiSensyWebhook(payload);

    // Skip if no message content or no sender
    if (!parsed.senderPhone || !parsed.message) {
      return NextResponse.json({ status: 'skipped' });
    }

    await dbConnect();

    // Normalize phone number (remove country code prefix if needed)
    const phone = parsed.senderPhone.startsWith('91')
      ? parsed.senderPhone.substring(2)
      : parsed.senderPhone;
    const fullPhone = parsed.senderPhone.startsWith('+')
      ? parsed.senderPhone
      : `+${parsed.senderPhone}`;

    // Find or create customer
    let customer = await Customer.findOne({
      $or: [
        { phone: phone },
        { phone: fullPhone },
        { phone: parsed.senderPhone },
        { whatsappNumber: fullPhone },
      ],
    });

    if (!customer) {
      customer = await Customer.create({
        name: parsed.senderName,
        email: `wa_${phone}@placeholder.com`,
        phone: phone,
        whatsappNumber: fullPhone,
      });
      console.log('👤 New customer created from WhatsApp:', phone);
    }

    // Create enquiry from the message
    await Enquiry.create({
      customer: customer._id,
      source: 'whatsapp',
      message: parsed.message,
      status: 'new',
      priority: 'medium',
    });

    console.log('📩 New WhatsApp enquiry created from', phone);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('AiSensy webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * GET endpoint for webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'AiSensy WhatsApp Webhook',
    message: 'Configure this URL in your AiSensy Dashboard → Integration Settings',
  });
}
