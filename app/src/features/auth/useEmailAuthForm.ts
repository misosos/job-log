// src/features/auth/useEmailAuthForm.ts
import { useCallback, useState } from "react";
import { auth } from "../../libs/firebase";
import {
    initEmailAuthApi,
    signInWithEmail,
    signUpWithEmail,
} from "../../../../shared/features/auth/emailAuthApi";

type Mode = "login" | "signup";

initEmailAuthApi(auth);

/** 웹 form onSubmit 이벤트와 호환되게 최소한으로 정의 */
type SubmitEventLike = {
    preventDefault?: () => void;
} | undefined;

export function useEmailAuthForm(onSuccess?: () => void) {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [displayName, setDisplayName] = useState(""); // 회원가입용 이름
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleMode = () => {
        setMode((prev) => (prev === "login" ? "signup" : "login"));
        setError(null);
        setPassword("");
        setPasswordConfirm("");
        setDisplayName("");
    };

    const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

    const isSignup = mode === "signup";

    const isFormValid =
        isValidEmail(email) &&
        password.trim().length >= 6 &&
        (!isSignup ||
            (displayName.trim().length > 0 &&
                passwordConfirm.trim().length > 0 &&
                password === passwordConfirm));

    const handleSubmit = useCallback(
        async (e?: SubmitEventLike) => {
            e?.preventDefault?.();
            if (!isFormValid) return;

            if (mode === "signup" && password !== passwordConfirm) {
                setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const normalizedEmail = email.trim().toLowerCase();
                const normalizedPassword = password.trim();

                if (mode === "login") {
                    await signInWithEmail({
                        email: normalizedEmail,
                        password: normalizedPassword,
                    });
                } else {
                    await signUpWithEmail({
                        email: normalizedEmail,
                        password: normalizedPassword,
                        displayName: displayName.trim(),
                    });
                }

                if (onSuccess) onSuccess();
                setPassword("");
                setPasswordConfirm("");
            } catch (err: unknown) {
                console.error("이메일 인증 실패:", err);

                const code =
                    typeof err === "object" && err !== null && "code" in err
                        ? (err as { code?: string }).code
                        : undefined;

                if (code === "auth/email-already-in-use") {
                    setError("이미 사용 중인 이메일입니다.");
                } else if (code === "auth/invalid-email") {
                    setError("올바른 이메일 형식이 아닙니다.");
                } else if (code === "auth/invalid-credential") {
                    setError("이메일 또는 비밀번호가 올바르지 않습니다.");
                } else if (code === "auth/wrong-password") {
                    setError("비밀번호가 올바르지 않습니다.");
                } else if (code === "auth/user-not-found") {
                    setError("해당 이메일로 가입된 계정이 없습니다.");
                } else if (code === "auth/weak-password") {
                    setError("비밀번호는 최소 6자 이상이어야 합니다.");
                } else {
                    setError("로그인/회원가입 중 오류가 발생했습니다.");
                }
            } finally {
                setLoading(false);
            }
        },
        [
            mode,
            email,
            password,
            passwordConfirm,
            displayName,
            isFormValid,
            onSuccess,
        ],
    );

    return {
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
    };
}