// app/screens/auth/LoginScreen.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";

export function LoginScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Job Log 로그인</Text>
                <Text style={styles.description}>
                    지원 현황, 이력서, 면접 기록을 한 번에 관리해요.
                </Text>

                <GoogleSignInButton />
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
});