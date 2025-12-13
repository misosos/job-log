// src/components/applications/ApplicationCreateForm.tsx
import { useRef, type FormEvent } from "react";
import { Button, Label, TextInput, Select } from "flowbite-react";
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
    const dateInputRef = useRef<HTMLInputElement | null>(null);

    const openDatePicker = () => {
        const el = dateInputRef.current;
        if (!el) return;

        // Chromium 계열 showPicker 지원
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyEl = el as any;
        if (typeof anyEl.showPicker === "function") anyEl.showPicker();
        else {
            el.focus();
            el.click();
        }
    };

    return (
        <div className="flex-1 min-w-[10rem]">
            <Label htmlFor={id} className="mb-1 block text-xs md:text-sm !text-rose-800">
                {label}
            </Label>

            <div className="relative">
                <input
                    ref={dateInputRef}
                    id={id}
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ colorScheme: "light" }}
                    className="
            w-full
            rounded-lg
            border border-rose-200 bg-rose-50
            px-3 py-2 pr-9
            text-sm text-rose-900
            focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300
            [&::-webkit-calendar-picker-indicator]:opacity-0
          "
                />

                <button
                    type="button"
                    onClick={openDatePicker}
                    className="
            absolute right-2 top-1/2 -translate-y-1/2
            rounded p-0.5
            text-rose-500 hover:text-rose-600
            focus:outline-none focus:ring-2 focus:ring-rose-300/40
          "
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
    const resolvedPosition = position?.trim() || role?.trim() || "";
    const resolvedAppliedAt = appliedAt?.trim() || "";
    const resolvedDocDeadline = docDeadline?.trim() || deadline?.trim() || "";

    const handlePositionChange = (value: string) => {
        if (onPositionChange) onPositionChange(value);
        else onRoleChange?.(value);
    };

    const handleDocDeadlineChange = (value: string) => {
        if (onDocDeadlineChange) onDocDeadlineChange(value);
        else onDeadlineChange?.(value);
    };

    // ✅ Flowbite 내부 input/select 라이트 강제(텍스트 입력/셀렉트용)
    const inputWrapClass =
        "[color-scheme:light] " +
        "[&_input]:[color-scheme:light] " +
        "[&_input]:!bg-rose-50 [&_input]:!text-rose-900 [&_input]:!border-rose-200 " +
        "[&_input::placeholder]:!text-rose-300 " +
        "[&_input:focus]:!border-rose-400 [&_input:focus]:!ring-rose-200";

    const selectWrapClass =
        "[color-scheme:light] " +
        "[&_select]:[color-scheme:light] " +
        "[&_select]:!bg-rose-50 [&_select]:!text-rose-900 [&_select]:!border-rose-200 " +
        "[&_select:focus]:!border-rose-400 [&_select:focus]:!ring-rose-200";

    const labelClass = "mb-1 block text-xs md:text-sm !text-rose-800";

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
                    <Label htmlFor="company" className={labelClass}>
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        placeholder="예: 카카오페이"
                        value={company}
                        onChange={(e) => onCompanyChange(e.target.value)}
                        required
                        className={inputWrapClass}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="position" className={labelClass}>
                        직무명
                    </Label>
                    <TextInput
                        id="position"
                        placeholder="예: 데이터 산출 인턴"
                        value={resolvedPosition}
                        onChange={(e) => handlePositionChange(e.target.value)}
                        required
                        className={inputWrapClass}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="status" className={labelClass}>
                        상태
                    </Label>
                    <Select
                        id="status"
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
                        className={selectWrapClass}
                    >
                        <option value="지원 예정">지원 예정</option>
                        <option value="서류 제출">서류 제출</option>
                        <option value="서류 통과">서류 통과</option>
                        <option value="면접 예정">면접 예정</option>
                        <option value="면접 완료">면접 완료</option>
                        <option value="최종 합격">최종 합격</option>
                        <option value="불합격">불합격</option>
                        <option value="지원 철회">지원 철회</option>
                    </Select>
                </div>

                {/* ✅ 날짜 4개는 플래너 방식(커스텀 캘린더 아이콘)로 */}
                <DateField
                    id="appliedAt"
                    label="지원일"
                    value={resolvedAppliedAt}
                    onChange={(v) => onAppliedAtChange?.(v)}
                />

                <DateField
                    id="docDeadline"
                    label="서류 마감일"
                    value={resolvedDocDeadline}
                    onChange={(v) => handleDocDeadlineChange(v)}
                />

                <DateField
                    id="interviewAt"
                    label="면접일"
                    value={(interviewAt ?? "").trim()}
                    onChange={(v) => onInterviewAtChange?.(v)}
                />

                <DateField
                    id="finalResultAt"
                    label="최종 발표일"
                    value={(finalResultAt ?? "").trim()}
                    onChange={(v) => onFinalResultAtChange?.(v)}
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