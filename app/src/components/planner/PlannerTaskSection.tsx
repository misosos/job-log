import React, { memo, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { PlannerTaskItem, type PlannerTaskWithLabel } from "./PlannerTaskItem";

/** YYYY-MM-DD → 해당 날짜 00:00(ms) */
function deadlineToStartOfDayMs(deadline?: string | null): number | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    // ✅ 로컬 타임존의 '날짜 00:00'으로 고정
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function getCreatedAtMs(createdAt: unknown): number {
    if (!createdAt) return 0;
    // Firestore Timestamp has toMillis()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyVal = createdAt as any;
    if (typeof anyVal.toMillis === "function") return anyVal.toMillis();
    if (typeof anyVal === "number") return anyVal;
    return 0;
}

function sortTasks(a: PlannerTaskWithLabel, b: PlannerTaskWithLabel): number {
    // 1) 미완료 먼저
    if (a.done !== b.done) return a.done ? 1 : -1;

    // 2) deadline(있으면) 오름차순(빠른 마감이 위로)
    const aDue = deadlineToStartOfDayMs(a.deadline ?? null);
    const bDue = deadlineToStartOfDayMs(b.deadline ?? null);

    if (aDue !== null && bDue !== null && aDue !== bDue) return aDue - bDue;

    // ✅ 정책: deadline 있는 게 먼저, 없는 게 뒤
    if (aDue !== null && bDue === null) return -1;
    if (aDue === null && bDue !== null) return 1;

    // 3) createdAt 최신순
    const aCreated = getCreatedAtMs(a.createdAt);
    const bCreated = getCreatedAtMs(b.createdAt);
    if (aCreated !== bCreated) return bCreated - aCreated;

    // 4) title fallback
    return (a.title ?? "").localeCompare(b.title ?? "");
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

// ✅ memo 비교: 렌더링에 영향을 주는 값들을 충분히 포함
const PlannerTaskRow = memo(
    PlannerTaskRowBase,
    (prev, next) =>
        prev.task.id === next.task.id &&
        prev.task.title === next.task.title &&
        prev.task.done === next.task.done &&
        (prev.task.deadline ?? null) === (next.task.deadline ?? null) &&
        // 구데이터 fallback: ddayLabel이 바뀌면 뱃지 표시가 바뀔 수 있음
        ((prev.task as any).ddayLabel ?? null) === ((next.task as any).ddayLabel ?? null) &&
        (prev.task.applicationLabel ?? null) === (next.task.applicationLabel ?? null) &&
        // 정렬/표시에 영향 줄 수 있으니 포함
        getCreatedAtMs(prev.task.createdAt) === getCreatedAtMs(next.task.createdAt) &&
        prev.onToggle === next.onToggle &&
        prev.onDelete === next.onDelete,
);

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
        // ✅ 방어 + 정렬 안정화
        const safe = Array.isArray(tasks) ? tasks : [];
        return [...safe].sort(sortTasks);
    }, [tasks]);

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{title}</Text>
                {loading && <ActivityIndicator size="small" color="#6ee7b7" />}
            </View>

            {loading ? (
                <View style={styles.loadingWrapper}>
                    {[1, 2, 3].map((i) => (
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
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#9f1239", // rose-800
    },

    loadingWrapper: {
        marginTop: 4,
    },

    skeleton: {
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(244, 63, 94, 0.12)", // rose-500/12
        marginTop: 8,
        borderWidth: 1,
        borderColor: "rgba(244, 63, 94, 0.18)", // rose-500/18
    },

    emptyText: {
        fontSize: 13,
        color: "#9f1239", // rose-800
        opacity: 0.7,
        marginTop: 4,
    },

    listContent: {
        paddingVertical: 4,
    },

    itemWrapper: {
        marginBottom: 6,
    },
});