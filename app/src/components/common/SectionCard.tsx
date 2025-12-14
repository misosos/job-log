import React, { type ReactNode } from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { colors, radius, space } from "../../styles/theme";

type SectionCardProps = {
    title: string;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    actions?: ReactNode;
};

const CARD_SHADOW = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 2 },
    default: {},
});

export function SectionCard({ title, children, style, actions }: SectionCardProps) {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                {actions ? <View style={styles.actions}>{actions}</View> : null}
            </View>

            <View style={styles.body}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",

        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,

        paddingHorizontal: space.lg,
        paddingVertical: space.lg,
        marginBottom: space.lg,

        ...(CARD_SHADOW as object),
    },

    header: {
        marginBottom: space.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: space.sm,
    },

    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
    },

    actions: { flexShrink: 0 },

    body: { marginTop: space.xs },
});