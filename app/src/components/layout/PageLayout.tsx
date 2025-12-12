// src/components/layout/PageLayout.tsx
import React, { type ReactNode } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ 여기로 변경

import { AppHeader } from "./AppHeader";

type Props = {
    children: ReactNode;
};

export function PageLayout({ children }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            <View style={styles.container}>
                <AppHeader />

                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#020617",
    },
    container: {
        flex: 1,
        backgroundColor: "#020617",
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        width: "100%",
        maxWidth: 960,
        alignSelf: "center",
    },
});