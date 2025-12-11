// app/screens/LoginScreen.tsx (예시 경로)

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { auth } from "../../libs/firebase";

// 네비게이션 스택 타입 (네이밍은 프로젝트에 맞게 수정 가능)
type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
};

type Navigation = NativeStackNavigationProp<RootStackParamList, "Login">;

export function LoginScreen() {
    const navigation = useNavigation<Navigation>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // 로그인 성공 시 대시보드로 이동 (스택 리셋해서 뒤로가기 막기)
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Dashboard" }],
                });
            }
        });

        return unsubscribe;
    }, [navigation]);

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
        backgroundColor: "#020617", // 대략 tailwind slate-900
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