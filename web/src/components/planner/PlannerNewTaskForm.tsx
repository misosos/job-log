import { useCallback, useMemo, useRef, type FormEvent } from "react";
import type { PlannerScope } from "../../../../shared/features/planner/types";
import { HiOutlineCalendar } from "react-icons/hi";

type RelatedApplicationOption = {
    value?: string; // applicationId
    id?: string; // legacy
    label: string;
};

type PlannerNewTaskFormProps = {
    title: string;
    scope: PlannerScope;

    /** 권장: 마감일(YYYY-MM-DD) */
    deadline?: string | null;
    onDeadlineChange?: (value: string | null) => void;

    /** (호환) 기존 D-day 라벨 직접 입력 */
    ddayLabel?: string;
    onDdayLabelChange?: (value: string) => void;

    saving: boolean;
    onTitleChange: (value: string) => void;
    onScopeChange: (value: PlannerScope) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;

    /** 관련 공고 연결 */
    applicationId?: string | null;
    applicationOptions?: RelatedApplicationOption[];
    onApplicationChange?: (id: string | null) => void;
};

type PickerInputEl = HTMLInputElement & { showPicker?: () => void };

function computeDdayLabel(deadline: string): string {
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

function inferScopeFromDeadline(deadline: string): PlannerScope {
    const [y, m, d] = deadline.split("-").map(Number);
    if (!y || !m || !d) return "today";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();

    return due <= startOfToday ? "today" : "week";
}

function scopeLabel(scope: PlannerScope): string {
    return scope === "today" ? "오늘 할 일" : "앞으로의 계획";
}

function openNativePicker(el: PickerInputEl | null) {
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else {
        el.focus();
        el.click();
    }
}

function optionValue(opt: RelatedApplicationOption): string {
    return opt.value ?? opt.id ?? "";
}

const inputClass =
    "flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 " +
    "placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300";

const selectClass =
    "rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-900 " +
    "focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300";

const dateClass =
    "w-[9.5rem] rounded-md border border-rose-200 bg-rose-50 px-2 py-1 pr-9 text-xs text-rose-900 " +
    "focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300 " +
    "[&::-webkit-calendar-picker-indicator]:opacity-0";

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
                                       applicationId,
                                       applicationOptions,
                                       onApplicationChange,
                                   }: PlannerNewTaskFormProps) {
    const isSubmitDisabled = saving || title.trim().length === 0;

    const dateInputRef = useRef<PickerInputEl | null>(null);

    const autoScope = useMemo<PlannerScope>(
        () => (deadline ? inferScopeFromDeadline(deadline) : scope),
        [deadline, scope],
    );

    const ddayText = useMemo(() => (deadline ? computeDdayLabel(deadline) : ""), [deadline]);

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value),
        [onTitleChange],
    );

    const handleScopeSelect = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => onScopeChange(e.target.value as PlannerScope),
        [onScopeChange],
    );

    const handleDeadlineChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!onDeadlineChange) return;

            const value = e.target.value ? e.target.value : null;
            onDeadlineChange(value);

            if (value) onScopeChange(inferScopeFromDeadline(value));
        },
        [onDeadlineChange, onScopeChange],
    );

    const handleApplicationSelect = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (!onApplicationChange) return;
            const v = e.target.value;
            onApplicationChange(v ? v : null);
        },
        [onApplicationChange],
    );

    const handleOpenDatePicker = useCallback(() => openNativePicker(dateInputRef.current), []);

    const hasApplicationOptions = Boolean(applicationOptions?.length);

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <input
                    type="text"
                    placeholder="예: 카카오페이 공고 JD 분석"
                    value={title}
                    onChange={handleTitleChange}
                    className={inputClass}
                    aria-label="새 할 일 제목"
                    autoComplete="off"
                    autoFocus
                />
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
                {/* 범위 */}
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
                            onChange={handleScopeSelect}
                            className={selectClass}
                            aria-label="할 일 범위 선택"
                        >
                            <option value="today">오늘 할 일</option>
                            <option value="week">앞으로의 계획</option>
                        </select>
                    )}
                </div>

                {/* 마감일(권장) */}
                {onDeadlineChange ? (
                    <div className="flex items-center gap-2">
                        <span className="text-rose-700">마감일</span>

                        <div className="relative">
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={deadline ?? ""}
                                onChange={handleDeadlineChange}
                                className={dateClass}
                                style={{ colorScheme: "light" }}
                                aria-label="마감일"
                            />

                            <button
                                type="button"
                                onClick={handleOpenDatePicker}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-rose-500 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300/40"
                                aria-label="마감일 선택"
                            >
                                <HiOutlineCalendar className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>

                        {deadline ? <span className="text-[11px] text-rose-600">{ddayText}</span> : null}
                    </div>
                ) : (
                    /* (호환) D-day 라벨 직접 입력 */
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

                {/* 관련 공고 */}
                {hasApplicationOptions && (
                    <div className="flex items-center gap-2">
                        <span className="text-rose-700">관련 공고</span>
                        <select
                            value={applicationId ?? ""}
                            onChange={handleApplicationSelect}
                            className={`min-w-[10rem] ${selectClass}`}
                            aria-label="관련 공고 선택"
                        >
                            <option value="">연결 안 함</option>
                            {applicationOptions!.map((opt) => {
                                const v = optionValue(opt);
                                return (
                                    <option key={v} value={v}>
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