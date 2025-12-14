import { useMemo } from "react";
import { SectionCard } from "../common/SectionCard";
import { usePlanner } from "../../features/planner/usePlanner";

const SKELETON_ROWS = [0, 1, 2];

function TaskSkeleton() {
    return (
        <div className="w-full space-y-1.5">
            {SKELETON_ROWS.map((i) => (
                <div
                    key={i}
                    className="h-9 w-full animate-pulse rounded-lg border border-rose-200 bg-rose-100"
                />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <p className="text-sm text-rose-700">
            오늘은 아직 등록된 할 일이 없어요. 플래너에서 할 일을 추가해 보세요.
        </p>
    );
}

type TaskItem = {
    id: string;
    title: string;
    done?: boolean;
    ddayLabel?: string | null;
};

function TaskRow({ task }: { task: TaskItem }) {
    const titleClassName = task.done
        ? "text-sm text-rose-400 line-through"
        : "text-sm text-rose-900";

    return (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
            <p className={titleClassName}>{task.title}</p>

            {!!task.ddayLabel && <span className="text-xs text-rose-600">{task.ddayLabel}</span>}
        </div>
    );
}

export function DashboardTodayTasksSection() {
    const { todayTasks, loading } = usePlanner();

    const tasks = useMemo(() => todayTasks.slice(0, 3), [todayTasks]);

    return (
        <SectionCard title="오늘 할 일">
            {loading ? <TaskSkeleton /> : tasks.length === 0 ? <EmptyState /> : (
                <div className="w-full space-y-2">
                    {tasks.map((task) => (
                        <TaskRow key={task.id} task={task as TaskItem} />
                    ))}
                </div>
            )}
        </SectionCard>
    );
}