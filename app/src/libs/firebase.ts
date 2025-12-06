// src/libs/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCc2zyKAEIHSXphmPB3BClR6rFfPuCmNPI",
    authDomain: "job-log-web.firebaseapp.com",
    projectId: "job-log-web",
    storageBucket: "job-log-web.firebasestorage.app",
    messagingSenderId: "872034058520",
    appId: "1:872034058520:web:e49315b4719fd030cb5e6d",
};

const app = initializeApp(firebaseConfig);

// RN에서는 analytics 안 씀
export const auth = getAuth(app);
export const db = getFirestore(app);