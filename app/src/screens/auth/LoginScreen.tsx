// app/screens/auth/LoginScreen.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { EmailAuthForm } from "../../components/auth/EmailAuthForm";
import { useAuth } from "../../libs/auth-context";

export function LoginScreen() {
    const { rememberMe, setRememberMe } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Job Log 로그인</Text>
                <Text style={styles.description}>
                    지원 현황, 이력서, 면접 기록을 한 번에 관리해요.
                </Text>

                {/* ✅ 로그인 유지 */}
                <Pressable
                    style={styles.rememberRow}
                    onPress={() => void setRememberMe(!rememberMe)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberMe }}
                >
                    <View
                        style={[
                            styles.rememberBox,
                            rememberMe && styles.rememberBoxChecked,
                        ]}
                    >
                        {rememberMe ? (
                            <Text style={styles.rememberCheck}>✓</Text>
                        ) : null}
                    </View>
                    <View style={styles.rememberTextCol}>
                        <Text style={styles.rememberLabel}>로그인 유지</Text>
                        <Text style={styles.rememberHint}>
                            체크하지 않으면 앱을 다시 열 때 자동 로그아웃돼요.
                        </Text>
                    </View>
                </Pressable>

                {/* ✅ 이메일 로그인/회원가입 폼 */}
                <EmailAuthForm />

                {/* 구분선 */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>또는</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* ✅ 기존 Google 로그인 버튼 */}
                <View style={styles.googleWrapper}>
                    <GoogleSignInButton />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff1f2", // rose-50
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#ffe4e6", // rose-100
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: "900",
        color: "#9f1239", // rose-800
        marginBottom: 8,
    },
    description: {
        fontSize: 13,
        color: "#9f1239", // rose-800
        opacity: 0.65,
        marginBottom: 20,
    },

    rememberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#fff1f2", // rose-50
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        marginBottom: 12,
    },
    rememberBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    rememberBoxChecked: {
        borderColor: "#f43f5e", // rose-500
        backgroundColor: "rgba(244,63,94,0.12)", // rose-500 12%
    },
    rememberCheck: {
        fontSize: 12,
        fontWeight: "900",
        color: "#f43f5e", // rose-500
        lineHeight: 14,
    },
    rememberTextCol: {
        flex: 1,
    },
    rememberLabel: {
        fontSize: 13,
        fontWeight: "800",
        color: "#9f1239", // rose-800
    },
    rememberHint: {
        marginTop: 2,
        fontSize: 11,
        color: "#9f1239", // rose-800
        opacity: 0.55,
    },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#fecdd3", // rose-200
    },
    dividerText: {
        marginHorizontal: 8,
        fontSize: 11,
        color: "#fb7185", // rose-400
        fontWeight: "700",
    },

    googleWrapper: {
        marginTop: 4,
    },
});