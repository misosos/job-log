import {
    HiCheckCircle,
    HiOutlineCheckCircle,
    HiTrash,
} from "react-icons/hi";
import type { PlannerTask as BasePlannerTask } from "../../../../shared/features/planner/types";

// 앱처럼: shared PlannerTask에 표시용 라벨만 확장
export type PlannerTaskWithLabel = BasePlannerTask & {
    applicationLabel?: string | null;

    // ✅ deadline 기반으로 D-day를 계산하기 위한 필드 (shared 타입이 아직 없을 수 있어 앱/웹 호환용으로 둠)
    deadline?: string | null; // YYYY-MM-DD

    // ✅ (호환) 예전 데이터는 ddayLabel만 있을 수 있음
    ddayLabel?: string;
};

type Props = {
    task: PlannerTaskWithLabel;
    onToggle?: () => void;
    onDelete?: () => void;
};

function computeDdayLabelFromDeadline(deadline?: string | null): string {
    if (!deadline) return "";

    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return "";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();

    const diffDays = Math.round((due - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

export function PlannerTaskItem({ task, onToggle, onDelete }: Props) {
    const Icon = task.done ? HiCheckCircle : HiOutlineCheckCircle;
    const badgeText = task.deadline
        ? computeDdayLabelFromDeadline(task.deadline)
        : (task.ddayLabel ?? "");

    return (
        <div className="flex w-full items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2.5">
            {/* 왼쪽: 체크 토글 영역 */}
            <button
                type="button"
                onClick={onToggle}
                className="flex flex-1 items-center gap-2 text-left hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            >
                <Icon
                    className={
                        task.done
                            ? "h-4 w-4 text-emerald-400"
                            : "h-4 w-4 text-slate-500"
                    }
                />

                <div className="flex flex-1 flex-col">
                    <span
                        className={
                            task.done
                                ? "text-sm leading-5 text-slate-400 line-through"
                                : "text-sm leading-5 text-slate-100"
                        }
                    >
                        {task.title}
                    </span>

                    {task.applicationLabel ? (
                        <span
                            className="mt-1 block max-w-full text-[11px] leading-4 text-slate-400"
                            title={task.applicationLabel}
                        >
                            <span className="text-slate-500">관련 공고: </span>
                            {task.applicationLabel}
                        </span>
                    ) : null}
                </div>
            </button>

            {/* 오른쪽: D-day + 삭제 버튼 */}
            <div className="flex items-center gap-2">
                {badgeText ? (
                    <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-300">
                        {badgeText}
                    </span>
                ) : null}

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