// shared/features/auth/emailAuthApi.ts (경로는 기존 그대로)

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type UserCredential,
    type Auth,
} from "firebase/auth";

export type EmailSignUpInput = {
    email: string;
    password: string;
    displayName?: string;
};

export type EmailSignInInput = {
    email: string;
    password: string;
};

// ✅ web/app 공통으로 쓸 수 있도록 Auth 인스턴스를 외부에서 주입
let authInstance: Auth | null = null;

export function initEmailAuthApi(auth: Auth) {
    authInstance = auth;
}

function getAuthOrThrow(): Auth {
    if (!authInstance) {
        throw new Error(
            "[emailAuthApi] Firebase Auth 가 초기화되지 않았습니다. initEmailAuthApi(auth)를 먼저 호출하세요.",
        );
    }
    return authInstance;
}

// 회원가입
export async function signUpWithEmail({
                                          email,
                                          password,
                                          displayName,
                                      }: EmailSignUpInput): Promise<UserCredential> {
    const auth = getAuthOrThrow();

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 닉네임(이름) 있으면 프로필 업데이트
    if (displayName && displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
    }

    return cred;
}

// 로그인
export async function signInWithEmail({
                                          email,
                                          password,
                                      }: EmailSignInInput): Promise<UserCredential> {
    const auth = getAuthOrThrow();
    return signInWithEmailAndPassword(auth, email, password);
}