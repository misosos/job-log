// app/screens/auth/LoginScreen.tsx
import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { EmailAuthForm } from "../../components/auth/EmailAuthForm";
import { useAuth } from "../../libs/auth-context";

import { colors, font, radius, space } from "../../styles/theme";

type RememberMeRowProps = {
    checked: boolean;
    onToggle: () => void;
};

const RememberMeRow = memo(function RememberMeRow({
                                                      checked,
                                                      onToggle,
                                                  }: RememberMeRowProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.rememberRow, pressed && styles.pressed]}
            onPress={onToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            hitSlop={8}
        >
            <View style={[styles.rememberBox, checked && styles.rememberBoxChecked]}>
                {checked ? <Text style={styles.rememberCheck}>✓</Text> : null}
            </View>

            <View style={styles.rememberTextCol}>
                <Text style={styles.rememberLabel}>로그인 유지</Text>
                <Text style={styles.rememberHint}>
                    체크하지 않으면 앱을 다시 열 때 자동 로그아웃돼요.
                </Text>
            </View>
        </Pressable>
    );
});

export function LoginScreen() {
    const { rememberMe, setRememberMe } = useAuth();

    const toggleRemember = useCallback(() => {
        setRememberMe(!rememberMe);
    }, [rememberMe, setRememberMe]);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Job Log 로그인</Text>
                <Text style={styles.description}>
                    지원 현황, 이력서, 면접 기록을 한 번에 관리해요.
                </Text>

                <RememberMeRow checked={rememberMe} onToggle={toggleRemember} />

                <EmailAuthForm />

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>또는</Text>
                    <View style={styles.dividerLine} />
                </View>

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
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24, // 레이아웃 고정값 유지
    },

    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: colors.section,
        borderRadius: radius.lg,
        padding: space.lg,
        borderWidth: 1,
        borderColor: colors.border,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    title: {
        fontSize: 22, // font 토큰에 22가 없어서 고정 유지
        fontWeight: "900",
        color: colors.text,
        marginBottom: space.sm,
    },

    description: {
        fontSize: font.body,
        color: colors.text,
        opacity: 0.65,
        marginBottom: 20, // 기존 유지
    },

    rememberRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10, // 기존 유지
        paddingHorizontal: space.md,
        borderRadius: radius.md,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: space.md,
    },

    // gap 대체(구 RN 호환): 박스-텍스트 간격
    rememberBox: {
        width: 18,
        height: 18,
        borderRadius: 4, // 토큰에 xs radius 없어서 유지
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        marginRight: 10, // 기존 유지
    },

    rememberBoxChecked: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
    },

    rememberCheck: {
        fontSize: 12,
        fontWeight: "900",
        color: colors.accent,
        lineHeight: 14,
    },

    rememberTextCol: { flex: 1 },

    rememberLabel: {
        fontSize: font.body,
        fontWeight: "800",
        color: colors.text,
    },

    rememberHint: {
        marginTop: space.xs,
        fontSize: font.small,
        color: colors.text,
        opacity: 0.55,
    },

    pressed: { opacity: 0.9 },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20, // 기존 유지
        marginBottom: space.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: space.sm,
        fontSize: font.small,
        color: colors.placeholder,
        fontWeight: "700",
    },

    googleWrapper: { marginTop: space.xs },
});