import {
    HiCheckCircle,
    HiOutlineCheckCircle,
    HiTrash,
} from "react-icons/hi";
import type { PlannerTask } from "../../features/planner/types";

type Props = {
    task: PlannerTask;
    onToggle?: () => void;
    onDelete?: () => void;
};

export function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const Icon = task.done ? HiCheckCircle : HiOutlineCheckCircle;

    return (
        <div className="flex w-full items-center justify-between rounded-md bg-slate-900/60 px-3 py-2">
            {/* 왼쪽: 체크 토글 영역 */}
            <button
                type="button"
                onClick={onToggle}
                className="flex flex-1 items-center gap-2 text-left hover:opacity-80"
            >
                <Icon
                    className={
                        task.done
                            ? "h-4 w-4 text-emerald-400"
                            : "h-4 w-4 text-slate-500"
                    }
                />
                <span
                    className={
                        task.done
                            ? "text-sm text-slate-400 line-through"
                            : "text-sm text-slate-100"
                    }
                >
          {task.title}
        </span>
            </button>

            {/* 오른쪽: D-day + 삭제 버튼 */}
            <div className="flex items-center gap-2">
                {task.ddayLabel && (
                    <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-300">
            {task.ddayLabel}
          </span>
                )}

                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                        aria-label="할 일 삭제"
                    >
                        <HiTrash className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}