import { memo, useMemo } from "react";
import { SectionCard } from "../common/SectionCard";
import { PlannerTaskItem, type PlannerTaskWithLabel } from "./PlannerTaskItem";

type PlannerTaskSectionProps = {
    title: string;
    loading: boolean;
    tasks: PlannerTaskWithLabel[];
    emptyMessage: string;
    /**
     * 체크 토글 핸들러 (옵션)
     */
    onToggle?: (id: string) => void | Promise<void>;
    /**
     * 삭제 핸들러 (옵션)
     */
    onDelete?: (id: string) => void | Promise<void>;
};

type PlannerTaskRowProps = {
    task: PlannerTaskWithLabel;
    onToggle?: (id: string) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
};

function PlannerTaskRowBase({ task, onToggle, onDelete }: PlannerTaskRowProps) {
    const handleToggle = () => {
        if (!onToggle) return;
        void onToggle(task.id);
    };

    const handleDelete = () => {
        if (!onDelete) return;
        void onDelete(task.id);
    };

    return (
        <PlannerTaskItem
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
        />
    );
}

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
        const parseDeadlineMs = (deadline?: string | null): number | null => {
            if (!deadline) return null;
            const [y, m, d] = deadline.split("-").map((v) => Number(v));
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d).getTime();
        };

        return [...tasks].sort((a, b) => {
            // 1) 미완료 먼저
            if (a.done !== b.done) return a.done ? 1 : -1;
            const aDue = parseDeadlineMs(a.deadline ?? null);
            const bDue = parseDeadlineMs(b.deadline ?? null);

            if (aDue !== null && bDue !== null && aDue !== bDue) return aDue - bDue;
            if (aDue !== null && bDue === null) return -1;
            if (aDue === null && bDue !== null) return 1;

            // 3) createdAt 있으면 최신순(내림차순)
            const aCreated = (a.createdAt && "toMillis" in a.createdAt)
                ? a.createdAt.toMillis()
                : 0;
            const bCreated = (b.createdAt && "toMillis" in b.createdAt)
                ? b.createdAt.toMillis()
                : 0;
            if (aCreated !== bCreated) return bCreated - aCreated;

            // 4) 마지막 fallback: title
            return (a.title ?? "").localeCompare(b.title ?? "");
        });
    }, [tasks]);

    return (
        <SectionCard title={title}>
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-10 rounded-md bg-slate-800/60 animate-pulse"
                        />
                    ))}
                </div>
            ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-400">{emptyMessage}</p>
            ) : (
                <div className="space-y-2">
                    {sortedTasks.map((task) => (
                        <PlannerTaskRow
                            key={task.id}
                            task={task}
                            onToggle={onToggle}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </SectionCard>
    );
}

export const PlannerTaskSection = memo(PlannerTaskSectionBase);