importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

// Extract config from the URL query params we passed when registering
const urlParams = new URLSearchParams(location.search);

const firebaseConfig = {
  apiKey: urlParams.get("apiKey"),
  projectId: urlParams.get("projectId"),
  messagingSenderId: urlParams.get("messagingSenderId"),
  appId: urlParams.get("appId"),
};

if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);

    // Customize notification here
    const notificationTitle = payload.notification.title || "New Notification";
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/agatike-icon.png",
      data: payload.data || {},
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200, 100, 200],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Navigate to the URL if passed in data
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
