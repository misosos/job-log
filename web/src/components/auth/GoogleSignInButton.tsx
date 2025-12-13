import { useCallback, useEffect, useState } from "react";
import { signInWithPopup, signOut, type User } from "firebase/auth";
import { Button } from "flowbite-react";

import { auth, googleProvider, applyWebAuthPersistence } from "../../libs/firebase";

type GoogleSignInButtonProps = {
    /** 헤더처럼 로그인 전에는 아무 것도 안 보이게 하고 싶을 때 true */
    hideWhenLoggedOut?: boolean;
    /** 로그인 유지 체크값 (web persistence 적용용) */
    rememberMe?: boolean;
};

function useAuthUser() {
    const [user, setUser] = useState<User | null>(() => auth.currentUser);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return unsub;
    }, []);

    return user;
}

export function GoogleSignInButton({
                                       hideWhenLoggedOut = false,
                                       rememberMe = false,
                                   }: GoogleSignInButtonProps) {
    const user = useAuthUser();
    const userEmail = user?.email ?? null;

    const [busy, setBusy] = useState(false);

    const handleSignIn = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        try {
            // Google OAuth 시작 전에 persistence 적용 (local/session)
            await applyWebAuthPersistence(rememberMe);
            await signInWithPopup(auth, googleProvider);
        } catch (e) {
            console.error("로그인 실패", e);
        } finally {
            setBusy(false);
        }
    }, [busy, rememberMe]);

    const handleSignOut = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        try {
            await signOut(auth);
        } catch (e) {
            console.error("로그아웃 실패", e);
        } finally {
            setBusy(false);
        }
    }, [busy]);

    // 헤더 등에서 "로그인 전엔 숨김"
    if (!userEmail && hideWhenLoggedOut) return null;

    // 로그인 상태
    if (userEmail) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700">{userEmail}</span>
                <Button
                    size="xs"
                    color="light"
                    onClick={handleSignOut}
                    disabled={busy}
                    className="!border-rose-200 !bg-white !text-rose-700 hover:!bg-rose-50 focus:!ring-rose-200 disabled:opacity-60"
                >
                    {busy ? "처리 중..." : "로그아웃"}
                </Button>
            </div>
        );
    }

    // 로그아웃 상태
    return (
        <Button
            size="xs"
            color="light"
            onClick={handleSignIn}
            disabled={busy}
            className="!border-rose-200 !bg-rose-500 !text-white hover:!bg-rose-400 focus:!ring-rose-200 disabled:opacity-60"
        >
            {busy ? "로그인 중..." : "Google로 로그인"}
        </Button>
    );
}