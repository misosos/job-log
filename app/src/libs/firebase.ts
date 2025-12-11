// src/libs/firebase.ts (Expo 앱용)

import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    // measurementId는 웹 분석용이라 앱에서는 안 써도 됨
};

const firebaseApp = initializeApp(firebaseConfig);

// ✅ RN/웹 공통: 간단하게 getAuth만 사용 (메모리 persistence)
const auth: Auth = getAuth(firebaseApp);

// Firestore
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db };