'use client';

import { useEffect } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for Service Worker and Push support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('⚠️ Service Worker or Push notifications not supported by this browser');
      return;
    }

    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!VAPID_PUBLIC_KEY) {
      console.log('⚠️ NEXT_PUBLIC_VAPID_PUBLIC_KEY env variable is missing');
      return;
    }

    // Register Service Worker
    navigator.serviceWorker.register('/sw.js')
      .then(async (registration) => {
        console.log('✅ PWA Service Worker registered successfully:', registration.scope);

        // Request notification permissions
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log('⚠️ Notification permission denied');
            return;
          }
        }

        // Subscribe to Push Notifications
        try {
          const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey
            });
            console.log('🔔 Created new Push Subscription:', subscription);
          } else {
            console.log('🔔 Found existing Push Subscription:', subscription);
          }

          // Send subscription to backend
          await fetch('/api/push-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
          console.log('✅ Push Subscription registered successfully on backend');
        } catch (subErr: any) {
          console.error('❌ Failed to subscribe user to Push notifications:', subErr.message);
        }
      })
      .catch((err) => {
        console.error('❌ Service Worker registration failed:', err);
      });
  }, []);

  return null;
}
