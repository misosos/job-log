import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlannerTask as BasePlannerTask } from "../../../../shared/features/planner/types";

// ✅ 앱에서만 쓰는 표시용 필드만 확장 (중복 필드 재정의 X)
export type PlannerTaskWithLabel = BasePlannerTask & {
    applicationLabel?: string | null;
    deadline?: string | null; // YYYY-MM-DD
};

type Props = {
    task: PlannerTaskWithLabel;
    onToggle?: () => void;
    onDelete?: () => void;
};

function parseYmd(deadline?: string | null): { y: number; m: number; d: number } | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return { y, m, d };
}

function computeDdayLabelFromDeadline(deadline?: string | null): string {
    const parsed = parseYmd(deadline);
    if (!parsed) return "";

    const { y, m, d } = parsed;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();

    const diffDays = Math.round((due - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

function formatDeadlineShort(deadline?: string | null): string {
    const parsed = parseYmd(deadline);
    if (!parsed) return "";
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${mm}.${dd}`;
}

function buildBadgeText(task: PlannerTaskWithLabel): string {
    // ✅ 1) deadline이 있으면: "MM.DD · D-x"
    if (task.deadline) {
        const date = formatDeadlineShort(task.deadline);
        const dday = computeDdayLabelFromDeadline(task.deadline);

        // 둘 중 하나라도 있으면 표시 (조합 깔끔하게)
        if (date && dday) return `${date} · ${dday}`;
        if (date) return date;
        if (dday) return dday;
        return "";
    }

    // ✅ 2) 구데이터 fallback: ddayLabel만 있는 경우
    const legacy = (task as unknown as { ddayLabel?: string }).ddayLabel?.trim();
    return legacy && legacy.length > 0 ? legacy : "";
}
export function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const iconName = task.done ? "checkmark-circle" : "ellipse-outline";

    // ✅ rose theme
    const iconColor = task.done ? "#f43f5e" : "#fb7185"; // rose-500 / rose-400
    const badgeText = buildBadgeText(task);

    return (
        <View style={styles.container}>
            {/* 왼쪽: 체크 토글 영역 */}
            <Pressable
                onPress={onToggle}
                android_ripple={{ color: "rgba(148,163,184,0.3)" }}
                style={({ pressed }) => [styles.leftButton, pressed && styles.leftButtonPressed]}
            >
                <Ionicons name={iconName} size={20} color={iconColor} />

                <View style={styles.textColumn}>
                    <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
                        {task.title}
                    </Text>

                    {task.applicationLabel ? (
                        <Text style={styles.appLabel} numberOfLines={1}>
                            <Text style={styles.appLabelPrefix}>관련 공고: </Text>
                            {task.applicationLabel}
                        </Text>
                    ) : null}
                </View>
            </Pressable>

            {/* 오른쪽: 마감 뱃지 + 삭제 */}
            <View style={styles.rightArea}>
                {badgeText ? (
                    <View style={styles.ddayBadge}>
                        <Text style={styles.ddayText}>{badgeText}</Text>
                    </View>
                ) : null}

                {onDelete && (
                    <Pressable
                        onPress={onDelete}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        android_ripple={{ color: "rgba(148,163,184,0.3)", borderless: true }}
                        style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
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
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    leftButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
    },
    leftButtonPressed: {
        opacity: 0.85,
    },

    textColumn: {
        flexShrink: 1,
        marginLeft: 8,
    },

    title: {
        flexShrink: 1,
        fontSize: 14,
        lineHeight: 18,
        color: "#881337", // rose-900
    },

    appLabel: {
        marginTop: 2,
        fontSize: 11,
        color: "#9f1239", // rose-800 (필요할 때만 진하게)
        opacity: 0.75,
    },
    appLabelPrefix: {
        color: "#fb7185", // rose-400
    },

    titleDone: {
        color: "#fb7185", // rose-400
        textDecorationLine: "line-through",
        opacity: 0.9,
    },

    rightArea: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },

    ddayBadge: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(244, 63, 94, 0.45)", // rose-500/45
        backgroundColor: "rgba(244, 63, 94, 0.10)", // rose-500/10
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 6,
    },
    ddayText: {
        fontSize: 11,
        color: "#f43f5e", // rose-500
        fontWeight: "700",
    },

    deleteButton: {
        borderRadius: 999,
        padding: 6,
        backgroundColor: "rgba(244, 63, 94, 0.10)", // rose-500/10 (터치 영역 시각화)
    },
    deleteButtonPressed: {
        opacity: 0.85,
    },
});