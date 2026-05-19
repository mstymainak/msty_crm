import webpush from 'web-push';
import dbConnect from './mongodb';
import PushSubscription from '@/models/PushSubscription';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:support@msty-crm.com',
    publicKey,
    privateKey
  );
}

export async function sendPushNotification(title: string, body: string, url: string = '/dashboard/enquiries') {
  try {
    await dbConnect();
    const subscriptions = await PushSubscription.find({});
    
    if (subscriptions.length === 0) {
      console.log('📡 No active PWA push subscriptions found.');
      return;
    }
    
    console.log(`📡 Sending push notification to ${subscriptions.length} subscribers...`);
    
    const payload = JSON.stringify({ title, body, url });
    
    const promises = subscriptions.map(sub => {
      const subscriptionObj = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };
      
      return webpush.sendNotification(subscriptionObj, payload)
        .catch(async (err) => {
          // If subscription has expired or is invalid, remove it from DB
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`❌ Removing expired subscription: ${sub._id}`);
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error('⚠️ Push subscription send error:', err.message);
          }
        });
    });
    
    await Promise.all(promises);
  } catch (error: any) {
    console.error('❌ Failed to send push notifications:', error.message);
  }
}
