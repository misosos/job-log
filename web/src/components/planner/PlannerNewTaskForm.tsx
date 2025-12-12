import type { FormEvent } from "react";
import { SectionCard } from "../common/SectionCard";
import type { PlannerScope } from "../../../../shared/features/planner/types";

// 💡 플래너에서 사용할 "관련 공고" 옵션 타입
type RelatedApplicationOption = {
    id: string;
    label: string; // 회사명 + 직무 등 표시용
};

type PlannerNewTaskFormProps = {
    title: string;
    scope: PlannerScope;
    ddayLabel: string;
    saving: boolean;
    onTitleChange: (value: string) => void;
    onScopeChange: (value: PlannerScope) => void;
    onDdayLabelChange: (value: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;

    // ✅ 추가: 관련 공고 연결용 (선택)
    applicationId?: string | null;
    applicationOptions?: RelatedApplicationOption[];
    onApplicationChange?: (id: string | null) => void;
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

                                       // ✅ 추가된 props
                                       applicationId,
                                       applicationOptions,
                                       onApplicationChange,
                                   }: PlannerNewTaskFormProps) {
    const isSubmitDisabled = saving || title.trim().length === 0;

    const handleApplicationChange = (value: string) => {
        if (!onApplicationChange) return;
        // 빈 값이면 "연결 안 함"
        onApplicationChange(value || null);
    };

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
                        aria-label="새 할 일 제목"
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                    {/* 범위 선택 */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">범위</span>
                        <select
                            value={scope}
                            onChange={(e) => onScopeChange(e.target.value as PlannerScope)}
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            aria-label="할 일 범위 선택"
                        >
                            <option value="today">오늘 할 일</option>
                            <option value="week">이번 주 계획</option>
                        </select>
                    </div>

                    {/* D-Day 라벨 */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400">D-Day 라벨</span>
                        <input
                            type="text"
                            value={ddayLabel}
                            onChange={(e) => onDdayLabelChange(e.target.value)}
                            className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            placeholder="D-3, 오늘"
                            aria-label="D-Day 라벨"
                            autoComplete="off"
                        />
                    </div>

                    {/* ✅ 관련 공고 선택 (옵션이 있을 때만 렌더링) */}
                    {applicationOptions && applicationOptions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">관련 공고</span>
                            <select
                                value={applicationId ?? ""}
                                onChange={(e) => handleApplicationChange(e.target.value)}
                                className="min-w-[10rem] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                aria-label="관련 공고 선택"
                            >
                                <option value="">연결 안 함</option>
                                {applicationOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="ml-auto rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-emerald-400"
                    >
                        {saving ? "추가 중..." : "추가"}
                    </button>
                </div>
            </form>
        </SectionCard>
    );
}