// src/pages/auth/LoginPage.tsx
import { useEffect, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { auth, applyWebAuthPersistence } from "../../libs/firebase";
import { useAuth } from "../../libs/auth-context";
import { useEmailAuthForm } from "../../features/auth/useEmailAuthForm";

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { rememberMe, setRememberMe } = useAuth();

    const state = location.state as { from?: { pathname?: string } } | null;
    const fromPath = state?.from?.pathname ?? "/";

    const {
        mode,
        toggleMode,
        email,
        setEmail,
        password,
        setPassword,
        passwordConfirm,
        setPasswordConfirm,
        displayName,
        setDisplayName,
        loading,
        error,
        isFormValid,
        handleSubmit,
    } = useEmailAuthForm();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) navigate(fromPath, { replace: true });
        });
        return () => unsubscribe();
    }, [navigate, fromPath]);

    const isSignup = mode === "signup";

    // ✅ 이메일 로그인/회원가입 전에 persistence 적용 (local/session)
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        await applyWebAuthPersistence(rememberMe);
        await handleSubmit(e);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-lg">
                <h1 className="mb-4 text-2xl font-bold text-white">Job Log 로그인</h1>
                <p className="mb-6 text-sm text-slate-300">
                    지원 현황, 이력서, 면접 기록을 한 번에 관리해요.
                </p>

                {/* 이메일 로그인 / 회원가입 폼 */}
                <form onSubmit={onSubmit} className="mb-6 space-y-3">
                    {isSignup && (
                        <div>
                            <label className="mb-1 block text-xs text-slate-300">
                                이름 / 닉네임
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="block w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs text-slate-300">이메일</label>
                        <input
                            type="email"
                            value={email}
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-slate-300">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                        />
                    </div>

                    {/* 회원가입 모드일 때만 비밀번호 확인 표시 */}
                    {isSignup && (
                        <div>
                            <label className="mb-1 block text-xs text-slate-300">
                                비밀번호 확인
                            </label>
                            <input
                                type="password"
                                value={passwordConfirm}
                                autoComplete="new-password"
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className="block w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>
                    )}

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    {/* ✅ 로그인 유지 */}
                    <label className="mt-1 flex cursor-pointer items-start gap-2 rounded-md border border-slate-600 bg-slate-900 px-3 py-2">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => void setRememberMe(e.target.checked)}
                            className="mt-0.5 h-4 w-4 accent-emerald-400"
                        />
                        <span className="text-xs text-slate-200">
              로그인 유지
              <span className="mt-0.5 block text-[11px] text-slate-400">
                체크하지 않으면 브라우저를 닫을 때 자동 로그아웃돼요.
              </span>
            </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="mt-2 flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                        {loading ? "처리 중..." : isSignup ? "회원가입" : "이메일로 로그인"}
                    </button>
                </form>

                <div className="mb-4 text-center text-xs text-slate-300">
                    {isSignup ? (
                        <>
                            이미 계정이 있나요?{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-semibold text-emerald-300 hover:underline"
                            >
                                로그인하기
                            </button>
                        </>
                    ) : (
                        <>
                            아직 계정이 없나요?{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-semibold text-emerald-300 hover:underline"
                            >
                                회원가입하기
                            </button>
                        </>
                    )}
                </div>

                <div className="my-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-600" />
                    <span className="text-xs text-slate-400">또는</span>
                    <div className="h-px flex-1 bg-slate-600" />
                </div>

                {/* ✅ 구글 로그인도 rememberMe 전달 */}
                <GoogleSignInButton rememberMe={rememberMe} />
            </div>
        </div>
    );
}