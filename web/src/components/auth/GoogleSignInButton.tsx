// src/components/auth/GoogleSignInButton.tsx
import { useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../libs/firebase";
import { Button } from "flowbite-react";

export function GoogleSignInButton() {
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            setUserEmail(user?.email ?? null);
        });
        return () => unsub();
    }, []);

    const handleSignIn = async () => {
        try {
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
                <span className="text-xs text-slate-300">{userEmail}</span>
                <Button size="xs" color="gray" onClick={handleSignOut}>
                    로그아웃
                </Button>
            </div>
        );
    }

    return (
        <Button size="xs" color="light" onClick={handleSignIn}>
            Google로 로그인
        </Button>
    );
}