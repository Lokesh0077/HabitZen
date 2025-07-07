'use strict';

self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }
  const data = event.data.json();
  const title = data.title || 'HabitZen Reminder';
  const options = {
    body: data.body,
    // You can add icons, badges, etc. here
    // icon: '/icon.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // This opens the app to the root page.
  event.waitUntil(
    clients.openWindow('/')
  );
});
