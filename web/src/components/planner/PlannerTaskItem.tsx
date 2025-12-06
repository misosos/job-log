import type { PlannerTask } from "../../features/planner/types";

type PlannerTaskItemProps = {
    task: PlannerTask;
    onToggle: () => void;
};

export function PlannerTaskItem({ task, onToggle }: PlannerTaskItemProps) {
    const isDone = task.done ?? false;

    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between rounded-md bg-slate-900/60 px-3 py-2 text-left transition-colors hover:bg-slate-800"
            aria-pressed={isDone}
        >
            <div className="flex items-center gap-2">
                {/* 체크박스 모양 */}
                <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                        isDone
                            ? "border-emerald-400 bg-emerald-500/20"
                            : "border-slate-500"
                    }`}
                    aria-hidden="true"
                >
          {isDone && <span className="h-2 w-2 rounded-sm bg-emerald-400" />}
        </span>

                {/* 할 일 제목 */}
                <span
                    className={
                        isDone
                            ? "text-sm text-slate-400 line-through"
                            : "text-sm text-slate-100"
                    }
                >
          {task.title}
        </span>
            </div>

            {/* D-Day 라벨 (있을 때만) */}
            {task.ddayLabel && (
                <span className="text-xs text-slate-400">{task.ddayLabel}</span>
            )}
        </button>
    );
}