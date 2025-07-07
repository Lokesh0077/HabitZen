// This file must be in the public directory

// Scripts for Firebase
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// IMPORTANT: Replace this with your web app's Firebase configuration.
const firebaseConfig = {
    apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
    authDomain: "REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_YOUR_FIREBASE_APP_ID",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        // You can add an icon here if you have one in the public folder
        // icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
