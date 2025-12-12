import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type UserCredential,
} from "firebase/auth";
import { auth } from "../../libs/firebase";

export type EmailSignUpInput = {
    email: string;
    password: string;
    displayName?: string;
};

export type EmailSignInInput = {
    email: string;
    password: string;
};

// 회원가입
export async function signUpWithEmail({
                                          email,
                                          password,
                                          displayName,
                                      }: EmailSignUpInput): Promise<UserCredential> {
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
    return signInWithEmailAndPassword(auth, email, password);
}