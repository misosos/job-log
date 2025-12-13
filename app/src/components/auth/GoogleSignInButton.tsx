import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
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
import { colors, space, radius, font } from "../../styles/theme";

WebBrowser.maybeCompleteAuthSession();

type GoogleSignInButtonProps = {
    hideWhenLoggedOut?: boolean;
};

type GoogleResponseLike = {
    type?: string;
    authentication?: { idToken?: string };
    params?: { id_token?: string };
};

function useAuthEmail() {
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setEmail(user?.email ?? null));
        return () => unsub();
    }, []);

    return email;
}

function getIdTokenFromResponse(response: unknown): string | null {
    const r = response as GoogleResponseLike | null;
    const idToken = r?.authentication?.idToken ?? r?.params?.id_token ?? null;
    return typeof idToken === "string" && idToken.length > 0 ? idToken : null;
}

export const GoogleSignInButton = memo(function GoogleSignInButton({
                                                                       hideWhenLoggedOut = false,
                                                                   }: GoogleSignInButtonProps) {
    const userEmail = useAuthEmail();
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        scopes: ["openid", "email", "profile"],
    });

    const withLoading = useCallback(async (fn: () => Promise<void>) => {
        setLoading(true);
        try {
            await fn();
        } finally {
            setLoading(false);
        }
    }, []);

    const signInWeb = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        console.log("[Auth] web signInWithPopup success");
    }, []);

    const signInNative = useCallback(async () => {
        if (!request) {
            console.log("[Auth] Google request not ready yet");
            return;
        }
        await promptAsync();
    }, [request, promptAsync]);

    const handleNativeResponse = useCallback(async () => {
        if (Platform.OS === "web") return;
        if (!response) return;
        if ((response as { type?: string }).type !== "success") return;

        const idToken = getIdTokenFromResponse(response);
        if (!idToken) {
            console.log("[Auth] no id_token in response", JSON.stringify(response));
            return;
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        console.log("[Auth] native signIn success");
    }, [response]);

    useEffect(() => {
        void withLoading(handleNativeResponse);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleNativeResponse]);

    const handleSignIn = useCallback(() => {
        return withLoading(async () => {
            if (Platform.OS === "web") {
                await signInWeb();
                return;
            }
            await signInNative();
        });
    }, [withLoading, signInWeb, signInNative]);

    const handleSignOut = useCallback(() => {
        return withLoading(async () => {
            await signOut(auth);
        });
    }, [withLoading]);

    const isDisabled = useMemo(() => {
        const needsRequest = Platform.OS !== "web";
        return loading || (needsRequest && !request);
    }, [loading, request]);

    if (!userEmail && hideWhenLoggedOut) return null;

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
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                        <Text style={[styles.buttonText, styles.logoutText]}>로그아웃</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isDisabled}
            activeOpacity={0.9}
        >
            {loading ? (
                <ActivityIndicator size="small" color={colors.bg} />
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
        fontSize: font.small + 1, // 12
        color: colors.text,
        maxWidth: 180,
    },

    button: {
        paddingHorizontal: space.md - 2, // 12
        paddingVertical: space.sm - 2, // 6
        borderRadius: radius.pill,
        backgroundColor: colors.accent,
        marginLeft: space.sm, // 8 (RN gap 대체)
        alignItems: "center",
        justifyContent: "center",
    },

    buttonDisabled: {
        opacity: 0.55,
    },

    buttonText: {
        fontSize: font.small + 1, // 12
        fontWeight: "800",
        color: colors.bg,
    },

    logoutButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },

    logoutText: {
        color: colors.text,
        fontWeight: "800",
    },
});