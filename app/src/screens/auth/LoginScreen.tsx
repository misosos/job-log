// app/screens/auth/LoginScreen.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { EmailAuthForm } from "../../components/auth/EmailAuthForm";

export function LoginScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Job Log 로그인</Text>
                <Text style={styles.description}>
                    지원 현황, 이력서, 면접 기록을 한 번에 관리해요.
                </Text>

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
        backgroundColor: "#020617", // tailwind slate-900 느낌
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#0f172a", // slate-800 느낌
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 8,
    },
    description: {
        fontSize: 13,
        color: "#e5e7eb", // slate-300 느낌
        marginBottom: 20,
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
        backgroundColor: "#1f2937", // slate-800
    },
    dividerText: {
        marginHorizontal: 8,
        fontSize: 11,
        color: "#9ca3af", // slate-400
    },
    googleWrapper: {
        marginTop: 4,
    },
});