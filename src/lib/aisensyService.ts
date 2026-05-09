/**
 * AiSensy WhatsApp Integration Service
 * Docs: https://aisensy.com
 * 
 * Handles sending WhatsApp template messages via AiSensy API
 * and processing incoming webhook payloads.
 */

const AISENSY_API_URL = 'https://backend.aisensy.com/campaign/t1/api/v2';

interface SendMessageParams {
  destination: string; // Phone with country code e.g. "+919876543210"
  userName: string;
  campaignName?: string;
  templateParams?: string[];
  mediaUrl?: string;
  mediaFilename?: string;
}

interface AiSensyWebhookPayload {
  messageType?: string;
  text?: string;
  senderName?: string;
  senderMobile?: string;
  timestamp?: string;
  mediaUrl?: string;
  [key: string]: any;
}

/**
 * Send a WhatsApp template message via AiSensy
 */
export async function sendWhatsAppMessage(params: SendMessageParams) {
  const apiKey = process.env.AISENSY_API_KEY;
  const defaultCampaign = process.env.AISENSY_CAMPAIGN_NAME;

  if (!apiKey || apiKey === 'your_aisensy_api_key_here') {
    console.warn('⚠️ AiSensy API key not configured — skipping message send');
    return { success: false, error: 'AiSensy API key not configured' };
  }

  const body: any = {
    apiKey,
    campaignName: params.campaignName || defaultCampaign,
    destination: params.destination.replace(/\+/g, ''),
    userName: params.userName,
  };

  if (params.templateParams) {
    body.templateParams = params.templateParams;
  }

  if (params.mediaUrl) {
    body.media = {
      url: params.mediaUrl,
      filename: params.mediaFilename || 'file',
    };
  }

  try {
    const res = await fetch(AISENSY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('AiSensy API error:', data);
      return { success: false, error: data };
    }

    console.log('✅ WhatsApp message sent via AiSensy to', params.destination);
    return { success: true, data };
  } catch (error) {
    console.error('AiSensy send error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Parse incoming AiSensy webhook payload into a standard format
 */
export function parseAiSensyWebhook(payload: AiSensyWebhookPayload) {
  return {
    senderPhone: payload.senderMobile || '',
    senderName: payload.senderName || 'WhatsApp User',
    message: payload.text || payload.messageType || '',
    messageType: payload.messageType || 'text',
    mediaUrl: payload.mediaUrl || null,
    timestamp: payload.timestamp || new Date().toISOString(),
    raw: payload,
  };
}
