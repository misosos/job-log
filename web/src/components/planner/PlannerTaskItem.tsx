import { memo, useMemo, useCallback } from "react";
import { HiCheckCircle, HiOutlineCheckCircle, HiTrash } from "react-icons/hi";
import type { PlannerTask as BasePlannerTask } from "../../../../shared/features/planner/types";

export type PlannerTaskWithLabel = BasePlannerTask & {
    applicationLabel?: string | null;

    /** YYYY-MM-DD (옵션) */
    deadline?: string | null;

    /** (호환) 예전 데이터 */
    ddayLabel?: string;
};

type Props = {
    task: PlannerTaskWithLabel;
    onToggle?: () => void;
    onDelete?: () => void;
};

function computeDdayLabel(deadline?: string | null): string {
    if (!deadline) return "";

    const [y, m, d] = deadline.split("-").map(Number);
    if (!y || !m || !d) return "";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();

    const diffDays = Math.round((due - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

const containerClass =
    "flex w-full items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5";

const toggleBtnClass =
    "flex flex-1 items-center gap-2 text-left hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-rose-400/40";

const badgeClass =
    "rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700";

const deleteBtnClass =
    "rounded p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600";

export const PlannerTaskItem = memo(function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const Icon = task.done ? HiCheckCircle : HiOutlineCheckCircle;

    const badgeText = useMemo(() => {
        const fromDeadline = computeDdayLabel(task.deadline);
        return fromDeadline || (task.ddayLabel ?? "");
    }, [task.deadline, task.ddayLabel]);

    const iconClass = task.done ? "h-4 w-4 text-rose-500" : "h-4 w-4 text-rose-300";
    const titleClass = task.done
        ? "text-sm leading-5 text-rose-400 line-through"
        : "text-sm leading-5 text-rose-900";

    const handleToggle = useCallback(() => onToggle?.(), [onToggle]);
    const handleDelete = useCallback(() => onDelete?.(), [onDelete]);

    return (
        <div className={containerClass}>
            {/* 왼쪽: 체크 토글 영역 */}
            <button type="button" onClick={handleToggle} className={toggleBtnClass}>
                <Icon className={iconClass} aria-hidden="true" />

                <div className="flex flex-1 flex-col">
                    <span className={titleClass}>{task.title}</span>

                    {task.applicationLabel ? (
                        <span
                            className="mt-1 block max-w-full text-[11px] leading-4 text-rose-700"
                            title={task.applicationLabel}
                        >
              <span className="text-rose-500">관련 공고: </span>
                            {task.applicationLabel}
            </span>
                    ) : null}
                </div>
            </button>

            {/* 오른쪽: D-day + 삭제 버튼 */}
            <div className="flex items-center gap-2">
                {badgeText ? <span className={badgeClass}>{badgeText}</span> : null}

                {onDelete ? (
                    <button type="button" onClick={handleDelete} className={deleteBtnClass} aria-label="할 일 삭제">
                        <HiTrash className="h-4 w-4" aria-hidden="true" />
                    </button>
                ) : null}
            </div>
        </div>
    );
});