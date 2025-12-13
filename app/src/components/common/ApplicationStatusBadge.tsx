// app/src/components/applications/ApplicationStatusBadge.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import type { ApplicationStatus } from "../../../../shared/features/applications/types";

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

// ✅ shared 상태값 전체를 커버하도록 확장
const STATUS_CONFIG: Partial<Record<ApplicationStatus, StatusConfig>> = {
    "지원 예정": {
        label: "지원 예정",
        bgColor: "#111827",
        textColor: "#E5E7EB",
        iconName: "assignment",
    },
    "서류 제출": {
        label: "서류 제출",
        bgColor: "#0EA5E9",
        textColor: "#0B1120",
        iconName: "cloud-upload",
    },
    "서류 통과": {
        label: "서류 통과",
        bgColor: "#8B5CF6",
        textColor: "#F9FAFB",
        iconName: "verified",
    },
    "면접 예정": {
        label: "면접 예정",
        bgColor: "#F59E0B",
        textColor: "#0B1120",
        iconName: "event",
    },
    "면접 완료": {
        label: "면접 완료",
        bgColor: "#F59E0B",
        textColor: "#0B1120",
        iconName: "event-available",
    },
    "최종 합격": {
        label: "최종 합격",
        bgColor: "#22C55E",
        textColor: "#022C22",
        iconName: "sentiment-satisfied-alt",
    },
    "불합격": {
        label: "불합격",
        bgColor: "#EF4444",
        textColor: "#0B1120",
        iconName: "sentiment-dissatisfied",
    },
    "지원 철회": {
        label: "지원 철회",
        bgColor: "#334155", // slate-700
        textColor: "#E5E7EB",
        iconName: "undo",
    },
};

function getStatusConfig(status?: ApplicationStatus): StatusConfig {
    const s = status ?? FALLBACK_STATUS;
    return STATUS_CONFIG[s] ?? STATUS_CONFIG[FALLBACK_STATUS]!;
}

function ApplicationStatusBadgeBase({ status }: Props) {
    const config = getStatusConfig(status);

    return (
        <View
            style={[styles.badge, { backgroundColor: config.bgColor }]}
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
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: "100%",
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: "500",
        flexShrink: 1,
    },
});