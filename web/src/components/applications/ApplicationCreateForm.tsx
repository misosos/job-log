import type { FormEvent } from "react";
import { Button, Label, TextInput, Select } from "flowbite-react";
import { SectionCard } from "../common/SectionCard";
import type { ApplicationStatus } from "../../../../shared/features/applications/types";

type Props = {
    company: string;

    /** ✅ 권장: position (신규) */
    position?: string;

    /** ⚠️ 레거시 호환: role (구버전) */
    role?: string;

    status: ApplicationStatus;

    /** ✅ 지원일(YYYY-MM-DD) */
    appliedAt?: string;

    /** ✅ 실무형 날짜(권장) */
    docDeadline?: string; // 서류 마감일(YYYY-MM-DD)
    interviewAt?: string; // 면접일(YYYY-MM-DD)
    finalResultAt?: string; // 최종 발표일(YYYY-MM-DD)

    /** ⚠️ 레거시: 예전 마감일(=서류 마감일로 취급) */
    deadline?: string;

    saving: boolean;
    error: string | null;

    onCompanyChange: (value: string) => void;

    /** ✅ 권장 */
    onPositionChange?: (value: string) => void;

    /** ⚠️ 레거시 */
    onRoleChange?: (value: string) => void;

    onStatusChange: (value: ApplicationStatus) => void;

    /** ✅ 지원일 핸들러 */
    onAppliedAtChange?: (value: string) => void;

    /** ✅ 권장 핸들러 */
    onDocDeadlineChange?: (value: string) => void;
    onInterviewAtChange?: (value: string) => void;
    onFinalResultAtChange?: (value: string) => void;

    /** ⚠️ 레거시 */
    onDeadlineChange?: (value: string) => void;

    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function ApplicationCreateForm({
                                          company,
                                          position,
                                          role,
                                          status,

                                          appliedAt,

                                          docDeadline,
                                          interviewAt,
                                          finalResultAt,

                                          // legacy
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

                                          // legacy
                                          onDeadlineChange,

                                          onSubmit,
                                      }: Props) {
    // ✅ position이 빈 문자열이면 role로 fallback
    const resolvedPosition = position?.trim() || role?.trim() || "";

    // ✅ 지원일도 안전하게(빈 값이면 "")
    const resolvedAppliedAt = appliedAt?.trim() || "";

    // ✅ docDeadline 없으면 legacy deadline을 서류마감으로 취급
    const resolvedDocDeadline = docDeadline?.trim() || deadline?.trim() || "";

    const handlePositionChange = (value: string) => {
        if (onPositionChange) onPositionChange(value);
        else onRoleChange?.(value);
    };

    const handleAppliedAtChange = (value: string) => {
        onAppliedAtChange?.(value);
    };

    const handleDocDeadlineChange = (value: string) => {
        if (onDocDeadlineChange) onDocDeadlineChange(value);
        else onDeadlineChange?.(value);
    };

    return (
        <SectionCard title="새 지원 기록 추가">
            <form
                className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end"
                onSubmit={onSubmit}
            >
                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="company" className="mb-1 block text-xs md:text-sm">
                        회사명
                    </Label>
                    <TextInput
                        id="company"
                        placeholder="예: 카카오페이"
                        value={company}
                        onChange={(e) => onCompanyChange(e.target.value)}
                        required
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="position" className="mb-1 block text-xs md:text-sm">
                        직무명
                    </Label>
                    <TextInput
                        id="position"
                        placeholder="예: 데이터 산출 인턴"
                        value={resolvedPosition}
                        onChange={(e) => handlePositionChange(e.target.value)}
                        required
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="status" className="mb-1 block text-xs md:text-sm">
                        상태
                    </Label>
                    <Select
                        id="status"
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
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

                {/* ✅ 지원일 */}
                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="appliedAt" className="mb-1 block text-xs md:text-sm">
                        지원일
                    </Label>
                    <TextInput
                        id="appliedAt"
                        type="date"
                        value={resolvedAppliedAt}
                        className="dark:[color-scheme:dark]"
                        onChange={(e) => handleAppliedAtChange(e.target.value)}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="docDeadline" className="mb-1 block text-xs md:text-sm">
                        서류 마감일
                    </Label>
                    <TextInput
                        id="docDeadline"
                        type="date"
                        value={resolvedDocDeadline}
                        className="dark:[color-scheme:dark]"
                        onChange={(e) => handleDocDeadlineChange(e.target.value)}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="interviewAt" className="mb-1 block text-xs md:text-sm">
                        면접일
                    </Label>
                    <TextInput
                        id="interviewAt"
                        type="date"
                        value={(interviewAt ?? "").trim()}
                        className="dark:[color-scheme:dark]"
                        onChange={(e) => onInterviewAtChange?.(e.target.value)}
                    />
                </div>

                <div className="flex-1 min-w-[10rem]">
                    <Label htmlFor="finalResultAt" className="mb-1 block text-xs md:text-sm">
                        최종 발표일
                    </Label>
                    <TextInput
                        id="finalResultAt"
                        type="date"
                        value={(finalResultAt ?? "").trim()}
                        className="dark:[color-scheme:dark]"
                        onChange={(e) => onFinalResultAtChange?.(e.target.value)}
                    />
                </div>

                <div className="flex-none">
                    <Button
                        type="submit"
                        disabled={saving}
                        color="gray"
                        className="
              !bg-emerald-500
              hover:!bg-emerald-400
              !border-0
              !text-slate-900
              disabled:opacity-60
            "
                    >
                        {saving ? "저장 중..." : "지원 기록 추가"}
                    </Button>
                </div>
            </form>

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </SectionCard>
    );
}