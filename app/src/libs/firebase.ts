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

function requiredEnv(name: string): string {
    const v = process.env[name];
    if (!v) {
        // 모듈 로드시 바로 터지면 원인 파악이 힘들어서 에러 메시지를 명확히 남김
        throw new Error(`[firebase] Missing env var: ${name}. Check .env.local and Expo env export.`);
    }
    return v;
}

const firebaseConfig: FirebaseOptions = {
    apiKey: requiredEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requiredEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requiredEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requiredEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requiredEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requiredEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
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