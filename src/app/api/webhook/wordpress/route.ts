import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Enquiry from '@/models/Enquiry';

/**
 * WordPress Webhook Receiver
 * 
 * Receives contact form submissions from your WordPress site.
 * 
 * SETUP STEPS (in WordPress):
 * 
 * For Contact Form 7 — add this to functions.php:
 * ------------------------------------------------
 * add_action('wpcf7_before_send_mail', 'send_to_msty_crm');
 * function send_to_msty_crm($contact_form) {
 *     $submission = WPCF7_Submission::get_instance();
 *     if (!$submission) return;
 *     $data = $submission->get_posted_data();
 *     wp_remote_post('https://YOUR-CRM-URL/api/webhook/wordpress', array(
 *         'headers' => array('Content-Type' => 'application/json'),
 *         'body'    => json_encode(array(
 *             'name'    => $data['your-name'],
 *             'email'   => $data['your-email'],
 *             'phone'   => $data['your-phone'],
 *             'message' => $data['your-message'],
 *         )),
 *         'timeout' => 10,
 *     ));
 * }
 * 
 * For WPForms — use WPForms webhook addon or Zapier
 * For Elementor Forms — use webhook action in form settings
 * 
 * Expected JSON payload:
 * { "name": "...", "email": "...", "phone": "...", "message": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    let rawBody: any;
    try {
      rawBody = await request.json();
    } catch (err) {
      // Fallback if Elementor sends as form-data instead of JSON
      const formData = await request.formData();
      rawBody = Object.fromEntries(formData.entries());
    }

    let body = rawBody;
    // Handle Elementor's "Advanced Data" JSON structure
    if (rawBody.fields && typeof rawBody.fields === 'object') {
      body = {};
      for (const key in rawBody.fields) {
        body[key] = rawBody.fields[key].value;
      }
    }

    console.log('🌐 WordPress webhook parsed body:', JSON.stringify(body).substring(0, 200));

    const { name, email, phone, message, ...otherFields } = body;

    if (!name && !email && !phone) {
      return NextResponse.json({ error: 'At least name, email, or phone is required' }, { status: 400 });
    }

    // Combine any extra fields from Elementor (like Package Name, Adult, Child) into the message
    let finalMessage = message || '';
    if (Object.keys(otherFields).length > 0) {
      const extraDetails = Object.entries(otherFields)
        .filter(([key]) => !['form_id', 'form_name', 'action'].includes(key)) // skip internal elementor fields
        .map(([key, val]) => `${key}: ${val}`)
        .join('\n');
      
      finalMessage = finalMessage ? `${finalMessage}\n\nDetails:\n${extraDetails}` : `Form Details:\n${extraDetails}`;
    }

    if (!finalMessage) {
      finalMessage = `Website enquiry from ${name || email}`;
    }

    await dbConnect();

    // Find existing customer by email or phone
    let customer = null;
    if (email) {
      customer = await Customer.findOne({ email });
    }
    if (!customer && phone) {
      customer = await Customer.findOne({ phone });
    }

    // Create new customer if not found
    if (!customer) {
      customer = await Customer.create({
        name: name || 'Website Visitor',
        email: email || `wp_${Date.now()}@placeholder.com`,
        phone: phone || '',
        address: body.address || '',
      });
      console.log('👤 New customer from WordPress:', name || email);
    }

    // Create enquiry
    const enquiry = await Enquiry.create({
      customer: customer._id,
      source: 'website',
      message: finalMessage,
      status: 'new',
      priority: 'medium',
    });

    console.log('📩 New website enquiry created:', enquiry._id);

    return NextResponse.json({
      status: 'ok',
      customerId: customer._id,
      enquiryId: enquiry._id,
    }, { status: 201 });
  } catch (error) {
    console.error('WordPress webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * GET endpoint for webhook health check + setup instructions
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'WordPress Form Webhook',
    instructions: 'POST JSON with { name, email, phone, message } to this URL from your WordPress site',
    example_payload: {
      name: 'Ramesh Kumar',
      email: 'ramesh@example.com',
      phone: '9876543210',
      message: 'Interested in Char Dham Yatra',
    },
  });
}
