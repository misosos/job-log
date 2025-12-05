import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";

export function LoginPage() {
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