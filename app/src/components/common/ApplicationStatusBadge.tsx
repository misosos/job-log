// app/src/components/applications/ApplicationStatusBadge.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export type ApplicationStatus =
    | "지원 예정"
    | "서류 제출"
    | "서류 통과"
    | "면접 진행"
    | "최종 합격"
    | "불합격";

type Props = {
    status?: ApplicationStatus;
};

type StatusConfig = {
    label: string;
    bgColor: string;
    textColor: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
};

const FALLBACK_STATUS: ApplicationStatus = "지원 예정";

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    "지원 예정": {
        label: "지원 예정",
        bgColor: "#111827", // slate-900 쪽으로 좀 더 진하게
        textColor: "#E5E7EB",
        iconName: "assignment",
    },
    "서류 제출": {
        label: "서류 제출",
        bgColor: "#0EA5E9", // sky-500
        textColor: "#0B1120",
        iconName: "check-circle-outline",
    },
    "서류 통과": {
        label: "서류 통과",
        bgColor: "#8B5CF6", // violet-500
        textColor: "#F9FAFB",
        iconName: "verified",
    },
    "면접 진행": {
        label: "면접 진행",
        bgColor: "#F59E0B", // amber-500
        textColor: "#0B1120",
        iconName: "event-available",
    },
    "최종 합격": {
        label: "최종 합격",
        bgColor: "#22C55E", // emerald-500
        textColor: "#022C22",
        iconName: "sentiment-satisfied-alt",
    },
    "불합격": {
        label: "불합격",
        bgColor: "#EF4444", // red-500
        textColor: "#0B1120",
        iconName: "sentiment-dissatisfied",
    },
};

function getStatusConfig(status?: ApplicationStatus): StatusConfig {
    const safeStatus = status ?? FALLBACK_STATUS;
    return STATUS_CONFIG[safeStatus] ?? STATUS_CONFIG[FALLBACK_STATUS];
}

function ApplicationStatusBadgeBase({ status }: Props) {
    const config = getStatusConfig(status);

    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: config.bgColor },
            ]}
            accessibilityRole="text"
            accessibilityLabel={`지원 상태: ${config.label}`}
            testID={`application-status-${config.label}`}
        >
            <MaterialIcons
                name={config.iconName}
                size={14}
                color={config.textColor}
                style={styles.icon}
            />
            <Text
                style={[styles.label, { color: config.textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {config.label}
            </Text>
        </View>
    );
}

export const ApplicationStatusBadge = memo(ApplicationStatusBadgeBase);

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start", // 리스트에서 줄 안 깨지고 좌측 정렬
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4, // 살짝 키움 (터치/가독성)
        maxWidth: "100%",
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontSize: 12, // 11 → 12로 약간 키움
        fontWeight: "500",
        flexShrink: 1, // 긴 텍스트에서 줄 안 넘치게
    },
});