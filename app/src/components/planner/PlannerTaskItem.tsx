import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlannerTask as BasePlannerTask } from "../../../../shared/features/planner/types";
import { colors, space, radius, font } from "../../styles/theme";

export type PlannerTaskWithLabel = BasePlannerTask & {
    applicationLabel?: string | null;
    deadline?: string | null; // YYYY-MM-DD
};

type Props = {
    task: PlannerTaskWithLabel;
    onToggle?: () => void;
    onDelete?: () => void;
};

type Ymd = { y: number; m: number; d: number };

const DAY_MS = 1000 * 60 * 60 * 24;

function parseYmd(deadline?: string | null): Ymd | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map(Number);
    if (!y || !m || !d) return null;
    return { y, m, d };
}

function startOfTodayMs(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function toDueMs(ymd: Ymd): number {
    return new Date(ymd.y, ymd.m - 1, ymd.d).getTime();
}

function formatMmDd(ymd: Ymd): string {
    const mm = String(ymd.m).padStart(2, "0");
    const dd = String(ymd.d).padStart(2, "0");
    return `${mm}.${dd}`;
}

function formatDday(ymd: Ymd): string {
    const diffDays = Math.round((toDueMs(ymd) - startOfTodayMs()) / DAY_MS);
    if (diffDays === 0) return "D-day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

/** 레거시 ddayLabel(필드 확장 없이 안전하게 읽기) */
function getLegacyDdayLabel(task: PlannerTaskWithLabel): string {
    const legacy = (task as unknown as { ddayLabel?: string }).ddayLabel;
    return legacy?.trim() ?? "";
}

function buildBadgeText(task: PlannerTaskWithLabel): string {
    const ymd = parseYmd(task.deadline);
    if (ymd) {
        const date = formatMmDd(ymd);
        const dday = formatDday(ymd);
        return date && dday ? `${date} · ${dday}` : date || dday || "";
    }
    return getLegacyDdayLabel(task);
}

const pressableRowStyle = ({ pressed }: { pressed: boolean }) => [
    styles.leftButton,
    pressed && styles.leftButtonPressed,
];

const pressableIconStyle = ({ pressed }: { pressed: boolean }) => [
    styles.deleteButton,
    pressed && styles.deleteButtonPressed,
];

export function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const badgeText = useMemo(
        () => buildBadgeText(task),
        [task.deadline, task.done, task.title, task.applicationLabel],
    );

    const iconName = task.done ? "checkmark-circle" : "ellipse-outline";
    const iconColor = task.done ? colors.accent : colors.placeholder;

    return (
        <View style={styles.container}>
            {/* 왼쪽: 체크 토글 */}
            <Pressable
                onPress={onToggle}
                android_ripple={{ color: colors.overlay }}
                style={pressableRowStyle}
            >
                <Ionicons name={iconName} size={20} color={iconColor} />

                <View style={styles.textColumn}>
                    <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
                        {task.title}
                    </Text>

                    {!!task.applicationLabel && (
                        <Text style={styles.appLabel} numberOfLines={1}>
                            <Text style={styles.appLabelPrefix}>관련 공고: </Text>
                            {task.applicationLabel}
                        </Text>
                    )}
                </View>
            </Pressable>

            {/* 오른쪽: 뱃지 + 삭제 */}
            <View style={styles.rightArea}>
                {!!badgeText && (
                    <View style={styles.ddayBadge}>
                        <Text style={styles.ddayText}>{badgeText}</Text>
                    </View>
                )}

                {!!onDelete && (
                    <Pressable
                        onPress={onDelete}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        android_ripple={{ color: colors.overlay, borderless: true }}
                        style={pressableIconStyle}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.placeholder} />
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
        backgroundColor: colors.bg,
        borderRadius: radius.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
        marginBottom: space.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },

    leftButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: space.xs,
    },
    leftButtonPressed: { opacity: 0.85 },

    textColumn: {
        flexShrink: 1,
        marginLeft: space.sm,
    },

    title: {
        flexShrink: 1,
        fontSize: 14,
        lineHeight: 18,
        color: colors.textStrong,
    },
    titleDone: {
        color: colors.placeholder,
        textDecorationLine: "line-through",
        opacity: 0.9,
    },

    appLabel: {
        marginTop: 2,
        fontSize: font.small,
        color: colors.text,
        opacity: 0.75,
    },
    appLabelPrefix: { color: colors.placeholder },

    rightArea: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: space.md,
    },

    ddayBadge: {
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
        paddingHorizontal: space.sm,
        paddingVertical: 3,
        marginRight: space.sm,
    },
    ddayText: {
        fontSize: font.small,
        color: colors.accent,
        fontWeight: "700",
    },

    deleteButton: {
        borderRadius: radius.pill,
        padding: 6,
        backgroundColor: colors.accentSoft,
    },
    deleteButtonPressed: { opacity: 0.85 },
});