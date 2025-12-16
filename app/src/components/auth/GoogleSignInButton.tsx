import React, { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import {
    GoogleSignin,
    isSuccessResponse,
    statusCodes,
} from "@react-native-google-signin/google-signin";

import { auth } from "../../libs/firebase";
import { colors, space, radius, font } from "../../styles/theme";

export const GoogleSignInButton = memo(function GoogleSignInButton() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    }, []);

    const handleSignIn = useCallback(async () => {
        setLoading(true);
        try {
            const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
            if (!webClientId) {
                alert("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID 없음 (.env.local 확인)");
                return;
            }

            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            await GoogleSignin.signOut().catch(() => {});

            const signInRes = await GoogleSignin.signIn();
            if (!isSuccessResponse(signInRes)) return;

            const { idToken } = await GoogleSignin.getTokens();
            if (!idToken) {
                throw new Error(
                    "Google idToken이 없습니다. webClientId(client_type:3)/SHA-1 설정을 확인하세요."
                );
            }

            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);

            console.log("Google 로그인 성공");
        } catch (err: any) {
            if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
            if (err?.code === statusCodes.IN_PROGRESS) return;

            console.error("Google Sign-In Error:", err);
            alert("로그인 실패: " + (err?.message ?? String(err)));
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
            {loading ? (
                <ActivityIndicator size="small" color={colors.bg || "#fff"} />
            ) : (
                <Text style={styles.buttonText}>Google로 로그인</Text>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
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
});