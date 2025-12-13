// src/components/auth/GoogleSignInButton.tsx
import { useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, applyWebAuthPersistence } from "../../libs/firebase";
import { Button } from "flowbite-react";

type GoogleSignInButtonProps = {
    /** 헤더처럼 로그인 전에는 아무 것도 안 보이게 하고 싶을 때 true */
    hideWhenLoggedOut?: boolean;
    /** 로그인 유지 체크값 (web persistence 적용용) */
    rememberMe?: boolean;
};

export function GoogleSignInButton({
                                       hideWhenLoggedOut = false,
                                       rememberMe = false,
                                   }: GoogleSignInButtonProps) {
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            setUserEmail(user?.email ?? null);
        });
        return () => unsub();
    }, []);

    const handleSignIn = async () => {
        try {
            // ✅ Google OAuth 시작 전에 persistence 적용 (local/session)
            await applyWebAuthPersistence(rememberMe);
            await signInWithPopup(auth, googleProvider);
        } catch (e) {
            console.error("로그인 실패", e);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (e) {
            console.error("로그아웃 실패", e);
        }
    };

    if (userEmail) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700">{userEmail}</span>
                <Button
                    size="xs"
                    color="light"
                    onClick={handleSignOut}
                    className="!border-rose-200 !bg-white !text-rose-700 hover:!bg-rose-50 focus:!ring-rose-200"
                >
                    로그아웃
                </Button>
            </div>
        );
    }

    if (!userEmail && hideWhenLoggedOut) {
        // 예: 헤더에서는 로그인 전 버튼을 숨기고 싶을 때
        return null;
    }

    return (
        <Button
            size="xs"
            color="light"
            onClick={handleSignIn}
            className="!border-rose-200 !bg-rose-500 !text-white hover:!bg-rose-400 focus:!ring-rose-200"
        >
            Google로 로그인
        </Button>
    );
}