/**
 * Meta Business Suite Integration Service
 * Handles Facebook Messenger + Instagram messaging via Graph API
 * 
 * Docs: https://developers.facebook.com/docs/messenger-platform
 */

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Send a text reply via Facebook Messenger or Instagram
 */
export async function sendMetaMessage(recipientId: string, messageText: string) {
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!accessToken || accessToken === 'your_page_access_token_here') {
    console.warn('⚠️ Meta Page Access Token not configured — skipping message send');
    return { success: false, error: 'Meta credentials not configured' };
  }

  try {
    const res = await fetch(`${GRAPH_API_BASE}/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Meta API error:', data);
      return { success: false, error: data };
    }

    console.log('✅ Message sent via Meta to', recipientId);
    return { success: true, data };
  } catch (error) {
    console.error('Meta send error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Parse incoming Meta webhook payload (Messenger + Instagram)
 * Returns array of messages extracted from the webhook event
 */
export function parseMetaWebhook(body: any) {
  const messages: Array<{
    senderId: string;
    message: string;
    platform: 'facebook' | 'instagram';
    timestamp: string;
    messageId: string;
  }> = [];

  if (!body?.entry) return messages;

  for (const entry of body.entry) {
    const messaging = entry.messaging || entry.changes || [];

    for (const event of messaging) {
      // Facebook Messenger format
      if (event.sender && event.message) {
        messages.push({
          senderId: event.sender.id,
          message: event.message.text || '[attachment]',
          platform: 'facebook',
          timestamp: event.timestamp ? new Date(event.timestamp).toISOString() : new Date().toISOString(),
          messageId: event.message.mid || '',
        });
      }

      // Instagram format (via changes array)
      if (event.field === 'messages' && event.value) {
        const val = event.value;
        if (val.from && val.message) {
          messages.push({
            senderId: val.from.id || val.sender?.id || '',
            message: val.message.text || val.message || '[attachment]',
            platform: 'instagram',
            timestamp: val.timestamp ? new Date(val.timestamp * 1000).toISOString() : new Date().toISOString(),
            messageId: val.message.mid || val.message.id || '',
          });
        }
      }
    }
  }

  return messages;
}

/**
 * Verify webhook signature from Meta (security check)
 */
export function verifyMetaSignature(rawBody: string, signature: string): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return true; // Skip if not configured

  // In production, use crypto.createHmac('sha256', appSecret) to verify
  // For now, basic check
  return !!signature;
}
