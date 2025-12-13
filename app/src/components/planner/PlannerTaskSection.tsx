import React, { memo, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { PlannerTaskItem, type PlannerTaskWithLabel } from "./PlannerTaskItem";
import { colors, font, radius, space } from "../../styles/theme";

const SKELETON_COUNT = [1, 2, 3] as const;

type Ms = number;

/** YYYY-MM-DD → 로컬 타임존 기준 해당 날짜 00:00(ms) */
function toStartOfDayMsFromYmd(ymd?: string | null): Ms | null {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function toCreatedAtMs(createdAt: unknown): Ms {
    if (!createdAt) return 0;
    const v = createdAt as { toMillis?: () => number } | number;
    if (typeof (v as any).toMillis === "function") return (v as any).toMillis();
    if (typeof v === "number") return v;
    return 0;
}

function getLegacyDdayLabel(task: PlannerTaskWithLabel): string {
    return ((task as unknown as { ddayLabel?: string }).ddayLabel ?? "").trim();
}

function compareBoolFalseFirst(a: boolean, b: boolean): number {
    // false(미완료) 먼저
    if (a === b) return 0;
    return a ? 1 : -1;
}

function compareNullableAsc(a: Ms | null, b: Ms | null): number {
    // a,b 둘 다 있으면 오름차순
    if (a !== null && b !== null) return a - b;
    // 정책: deadline 있는 게 먼저
    if (a !== null && b === null) return -1;
    if (a === null && b !== null) return 1;
    return 0;
}

function compareDesc(a: Ms, b: Ms): number {
    return b - a;
}

function compareStringAsc(a?: string, b?: string): number {
    return (a ?? "").localeCompare(b ?? "");
}

function sortTasks(a: PlannerTaskWithLabel, b: PlannerTaskWithLabel): number {
    // 1) 미완료 먼저
    const c1 = compareBoolFalseFirst(a.done, b.done);
    if (c1) return c1;

    // 2) deadline 오름차순(빠른 마감 위)
    const aDue = toStartOfDayMsFromYmd(a.deadline);
    const bDue = toStartOfDayMsFromYmd(b.deadline);
    const c2 = compareNullableAsc(aDue, bDue);
    if (c2) return c2;

    // 3) createdAt 최신순
    const c3 = compareDesc(toCreatedAtMs(a.createdAt), toCreatedAtMs(b.createdAt));
    if (c3) return c3;

    // 4) title
    return compareStringAsc(a.title, b.title);
}

type PlannerTaskRowProps = {
    task: PlannerTaskWithLabel;
    onToggle?: (id: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
};

function PlannerTaskRowBase({ task, onToggle, onDelete }: PlannerTaskRowProps) {
    const handleToggle = useCallback(() => {
        if (!onToggle) return;
        void onToggle(task.id);
    }, [onToggle, task.id]);

    const handleDelete = useCallback(() => {
        if (!onDelete) return;
        void onDelete(task.id);
    }, [onDelete, task.id]);

    return (
        <View style={styles.itemWrapper}>
            <PlannerTaskItem task={task} onToggle={handleToggle} onDelete={handleDelete} />
        </View>
    );
}

function areRowPropsEqual(prev: PlannerTaskRowProps, next: PlannerTaskRowProps) {
    // 렌더에 영향을 주는 필드들만 비교
    return (
        prev.task.id === next.task.id &&
        prev.task.title === next.task.title &&
        prev.task.done === next.task.done &&
        (prev.task.deadline ?? null) === (next.task.deadline ?? null) &&
        (prev.task.applicationLabel ?? null) === (next.task.applicationLabel ?? null) &&
        // 레거시 ddayLabel: badge 표시가 바뀔 수 있음
        getLegacyDdayLabel(prev.task) === getLegacyDdayLabel(next.task) &&
        // 정렬 안정성(섹션 내부 정렬이 createdAt을 사용)
        toCreatedAtMs(prev.task.createdAt) === toCreatedAtMs(next.task.createdAt) &&
        prev.onToggle === next.onToggle &&
        prev.onDelete === next.onDelete
    );
}

const PlannerTaskRow = memo(PlannerTaskRowBase, areRowPropsEqual);

type PlannerTaskSectionProps = {
    title: string;
    loading: boolean;
    tasks: PlannerTaskWithLabel[];
    emptyMessage: string;
    onToggle?: (id: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
};

function PlannerTaskSectionBase({
                                    title,
                                    loading,
                                    tasks,
                                    emptyMessage,
                                    onToggle,
                                    onDelete,
                                }: PlannerTaskSectionProps) {
    const sortedTasks = useMemo(() => {
        const safeTasks = Array.isArray(tasks) ? tasks : [];
        return safeTasks.slice().sort(sortTasks);
    }, [tasks]);

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{title}</Text>
                {loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
            </View>

            {loading ? (
                <View style={styles.loadingWrapper}>
                    {SKELETON_COUNT.map((i) => (
                        <View key={i} style={styles.skeleton} />
                    ))}
                </View>
            ) : sortedTasks.length === 0 ? (
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            ) : (
                <View style={styles.listContent}>
                    {sortedTasks.map((task) => (
                        <PlannerTaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
                    ))}
                </View>
            )}
        </View>
    );
}

export const PlannerTaskSection = memo(PlannerTaskSectionBase);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.lg,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        marginBottom: space.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.sm,
    },

    title: {
        fontSize: font.h2,
        fontWeight: "700",
        color: colors.text,
    },

    loadingWrapper: { marginTop: space.xs },

    skeleton: {
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.accentSoft,
        marginTop: space.sm,
        borderWidth: 1,
        borderColor: colors.overlay, // 테두리 톤을 통일(원래 0.18 대신)
    },

    emptyText: {
        fontSize: font.body,
        color: colors.text,
        opacity: 0.7,
        marginTop: space.xs,
    },

    listContent: { paddingVertical: space.xs },

    itemWrapper: { marginBottom: 6 },
});