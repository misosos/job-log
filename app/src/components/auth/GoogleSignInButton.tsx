import React, { memo, useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    GoogleAuthProvider,
    signInWithCredential,
    User,
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../../libs/firebase";
import { colors, space, radius, font } from "../../styles/theme";

// ✅ 1. 웹 브라우저 팝업 완료 처리
WebBrowser.maybeCompleteAuthSession();

export const GoogleSignInButton = memo(function GoogleSignInButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) setLoading(false);
        });
        return unsubscribe;
    }, []);

    // ✅ 2. 요청 객체 생성
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        redirectUri: "https://auth.expo.io/@misosos/joblog",
        selectAccount: true, // 계정 선택창 강제 표시
    });


    // ✅ 3. 응답 처리
    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            if (id_token) {
                setLoading(true);
                const credential = GoogleAuthProvider.credential(id_token);
                signInWithCredential(auth, credential)
                    .then(() => {
                        console.log("🔥 Firebase 로그인 성공!");
                    })
                    .catch((err) => {
                        console.error("Firebase Login Error:", err);
                        alert("로그인 실패: " + err.message);
                        setLoading(false);
                    });
            }
        } else if (response?.type === "error") {
            console.error("❌ Google Login Error:", response.error);
            setLoading(false);
        } else if (response?.type === "dismiss") {
            setLoading(false);
        }
    }, [response]);

    // ✅ 4. 로그인 버튼 핸들러 (수정됨: 인자 없음)
    const handleSignIn = async () => {
        setLoading(true);
        try {
            if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
                alert("Client ID 없음 (.env 확인)");
                setLoading(false);
                return;
            }
            // 👇 [수정] 옵션을 다 지우고 빈 괄호로 실행하세요. (TS 에러 해결)
            await promptAsync();
        } catch (error) {
            console.error("Sign In Exception:", error);
            setLoading(false);
        }
    };

    /* ---------- UI 렌더링 ---------- */
    if (user) {
        return (
            <View style={styles.container}>
                <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
                <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={() => signOut(auth)}
                >
                    <Text style={[styles.buttonText, styles.logoutText]}>로그아웃</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={!request || loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color={colors.bg || "#fff"} />
            ) : (
                <Text style={styles.buttonText}>Google로 로그인</Text>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    email: {
        fontSize: (font?.small || 12) + 1,
        color: colors.text || "#000",
        maxWidth: 180,
        marginRight: 10,
    },
    button: {
        paddingHorizontal: space.md || 12,
        paddingVertical: space.sm || 8,
        borderRadius: radius.pill || 50,
        backgroundColor: colors.accent || "#000",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 120,
    },
    buttonText: {
        fontSize: (font?.small || 12) + 1,
        fontWeight: "800",
        color: colors.bg || "#fff",
    },
    logoutButton: {
        backgroundColor: colors.card || "#fff",
        borderWidth: 1,
        borderColor: colors.border || "#ddd",
    },
    logoutText: {
        color: colors.text || "#000",
    },
});
