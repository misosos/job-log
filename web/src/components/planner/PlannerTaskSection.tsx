import { memo, useCallback, useMemo } from "react";
import { SectionCard } from "../common/SectionCard";
import { PlannerTaskItem, type PlannerTaskWithLabel } from "./PlannerTaskItem";

/** createdAt이 Firestore Timestamp일 수도/아닐 수도 있어서 안전 가드 */
type HasToMillis = { toMillis: () => number };
function hasToMillis(v: unknown): v is HasToMillis {
    return typeof v === "object" && v !== null && "toMillis" in v && typeof (v as HasToMillis).toMillis === "function";
}

type PlannerTaskSectionProps = {
    title: string;
    loading: boolean;
    tasks: PlannerTaskWithLabel[];
    emptyMessage: string;
    onToggle?: (id: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
};

type PlannerTaskRowProps = {
    task: PlannerTaskWithLabel;
    onToggle?: (id: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
};

function deadlineToMs(deadline?: string | null): number | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d).getTime();
}

function createdAtToMs(createdAt: unknown): number {
    return hasToMillis(createdAt) ? createdAt.toMillis() : 0;
}

function PlannerTaskRowBase({ task, onToggle, onDelete }: PlannerTaskRowProps) {
    const handleToggle = useCallback(() => {
        onToggle?.(task.id);
    }, [onToggle, task.id]);

    const handleDelete = useCallback(() => {
        onDelete?.(task.id);
    }, [onDelete, task.id]);

    return <PlannerTaskItem task={task} onToggle={handleToggle} onDelete={handleDelete} />;
}

/**
 * ✅ 비교 함수는 “정말 바뀌는 값만” 체크
 * (task 객체가 매번 새로 만들어져도 필요한 값만 동일하면 rerender 방지)
 */
const PlannerTaskRow = memo(
    PlannerTaskRowBase,
    (prev, next) =>
        prev.task.id === next.task.id &&
        prev.task.title === next.task.title &&
        prev.task.done === next.task.done &&
        (prev.task.deadline ?? null) === (next.task.deadline ?? null) &&
        (prev.task.ddayLabel ?? "") === (next.task.ddayLabel ?? "") &&
        (prev.task.applicationLabel ?? null) === (next.task.applicationLabel ?? null) &&
        prev.onToggle === next.onToggle &&
        prev.onDelete === next.onDelete,
);

function PlannerTaskSectionBase({
                                    title,
                                    loading,
                                    tasks,
                                    emptyMessage,
                                    onToggle,
                                    onDelete,
                                }: PlannerTaskSectionProps) {
    const sortedTasks = useMemo(() => {
        // 한번만 계산해서 sort 비교 비용 줄이기
        const enriched = tasks.map((t) => ({
            task: t,
            dueMs: deadlineToMs(t.deadline ?? null),
            createdMs: createdAtToMs((t as unknown as { createdAt?: unknown }).createdAt),
        }));

        enriched.sort((a, b) => {
            // 1) 미완료 먼저
            if (a.task.done !== b.task.done) return a.task.done ? 1 : -1;

            // 2) 마감일 있는 것 먼저 + 빠른 순
            if (a.dueMs !== null && b.dueMs !== null && a.dueMs !== b.dueMs) return a.dueMs - b.dueMs;
            if (a.dueMs !== null && b.dueMs === null) return -1;
            if (a.dueMs === null && b.dueMs !== null) return 1;

            // 3) createdAt 최신순
            if (a.createdMs !== b.createdMs) return b.createdMs - a.createdMs;

            // 4) fallback: title
            return (a.task.title ?? "").localeCompare(b.task.title ?? "");
        });

        return enriched.map((x) => x.task);
    }, [tasks]);

    const isEmpty = tasks.length === 0;

    return (
        <SectionCard title={title}>
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-10 animate-pulse rounded-md border border-rose-200 bg-rose-100/70"
                        />
                    ))}
                </div>
            ) : isEmpty ? (
                <p className="text-sm text-rose-700/80">{emptyMessage}</p>
            ) : (
                <div className="space-y-2">
                    {sortedTasks.map((task) => (
                        <PlannerTaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </SectionCard>
    );
}

export const PlannerTaskSection = memo(PlannerTaskSectionBase);