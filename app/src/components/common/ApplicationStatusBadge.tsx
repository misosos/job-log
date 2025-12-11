// app/src/components/applications/ApplicationStatusBadge.tsx
import React from "react";
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

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    "지원 예정": {
        label: "지원 예정",
        bgColor: "#1f2937", // slate-800
        textColor: "#e5e7eb", // slate-200
        iconName: "assignment",
    },
    "서류 제출": {
        label: "서류 제출",
        bgColor: "#0ea5e9", // sky-500 비슷
        textColor: "#0b1120", // slate-950
        iconName: "check-circle-outline",
    },
    "서류 통과": {
        label: "서류 통과",
        bgColor: "#8b5cf6", // violet-500 비슷
        textColor: "#f9fafb", // zinc-50
        iconName: "verified",
    },
    "면접 진행": {
        label: "면접 진행",
        bgColor: "#f59e0b", // amber-500
        textColor: "#0b1120",
        iconName: "event-available",
    },
    "최종 합격": {
        label: "최종 합격",
        bgColor: "#22c55e", // emerald-500
        textColor: "#022c22",
        iconName: "sentiment-satisfied-alt",
    },
    "불합격": {
        label: "불합격",
        bgColor: "#ef4444", // red-500
        textColor: "#0b1120",
        iconName: "sentiment-dissatisfied",
    },
};

const FALLBACK_STATUS: ApplicationStatus = "지원 예정";

export function ApplicationStatusBadge({ status }: Props) {
    const currentStatus: ApplicationStatus = status ?? FALLBACK_STATUS;
    const config = STATUS_CONFIG[currentStatus];

    if (!config) {
        // 혹시 모르는 이상값 방어
        return (
            <View style={[styles.badge, { backgroundColor: "#1f2937" }]}>
                <Text style={[styles.label, { color: "#e5e7eb" }]}>
                    {currentStatus}
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: config.bgColor,
                },
            ]}
        >
            <MaterialIcons
                name={config.iconName}
                size={14}
                color={config.textColor}
                style={styles.icon}
            />
            <Text style={[styles.label, { color: config.textColor }]}>
                {config.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: "500",
    },
});