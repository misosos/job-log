import React, { type ReactNode, memo } from "react";
import {
    ScrollView,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    type ScrollViewProps,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { AppHeader } from "./AppHeader";
import { colors, space } from "../../styles/theme";

type Props = {
    children: ReactNode;
    hideHeader?: boolean;
    edges?: readonly Edge[];
    contentStyle?: StyleProp<ViewStyle>;
    scrollProps?: Omit<ScrollViewProps, "contentContainerStyle" | "children">;
    statusBarStyle?: "auto" | "inverted" | "light" | "dark";
};

export const PageLayout = memo(function PageLayout({
                                                       children,
                                                       hideHeader = false,
                                                       edges = ["top"],
                                                       contentStyle,
                                                       scrollProps,
                                                       statusBarStyle = "light",
                                                   }: Props) {
    return (
        <SafeAreaView style={styles.safeArea} edges={edges}>
            <StatusBar style={statusBarStyle} />

            {!hideHeader && <AppHeader />}

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 0, default: 0 })}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[styles.content, contentStyle]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    {...scrollProps}
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    flex: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: space.lg, // 16
        paddingTop: space.lg,        // 16
        paddingBottom: space.lg + space.sm, // 24
        width: "100%",
        maxWidth: 960,
        alignSelf: "center",
    },
});