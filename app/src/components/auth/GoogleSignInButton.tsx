// app/src/components/auth/GoogleSignInButton.tsx
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { auth } from "../../libs/firebase";

WebBrowser.maybeCompleteAuthSession();

type GoogleSignInButtonProps = {
    /** 헤더처럼 로그인 전에는 아무 것도 안 보이게 하고 싶을 때 true */
    hideWhenLoggedOut?: boolean;
};

export function GoogleSignInButton({
                                       hideWhenLoggedOut = false,
                                   }: GoogleSignInButtonProps) {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔹 Expo Google OAuth 요청 훅 (네이티브용)
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        scopes: ["openid", "email", "profile"],
    });

    // Firebase Auth 상태 구독
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUserEmail(user?.email ?? null);
        });
        return () => unsub();
    }, []);

    // Google 로그인 응답 처리 (네이티브 전용)
    useEffect(() => {
        const doLogin = async () => {
            if (!response) return;
            if (response.type !== "success") return;

            // 🔹 웹에서는 expo-auth-session 응답을 쓰지 않고, signInWithPopup을 사용하므로 여기서 무시
            if (Platform.OS === "web") return;

            try {
                setLoading(true);

                const anyResponse = response as any;
                const idToken =
                    anyResponse.authentication?.idToken ??
                    anyResponse.params?.id_token ??
                    null;

                if (!idToken) {
                    console.log(
                        "[Auth] no id_token in response",
                        JSON.stringify(response)
                    );
                    return;
                }

                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
                console.log("[Auth] native signIn success");
            } catch (e) {
                console.log("[Auth] native signIn error:", e);
            } finally {
                setLoading(false);
            }
        };

        void doLogin();
    }, [response]);

    const handleSignIn = async () => {
        try {
            setLoading(true);

            // 🔹 웹: Firebase Web SDK 그대로 사용 (기존 웹 프로젝트와 동일한 방식)
            if (Platform.OS === "web") {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                console.log("[Auth] web signInWithPopup success");
                setLoading(false);
                return;
            }

            // 🔹 네이티브: expo-auth-session으로 OAuth 플로우 시작
            if (!request) {
                console.log("[Auth] Google request not ready yet");
                setLoading(false);
                return;
            }

            await promptAsync();
        } catch (e) {
            console.log("[Auth] prompt/signIn error:", e);
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setLoading(true);
            await signOut(auth);
        } catch (e) {
            console.log("[Auth] signOut error:", e);
        } finally {
            setLoading(false);
        }
    };

    // 로그인 안 했고, 숨기기 옵션이면 null
    if (!userEmail && hideWhenLoggedOut) {
        return null;
    }

    // 로그인된 상태
    if (userEmail) {
        return (
            <View style={styles.container}>
                <Text style={styles.email} numberOfLines={1}>
                    {userEmail}
                </Text>
                <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={handleSignOut}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#0f172a" />
                    ) : (
                        <Text style={[styles.buttonText, styles.logoutText]}>로그아웃</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    // 로그인 버튼
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={loading || (!request && Platform.OS !== "web")}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#0f172a" />
            ) : (
                <Text style={styles.buttonText}>Google로 로그인</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    email: {
        fontSize: 12,
        color: "#e5e7eb", // text-slate-200
        maxWidth: 180,
    },
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#22c55e", // emerald-500
    },
    buttonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0f172a", // slate-900
    },
    logoutButton: {
        backgroundColor: "#e5e7eb",
    },
    logoutText: {
        color: "#0f172a",
    },
});