// app/src/components/common/SectionCard.tsx
import type { ReactNode } from "react";
import React from "react";
import {
    View,
    Text,
    StyleSheet,
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

            <View>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617", // slate-950 비슷
        borderWidth: 1,
        borderColor: "#1e293b", // slate-800
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },
    header: {
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
    },
    actions: {
        marginLeft: 8,
    },
});