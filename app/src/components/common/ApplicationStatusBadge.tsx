import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import type { ApplicationStatus } from "../../../../shared/features/applications/types";
import { colors,radius } from "../../styles/theme";

type Props = {
    status?: ApplicationStatus;
};

type StatusConfig = Readonly<{
    label: string;
    bgColor: string;
    textColor: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
}>;

const FALLBACK_STATUS: ApplicationStatus = "지원 예정";

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    "지원 예정": {
        label: "지원 예정",
        bgColor: colors.textStrong,
        textColor: colors.bg,
        iconName: "assignment",
    },
    "서류 제출": {
        label: "서류 제출",
        bgColor: colors.accent,
        textColor: colors.bg,
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
        bgColor: "#334155",
        textColor: "#E5E7EB",
        iconName: "undo",
    },
};

function resolveStatus(status?: ApplicationStatus): ApplicationStatus {
    return status ?? FALLBACK_STATUS;
}

function ApplicationStatusBadgeBase({ status }: Props) {
    const cfg = useMemo(() => STATUS_CONFIG[resolveStatus(status)], [status]);

    return (
        <View
            style={[styles.badge, { backgroundColor: cfg.bgColor }]}
            accessibilityRole="text"
            accessibilityLabel={`지원 상태: ${cfg.label}`}
            testID={`application-status-${cfg.label}`}
        >
            <MaterialIcons name={cfg.iconName} size={14} color={cfg.textColor} style={styles.icon} />
            <Text style={[styles.label, { color: cfg.textColor }]} numberOfLines={1} ellipsizeMode="tail">
                {cfg.label}
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
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
        maxWidth: "100%",
    },
    icon: { marginRight: 4 },
    label: {
        fontSize: 12, // 또는 font.small 쓰고 싶으면 font.small
        fontWeight: "600",
        flexShrink: 1,
    },
});