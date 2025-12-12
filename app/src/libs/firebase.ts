// app/src/libs/firebase.ts

import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase/app";
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
    type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ 로그인 유지: AsyncStorage persistence
export const auth: Auth = (() => {
    try {
        return initializeAuth(firebaseApp, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
    } catch {
        // 이미 초기화된 경우(HMR/리로드)
        return getAuth(firebaseApp);
    }
})();

export const db = getFirestore(firebaseApp);