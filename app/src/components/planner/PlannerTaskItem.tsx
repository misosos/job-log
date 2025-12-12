// app/src/components/planner/PlannerTaskItem.tsx

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// 🔹 shared 쪽 기본 PlannerTask 타입
import type { PlannerTask as BasePlannerTask } from "../../../../shared/features/planner/types";

// 🔹 shared PlannerTask 에서 앱에서만 쓸 표시용 필드 확장
export type PlannerTaskWithLabel = BasePlannerTask & {
    applicationLabel?: string | null;
};

type Props = {
    task: PlannerTaskWithLabel;
    onToggle?: () => void;
    onDelete?: () => void;
};

export function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const iconName = task.done ? "checkmark-circle" : "ellipse-outline";
    const iconColor = task.done ? "#34d399" : "#6b7280"; // emerald-400 / slate-500

    return (
        <View style={styles.container}>
            {/* 왼쪽: 체크 토글 영역 */}
            <Pressable
                onPress={onToggle}
                android_ripple={{ color: "rgba(148,163,184,0.3)" }}
                style={({ pressed }) => [
                    styles.leftButton,
                    pressed && styles.leftButtonPressed,
                ]}
            >
                <Ionicons name={iconName} size={20} color={iconColor} />

                <View style={styles.textColumn}>
                    <Text
                        style={[styles.title, task.done && styles.titleDone]}
                        numberOfLines={2}
                    >
                        {task.title}
                    </Text>

                    {task.applicationLabel ? (
                        <Text style={styles.appLabel} numberOfLines={1}>
                            {task.applicationLabel}
                        </Text>
                    ) : null}
                </View>
            </Pressable>

            {/* 오른쪽: D-day + 삭제 버튼 */}
            <View style={styles.rightArea}>
                {task.ddayLabel ? (
                    <View style={styles.ddayBadge}>
                        <Text style={styles.ddayText}>{task.ddayLabel}</Text>
                    </View>
                ) : null}

                {onDelete && (
                    <Pressable
                        onPress={onDelete}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        android_ripple={{
                            color: "rgba(148,163,184,0.3)",
                            borderless: true,
                        }}
                        style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.deleteButtonPressed,
                        ]}
                    >
                        <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(15,23,42,0.9)", // slate-900/90
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 8,
    },
    leftButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
    },
    leftButtonPressed: {
        opacity: 0.8,
    },
    textColumn: {
        flexShrink: 1,
        marginLeft: 8,
    },
    title: {
        flexShrink: 1,
        fontSize: 14,
        lineHeight: 18,
        color: "#f9fafb", // slate-50
    },
    appLabel: {
        marginTop: 2,
        fontSize: 11,
        color: "#9ca3af", // slate-400
    },
    titleDone: {
        color: "#9ca3af", // slate-400
        textDecorationLine: "line-through",
    },
    rightArea: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },
    ddayBadge: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(52,211,153,0.5)", // emerald-400/50
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 6,
    },
    ddayText: {
        fontSize: 11,
        color: "#6ee7b7", // emerald-300
    },
    deleteButton: {
        borderRadius: 999,
        padding: 6,
    },
    deleteButtonPressed: {
        opacity: 0.8,
    },
});