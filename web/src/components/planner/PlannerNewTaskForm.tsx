import { useRef, type FormEvent } from "react";
import type { PlannerScope } from "../../../../shared/features/planner/types";
import { HiOutlineCalendar } from "react-icons/hi";

// 💡 플래너에서 사용할 "관련 공고" 옵션 타입
type RelatedApplicationOption = {
    /** 선택 값(applicationId). 기존 코드와 호환을 위해 id도 허용 */
    value?: string;
    id?: string;
    label: string; // 회사명 + 직무 등 표시용
};

type PlannerNewTaskFormProps = {
    title: string;
    scope: PlannerScope;

    /** ✅ 신규 권장: 마감일(YYYY-MM-DD). D-day는 화면에서 자동 계산 */
    deadline?: string | null;
    onDeadlineChange?: (value: string | null) => void;

    /** (호환용) 기존 D-day 라벨 직접 입력 방식 */
    ddayLabel?: string;
    onDdayLabelChange?: (value: string) => void;

    saving: boolean;
    onTitleChange: (value: string) => void;
    onScopeChange: (value: PlannerScope) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;

    // ✅ 추가: 관련 공고 연결용 (선택)
    applicationId?: string | null;
    applicationOptions?: RelatedApplicationOption[];
    onApplicationChange?: (id: string | null) => void;
};

function computeDdayLabel(deadline?: string | null): string {
    if (!deadline) return "";

    // deadline: YYYY-MM-DD (local)
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

function inferScopeFromDeadline(deadline: string): PlannerScope {
    // deadline: YYYY-MM-DD (local)
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return "today";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();

    // 오늘(또는 지남) => today, 내일 이후 => week
    return due <= startOfToday ? "today" : "week";
}

function scopeLabel(scope: PlannerScope): string {
    return scope === "today" ? "오늘 할 일" : "앞으로의 계획";
}

export function PlannerNewTaskForm({
                                       title,
                                       scope,
                                       deadline,
                                       onDeadlineChange,
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

    const dateInputRef = useRef<HTMLInputElement | null>(null);

    const openDatePicker = () => {
        const el = dateInputRef.current;
        if (!el) return;
        // Chromium 계열은 showPicker 지원
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyEl = el as any;
        if (typeof anyEl.showPicker === "function") {
            anyEl.showPicker();
        } else {
            el.focus();
            el.click();
        }
    };

    const autoScope = deadline ? inferScopeFromDeadline(deadline) : scope;

    const handleApplicationChange = (value: string) => {
        if (!onApplicationChange) return;
        // 빈 값이면 "연결 안 함"
        onApplicationChange(value ? value : null);
    };

    return (
            <form onSubmit={onSubmit} className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="예: 카카오페이 공고 JD 분석"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
                        aria-label="새 할 일 제목"
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                    {/* 범위 선택 (deadline이 있으면 자동 분류) */}
                    <div className="flex items-center gap-2">
                        <span className="text-rose-700">범위</span>

                        {onDeadlineChange && deadline ? (
                            <span
                                className="rounded-full border border-rose-400/40 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-500"
                                aria-label="자동 분류 범위"
                                title="마감일 기준으로 자동 분류됩니다."
                            >
                                {scopeLabel(autoScope)}
                            </span>
                        ) : (
                            <select
                                value={scope}
                                onChange={(e) => onScopeChange(e.target.value as PlannerScope)}
                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                aria-label="할 일 범위 선택"
                            >
                                <option value="today">오늘 할 일</option>
                                <option value="week">앞으로의 계획</option>
                            </select>
                        )}
                    </div>

                    {/* ✅ 마감일(권장): 날짜만 선택 → D-day 자동 계산 */}
                    {onDeadlineChange ? (
                        <div className="flex items-center gap-2">
                            <span className="text-rose-700">마감일</span>

                            <div className="relative">
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={deadline ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value ? e.target.value : null;
                                        onDeadlineChange(value);

                                        // deadline이 선택되면 범위를 자동 업데이트
                                        if (value) {
                                            onScopeChange(inferScopeFromDeadline(value));
                                        }
                                    }}
                                    className="w-[9.5rem] rounded-md border border-rose-200 bg-rose-50 px-2 py-1 pr-9 text-xs text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300 [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    style={{ colorScheme: "light" }}
                                    aria-label="마감일"
                                />

                                {/* ✅ 네이티브 아이콘이 어두운 환경에서 안 보일 수 있어 커스텀 아이콘을 오버레이 */}
                                <button
                                    type="button"
                                    onClick={openDatePicker}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-rose-500 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300/40"
                                    aria-label="마감일 선택"
                                >
                                    <HiOutlineCalendar className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>

                            {deadline ? (
                                <span className="text-[11px] text-rose-600">
                                    {computeDdayLabel(deadline)}
                                </span>
                            ) : null}
                        </div>
                    ) : (
                        /* (호환용) 기존 D-Day 라벨 직접 입력 */
                        <div className="flex items-center gap-2">
                            <span className="text-rose-700">D-Day 라벨</span>
                            <input
                                type="text"
                                value={ddayLabel ?? ""}
                                onChange={(e) => onDdayLabelChange?.(e.target.value)}
                                className="w-24 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-900 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                placeholder="D-3, 오늘"
                                aria-label="D-Day 라벨"
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {/* ✅ 관련 공고 선택 (옵션이 있을 때만 렌더링) */}
                    {applicationOptions && applicationOptions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-rose-700">관련 공고</span>
                            <select
                                value={applicationId ?? ""}
                                onChange={(e) => handleApplicationChange(e.target.value)}
                                className="min-w-[10rem] rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                aria-label="관련 공고 선택"
                            >
                                <option value="">연결 안 함</option>
                                {applicationOptions.map((opt) => {
                                    const optionValue = opt.value ?? opt.id ?? "";
                                    return (
                                        <option key={optionValue} value={optionValue}>
                                            {opt.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="ml-auto rounded-md bg-rose-500 px-3 py-1.5 text-xs font-medium text-rose-50 disabled:cursor-not-allowed disabled:opacity-60 hover:bg-rose-400"
                    >
                        {saving ? "추가 중..." : "추가"}
                    </button>
                </div>
            </form>
    );
}