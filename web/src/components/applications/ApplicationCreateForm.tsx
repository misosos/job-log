import React, { useCallback, useMemo, useRef, type FormEvent } from "react";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { HiOutlineCalendar } from "react-icons/hi";
import type { ApplicationStatus } from "../../../../shared/features/applications/types";

type Props = {
    company: string;
    position?: string;
    role?: string;
    status: ApplicationStatus;
    appliedAt?: string;
    docDeadline?: string;
    interviewAt?: string;
    finalResultAt?: string;
    deadline?: string;
    saving: boolean;
    error: string | null;

    onCompanyChange: (value: string) => void;
    onPositionChange?: (value: string) => void;
    onRoleChange?: (value: string) => void;
    onStatusChange: (value: ApplicationStatus) => void;
    onAppliedAtChange?: (value: string) => void;
    onDocDeadlineChange?: (value: string) => void;
    onInterviewAtChange?: (value: string) => void;
    onFinalResultAtChange?: (value: string) => void;
    onDeadlineChange?: (value: string) => void;

    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
    "지원 예정",
    "서류 제출",
    "서류 통과",
    "면접 예정",
    "면접 완료",
    "최종 합격",
    "불합격",
    "지원 철회",
];

const LABEL_CLASS = "mb-1 block text-xs md:text-sm !text-rose-800";

const INPUT_WRAP_CLASS =
    "[color-scheme:light] " +
    "[&_input]:[color-scheme:light] " +
    "[&_input]:!bg-rose-50 [&_input]:!text-rose-900 [&_input]:!border-rose-200 " +
    "[&_input::placeholder]:!text-rose-300 " +
    "[&_input:focus]:!border-rose-400 [&_input:focus]:!ring-rose-200";

const SELECT_WRAP_CLASS =
    "[color-scheme:light] " +
    "[&_select]:[color-scheme:light] " +
    "[&_select]:!bg-rose-50 [&_select]:!text-rose-900 [&_select]:!border-rose-200 " +
    "[&_select:focus]:!border-rose-400 [&_select:focus]:!ring-rose-200";

const DATE_INPUT_CLASS = `
  w-full rounded-lg
  border border-rose-200 bg-rose-50
  px-3 py-2 pr-9
  text-sm text-rose-900
  focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300
  [&::-webkit-calendar-picker-indicator]:opacity-0
`;

const DATE_ICON_BTN_CLASS = `
  absolute right-2 top-1/2 -translate-y-1/2
  rounded p-0.5
  text-rose-500 hover:text-rose-600
  focus:outline-none focus:ring-2 focus:ring-rose-300/40
`;

function trimOrEmpty(v?: string) {
    return (v ?? "").trim();
}

