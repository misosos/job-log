// src/pages/auth/LoginPage.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { useAuth } from "../../libs/auth-context"; // 경로는 네 구조에 맞게

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();

    // RequireAuth에서 넘겨준 "from" 경로가 있으면 거기로, 없으면 "/"로
    const state = location.state as { from?: { pathname?: string } } | null;
    const fromPath = state?.from?.pathname ?? "/";

    useEffect(() => {
        if (!loading && user) {
            navigate(fromPath, { replace: true });
        }
    }, [loading, user, fromPath, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900">
            <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-lg">
                <h1 className="mb-4 text-2xl font-bold text-white">Job Log 로그인</h1>
                <p className="mb-6 text-sm text-slate-300">
                    지원 현황, 이력서, 면접 기록을 한 번에 관리해요.
                </p>
                <GoogleSignInButton />
            </div>
        </div>
    );
}