importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBr1_PJOBmwUJTTnIWOPReUbNWX7hJ02bE",
  authDomain: "krishiyatra-2b50a.firebaseapp.com",
  projectId: "krishiyatra-2b50a",
  storageBucket: "krishiyatra-2b50a.firebasestorage.app",
  messagingSenderId: "1012861250791",
  appId: "1:1012861250791:web:8352c03282a611d24ac642"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
