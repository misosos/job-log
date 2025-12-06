import type { FormEvent } from "react";
import { SectionCard } from "../common/SectionCard";
import type { PlannerScope } from "../../features/planner/types";

type PlannerNewTaskFormProps = {
    title: string;
    scope: PlannerScope;
    ddayLabel: string;
    saving: boolean;
    onTitleChange: (value: string) => void;
    onScopeChange: (value: PlannerScope) => void;
    onDdayLabelChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function PlannerNewTaskForm({
                                       title,
                                       scope,
                                       ddayLabel,
                                       saving,
                                       onTitleChange,
                                       onScopeChange,
                                       onDdayLabelChange,
                                       onSubmit,
                                   }: PlannerNewTaskFormProps) {
    return (
        <SectionCard title="새 할 일 추가">
            <form onSubmit={onSubmit} className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="예: 카카오페이 공고 JD 분석"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">범위</span>
                        <select
                            value={scope}
                            onChange={(e) => onScopeChange(e.target.value as PlannerScope)}
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        >
                            <option value="today">오늘 할 일</option>
                            <option value="week">이번 주 계획</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">D-Day 라벨</span>
                        <input
                            type="text"
                            value={ddayLabel}
                            onChange={(e) => onDdayLabelChange(e.target.value)}
                            className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="D-3, 오늘"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-900 disabled:opacity-60 hover:bg-emerald-400"
                    >
                        {saving ? "추가 중..." : "추가"}
                    </button>
                </div>
            </form>
        </SectionCard>
    );
}