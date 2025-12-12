import { memo } from "react";
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

function PlannerTaskRow({ task, onToggle, onDelete }: PlannerTaskRowProps) {
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

function PlannerTaskSectionBase({
    title,
    loading,
    tasks,
    emptyMessage,
    onToggle,
    onDelete,
}: PlannerTaskSectionProps) {
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
                    {tasks.map((task) => (
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