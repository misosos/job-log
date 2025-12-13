// src/components/applications/ApplicationEditModal.tsx
import { useEffect, useState } from "react";
import { Modal, Label, Select, TextInput } from "flowbite-react";

import type {
    ApplicationStatus,
    ApplicationRow,
} from "../../../../shared/features/applications/types.ts";

type Props = {
    open: boolean;
    target: ApplicationRow | null;
    saving: boolean;
    error?: string | null;
    onClose: () => void;
    onSave: (
        id: string,
        status: ApplicationStatus,
        meta?: {
            appliedAt?: string | null;
            docDeadline?: string | null;
            interviewAt?: string | null;
            finalResultAt?: string | null;
        },
    ) => void;
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

type TimestampLike = { toDate: () => Date };
function isTimestampLike(v: unknown): v is TimestampLike {
    return (
        typeof v === "object" &&
        v !== null &&
        "toDate" in v &&
        typeof (v as { toDate?: unknown }).toDate === "function"
    );
}

function tsToYmd(ts?: unknown | null): string | null {
    if (!ts) return null;
    if (typeof ts === "string") return /^\d{4}-\d{2}-\d{2}$/.test(ts) ? ts : null;
    const date = isTimestampLike(ts) ? ts.toDate() : null;
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function normalizeYmd(value: string): string | null {
    const v = value.trim();
    if (!v) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

type ApplicationRowExtended = ApplicationRow & {
    appliedAt?: unknown;
    documentDeadline?: unknown;
    interviewDate?: unknown;
    finalResultDate?: unknown;
};

export function ApplicationEditModal({
                                         open,
                                         target,
                                         saving,
                                         error,
                                         onClose,
                                         onSave,
                                     }: Props) {
    const [status, setStatus] = useState<ApplicationStatus>("지원 예정");
    const [appliedAt, setAppliedAt] = useState<string | null>(null);
    const [docDeadline, setDocDeadline] = useState<string | null>(null);
    const [interviewAt, setInterviewAt] = useState<string | null>(null);
    const [finalResultAt, setFinalResultAt] = useState<string | null>(null);

    useEffect(() => {
        const t: ApplicationRowExtended | null = target;

        setStatus(t?.status ?? "지원 예정");
        setAppliedAt(tsToYmd(t?.appliedAt ?? null));
        setDocDeadline(tsToYmd(t?.docDeadline ?? t?.documentDeadline ?? t?.deadline ?? null));
        setInterviewAt(tsToYmd(t?.interviewAt ?? t?.interviewDate ?? null));
        setFinalResultAt(tsToYmd(t?.finalResultAt ?? t?.finalResultDate ?? null));
    }, [target]);

    const handleSubmit = () => {
        if (!target) return;
        onSave(target.id, status, { appliedAt, docDeadline, interviewAt, finalResultAt });
    };

    const positionLabel = target?.position ?? target?.role ?? "";

    // ✅ 라벨(라이트 고정)
    const labelClass = "mb-1 block text-xs md:text-sm !text-rose-800";

    // ✅ Flowbite 내부 input/select에 직접 먹이기 (핵심)
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

    return (
        <Modal
            show={open}
            onClose={onClose}
            // ✅ 모달 전체 라이트 고정 (OS 다크/브라우저 영향 최소화)
            className="[color-scheme:light]"
        >
            {/* ✅ Flowbite Modal 내부 배경/텍스트도 라이트로 강제 */}
            <div className="[color-scheme:light] rounded-xl !border !border-rose-200 !bg-rose-50 p-4 !text-rose-900 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold !text-rose-900">지원 상태 수정</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="!text-rose-500 hover:!text-rose-400"
                    >
                        ✕
                    </button>
                </div>

                {target && (
                    <div className="mb-4">
                        <p className="text-sm font-semibold !text-rose-900">{target.company}</p>
                        <p className="text-xs !text-rose-700">{positionLabel}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="edit-status" className={labelClass}>
                            지원 상태
                        </Label>
                        <Select
                            id="edit-status"
                            value={status}
                            className={selectWrapClass}
                            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div>
                            <Label htmlFor="edit-applied-at" className={labelClass}>
                                지원일
                            </Label>
                            <TextInput
                                id="edit-applied-at"
                                type="date"
                                value={appliedAt ?? ""}
                                className={inputWrapClass}
                                onChange={(e) => setAppliedAt(normalizeYmd(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-doc-deadline" className={labelClass}>
                                서류 마감일
                            </Label>
                            <TextInput
                                id="edit-doc-deadline"
                                type="date"
                                value={docDeadline ?? ""}
                                className={inputWrapClass}
                                onChange={(e) => setDocDeadline(normalizeYmd(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-interview-at" className={labelClass}>
                                면접일
                            </Label>
                            <TextInput
                                id="edit-interview-at"
                                type="date"
                                value={interviewAt ?? ""}
                                className={inputWrapClass}
                                onChange={(e) => setInterviewAt(normalizeYmd(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-final-result-at" className={labelClass}>
                                최종 발표일
                            </Label>
                            <TextInput
                                id="edit-final-result-at"
                                type="date"
                                value={finalResultAt ?? ""}
                                className={inputWrapClass}
                                onChange={(e) => setFinalResultAt(normalizeYmd(e.target.value))}
                            />
                        </div>
                    </div>

                    {error && <p className="mt-1 text-xs !text-rose-600">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg !border !border-rose-200 !bg-rose-100 px-4 py-2 text-sm font-semibold !text-rose-800 hover:!bg-rose-200"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="rounded-lg !bg-rose-500 px-4 py-2 text-sm font-semibold !text-white hover:!bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}