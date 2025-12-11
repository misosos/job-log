// app/components/planner/PlannerTaskItem.tsx (예시 경로)

import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlannerTask } from "../../features/planner/types";

type Props = {
    task: PlannerTask;
    onToggle?: () => void;
    onDelete?: () => void;
};

export function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const iconName = task.done ? "checkmark-circle" : "ellipse-outline";
    const iconColor = task.done ? "#34d399" : "#6b7280"; // emerald-400 / slate-500

    return (
        <View style={styles.container}>
            {/* 왼쪽: 체크 토글 영역 */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onToggle}
                style={styles.leftButton}
            >
                <Ionicons name={iconName} size={18} color={iconColor} />

                <Text
                    style={[
                        styles.title,
                        task.done && styles.titleDone,
                    ]}
                    numberOfLines={2}
                >
                    {task.title}
                </Text>
            </TouchableOpacity>

            {/* 오른쪽: D-day + 삭제 버튼 */}
            <View style={styles.rightArea}>
                {task.ddayLabel ? (
                    <View style={styles.ddayBadge}>
                        <Text style={styles.ddayText}>{task.ddayLabel}</Text>
                    </View>
                ) : null}

                {onDelete && (
                    <TouchableOpacity
                        onPress={onDelete}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                    </TouchableOpacity>
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
        backgroundColor: "rgba(15,23,42,0.8)", // slate-900/80
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 4,
    },
    leftButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 14,
        color: "#f9fafb", // slate-50
    },
    titleDone: {
        color: "#9ca3af", // slate-400
        textDecorationLine: "line-through",
    },
    rightArea: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginLeft: 8,
    },
    ddayBadge: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(52,211,153,0.5)", // emerald-400/50
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    ddayText: {
        fontSize: 10,
        color: "#6ee7b7", // emerald-300
    },
    deleteButton: {
        borderRadius: 999,
        padding: 4,
    },
});