// MSTY CRM - Progressive Web App Service Worker
// Enables background push notifications even when the PWA is completely closed!

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      try {
        data = { body: event.data.text() };
      } catch (err) {
        data = {};
      }
    }
  }

  const title = data.title || 'New CRM Update 🔔';
  const options = {
    body: data.body || 'A new event has been logged in the CRM.',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    data: {
      url: data.url || '/dashboard/enquiries'
    },
    actions: [
      { action: 'open', title: '👁️ View Enquiries' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/dashboard/enquiries';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.focus();
          if (client.url.includes('/dashboard')) {
            return client.navigate(targetUrl);
          }
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
