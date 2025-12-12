import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { auth, applyWebAuthPersistence } from "./firebase.ts";
import type { User } from "firebase/auth";

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    rememberMe: boolean;
    setRememberMe: (enabled: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const REMEMBER_KEY = "remember_me";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [rememberMe, setRememberMeState] = useState<boolean>(() => {
        try {
            return window.localStorage.getItem(REMEMBER_KEY) === "1";
        } catch {
            return false;
        }
    });

    const setRememberMe = async (enabled: boolean) => {
        setRememberMeState(enabled);
        try {
            window.localStorage.setItem(REMEMBER_KEY, enabled ? "1" : "0");
        } catch {
            // ignore
        }

        // ✅ Web persistence 설정: local(유지) / session(미유지)
        try {
            await applyWebAuthPersistence(enabled);
        } catch {
            // setPersistence는 로그인 이전에 적용되는 게 정석이라,
            // 이미 로그인된 상태에서 실패하더라도 무시
        }
    };

    useEffect(() => {
        // 앱 시작 시 저장된 remember 설정으로 persistence 적용
        void applyWebAuthPersistence(rememberMe).catch(() => {});

        const unsub = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, rememberMe, setRememberMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}