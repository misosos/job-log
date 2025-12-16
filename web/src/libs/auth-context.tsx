import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

function safeStorageGet(key: string): string | null {
  // SSR/빌드 환경 안전장치
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function readRememberMe(): boolean {
  return safeStorageGet(REMEMBER_KEY) === "1";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [rememberMe, setRememberMeState] = useState<boolean>(() => readRememberMe());

  // rememberMe 값이 바뀌면 웹 persistence(local/session)를 맞춰준다.
  useEffect(() => {
    void applyWebAuthPersistence(rememberMe).catch(() => {
      // setPersistence는 로그인 이전 적용이 정석이라,
      // 이미 로그인된 상태/환경 문제로 실패해도 무시
    });
  }, [rememberMe]);

  // Firebase auth 상태 구독은 1번만
  useEffect(() => {
    let mounted = true;

    const unsub = auth.onAuthStateChanged((u) => {
      if (!mounted) return;
      setUser(u);
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const setRememberMe = useCallback(async (enabled: boolean) => {
    setRememberMeState(enabled);
    safeStorageSet(REMEMBER_KEY, enabled ? "1" : "0");

    // persistence는 effect에서 처리되지만,
    // UI 클릭 직후 즉시 반영을 원하면 여기서도 한 번 시도(실패해도 무시)
    try {
      await applyWebAuthPersistence(enabled);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, rememberMe, setRememberMe }),
    [user, loading, rememberMe, setRememberMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}