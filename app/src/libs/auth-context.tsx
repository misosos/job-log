import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

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

    const [rememberMe, setRememberMeState] = useState(false);
    const rememberMeRef = useRef(false);

    const bootstrappedRef = useRef(false);

    const setRememberMe = async (enabled: boolean) => {
        setRememberMeState(enabled);
        rememberMeRef.current = enabled;
        await AsyncStorage.setItem(REMEMBER_KEY, enabled ? "1" : "0");
    };

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        let cancelled = false;

        (async () => {
            try {
                // 1) rememberMe 로드
                const stored = await AsyncStorage.getItem(REMEMBER_KEY);
                const remembered = stored === "1";
                if (cancelled) return;

                setRememberMeState(remembered);
                rememberMeRef.current = remembered;

                // 2) auth 구독
                unsubscribe = onAuthStateChanged(auth, async (u) => {
                    if (!bootstrappedRef.current) {
                        bootstrappedRef.current = true;

                        if (!rememberMeRef.current && u) {
                            try {
                                await signOut(auth);
                            } catch {
                                // ignore
                            }
                            if (!cancelled) {
                                setUser(null);
                                setLoading(false);
                            }
                            return;
                        }
                    }

                    if (!cancelled) {
                        setUser(u ?? null);
                        setLoading(false);
                    }
                });
            } catch {
                unsubscribe = onAuthStateChanged(auth, (u) => {
                    if (!cancelled) {
                        setUser(u ?? null);
                        setLoading(false);
                    }
                });
            }
        })();

        return () => {
            cancelled = true;
            if (unsubscribe) unsubscribe();
        };
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