/** Flowbite TextInput 대신 native input(date) + 캘린더 아이콘 버튼 */
function DateField({
                       id,
                       label,
                       value,
                       onChange,
                   }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    const dateInputRef = useRef<HTMLInputElement>(null);

    const openDatePicker = useCallback(() => {
        const el = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
        if (!el) return;

        // Chromium 계열 showPicker 지원
        if (typeof el.showPicker === "function") el.showPicker();
        else {
            el.focus();
            el.click();
        }
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        [onChange],
    );

    return (
        <div className="flex-1 min-w-[10rem]">
            <Label htmlFor={id} className={LABEL_CLASS}>
                {label}
            </Label>

            <div className="relative">
                <input
                    ref={dateInputRef}
                    id={id}
                    type="date"
                    value={value}
                    onChange={handleChange}
                    style={{ colorScheme: "light" }}
                    className={DATE_INPUT_CLASS}
                />

                <button
                    type="button"
                    onClick={openDatePicker}
                    className={DATE_ICON_BTN_CLASS}
                    aria-label={`${label} 선택`}
                >
                    <HiOutlineCalendar className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

export function ApplicationCreateForm({
                                          company,
                                          position,
                                          role,
                                          status,
                                          appliedAt,
                                          docDeadline,
                                          interviewAt,
                                          finalResultAt,
                                          deadline,
                                          saving,
                                          error,
                                          onCompanyChange,
                                          onPositionChange,
                                          onRoleChange,
                                          onStatusChange,
                                          onAppliedAtChange,
                                          onDocDeadlineChange,
                                          onInterviewAtChange,
                                          onFinalResultAtChange,
                                          onDeadlineChange,
                                          onSubmit,
                                      }: Props) {
    const resolvedPosition = useMemo(() => trimOrEmpty(position) || trimOrEmpty(role), [position, role]);
    const resolvedAppliedAt = useMemo(() => trimOrEmpty(appliedAt), [appliedAt]);
    const resolvedDocDeadline = useMemo(
        () => trimOrEmpty(docDeadline) || trimOrEmpty(deadline),
        [docDeadline, deadline],
    );
    const resolvedInterviewAt = useMemo(() => trimOrEmpty(interviewAt), [interviewAt]);
    const resolvedFinalResultAt = useMemo(() => trimOrEmpty(finalResultAt), [finalResultAt]);

    const handlePositionChange = useCallback(
        (value: string) => {
            if (onPositionChange) onPositionChange(value);
            else onRoleChange?.(value);
        },
        [onPositionChange, onRoleChange],
    );

    const handleDocDeadlineChange = useCallback(
        (value: string) => {
            if (onDocDeadlineChange) onDocDeadlineChange(value);
            else onDeadlineChange?.(value);
        },
        [onDocDeadlineChange, onDeadlineChange],
    );

    const handleAppliedAtChange = useCallback((v: string) => onAppliedAtChange?.(v), [onAppliedAtChange]);
    const handleInterviewAtChange = useCallback((v: string) => onInterviewAtChange?.(v), [onInterviewAtChange]);
    const handleFinalResultAtChange = useCallback((v: string) => onFinalResultAtChange?.(v), [onFinalResultAtChange]);

    const handleStatusChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value as ApplicationStatus),
        [onStatusChange],
    );

    return (
        <div className="[color-scheme:light]">
            <form
                className="
          [color-scheme:light]
          flex flex-col gap-3 rounded-xl
          border border-rose-200 bg-rose-50/80
          p-4 md:flex-row md:flex-wrap md:items-end
        "
                onSubmit={onSubmit}
            >
                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="company" className={LABEL_CLASS}>
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        placeholder="예: 카카오페이"
                        value={company}
                        onChange={(e) => onCompanyChange(e.target.value)}
                        required
                        className={INPUT_WRAP_CLASS}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="position" className={LABEL_CLASS}>
                        직무명
                    </Label>
                    <TextInput
                        id="position"
                        placeholder="예: 데이터 산출 인턴"
                        value={resolvedPosition}
                        onChange={(e) => handlePositionChange(e.target.value)}
                        required
                        className={INPUT_WRAP_CLASS}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="status" className={LABEL_CLASS}>
                        상태
                    </Label>
                    <Select id="status" value={status} onChange={handleStatusChange} className={SELECT_WRAP_CLASS}>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* 날짜 4개: 플래너 방식(아이콘 버튼 + showPicker) */}
                <DateField id="appliedAt" label="지원일" value={resolvedAppliedAt} onChange={handleAppliedAtChange} />

                <DateField
                    id="docDeadline"
                    label="서류 마감일"
                    value={resolvedDocDeadline}
                    onChange={handleDocDeadlineChange}
                />

                <DateField id="interviewAt" label="면접일" value={resolvedInterviewAt} onChange={handleInterviewAtChange} />

                <DateField
                    id="finalResultAt"
                    label="최종 발표일"
                    value={resolvedFinalResultAt}
                    onChange={handleFinalResultAtChange}
                />

                <div className="flex-none">
                    <Button
                        type="submit"
                        disabled={saving}
                        color="gray"
                        className="!bg-rose-500 hover:!bg-rose-400 !border-0 !text-white focus:!ring-rose-200 disabled:opacity-60"
                    >
                        {saving ? "저장 중..." : "지원 기록 추가"}
                    </Button>
                </div>
            </form>

            {error && <p className="mt-2 text-xs !text-rose-600">{error}</p>}
        </div>
    );
}