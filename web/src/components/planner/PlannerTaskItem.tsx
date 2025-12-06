// src/components/planner/PlannerTaskItem.tsx
import type { PlannerTask } from "../../features/planner/types";

type PlannerTaskItemProps = {
  task: PlannerTask;
  onToggle: () => void;
};

export function PlannerTaskItem({ task, onToggle }: PlannerTaskItemProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-md bg-slate-800/60 px-3 py-2 text-left transition hover:bg-slate-700/70">
      <div className="flex items-center gap-3">
        {/* 체크박스 형태의 완료 토글 */}
        <input
          type="checkbox"
          checked={task.done}
          onChange={onToggle}
          className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-emerald-400 focus:ring-emerald-400 focus:ring-offset-0"
        />
        <p
          className={[
            "text-sm",
            task.done ? "text-slate-400 line-through" : "text-slate-200",
          ].join(" ")}
        >
          {task.title}
        </p>
      </div>
      <span className="text-xs text-emerald-300">{task.ddayLabel}</span>
    </div>
  );
}