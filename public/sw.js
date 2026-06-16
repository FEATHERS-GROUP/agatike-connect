self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Try to find the URL to open
  var urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (windowClients) {
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          // If the URL matches, focus it
          if (client.url.indexOf(urlToOpen) !== -1 && "focus" in client) {
            return client.focus();
          }
        }
        // If no window is found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
