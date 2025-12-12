import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { auth } from "./firebase";
import { signOut, type User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    const setRememberMe = async (enabled: boolean) => {
        setRememberMeState(enabled);
        rememberMeRef.current = enabled;
        await AsyncStorage.setItem(REMEMBER_KEY, enabled ? "1" : "0");
    };

    useEffect(() => {
        let unsub: (() => void) | undefined;
        let cancelled = false;

        (async () => {
            try {
                const stored = await AsyncStorage.getItem(REMEMBER_KEY);
                const remembered = stored === "1";
                if (cancelled) return;

                setRememberMeState(remembered);
                rememberMeRef.current = remembered;

                unsub = auth.onAuthStateChanged(async (u) => {
                    // rememberMe가 OFF인데, 이전 세션이 복원된 경우 → 앱 시작 시 자동 로그아웃
                    if (!rememberMeRef.current && u) {
                        try {
                            await signOut(auth);
                        } catch {
                            // ignore
                        }
                        setUser(null);
                        setLoading(false);
                        return;
                    }

                    setUser(u);
                    setLoading(false);
                });
            } catch {
                // AsyncStorage 읽기 실패 시에도 auth 구독은 유지
                unsub = auth.onAuthStateChanged((u) => {
                    setUser(u);
                    setLoading(false);
                });
            }
        })();

        return () => {
            cancelled = true;
            if (unsub) unsub();
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