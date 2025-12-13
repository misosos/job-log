// app/src/components/common/SectionCard.tsx
import type { ReactNode } from "react";
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    type StyleProp,
    type ViewStyle,
} from "react-native";

type SectionCardProps = {
    title: string;
    children: ReactNode;
    /** 카드 전체 스타일 커스터마이즈용 */
    style?: StyleProp<ViewStyle>;
    /** 우측 상단 액션 버튼/필터 등 */
    actions?: ReactNode;
};

export function SectionCard({ title, children, style, actions }: SectionCardProps) {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {actions ? <View style={styles.actions}>{actions}</View> : null}
            </View>

            <View style={styles.body}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff1f2", // rose-50
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        width: "100%",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.10,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            },
            android: {
                elevation: 2,
            },
            default: {},
        }),
    },

    header: {
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#9f1239", // rose-800 (필요할 때만 진하게)
    },

    actions: {
        marginLeft: 8,
    },

    body: {
        marginTop: 4,
    },
});