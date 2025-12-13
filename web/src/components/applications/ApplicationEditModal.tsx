// src/components/applications/ApplicationEditModal.tsx
import { useEffect, useState } from "react";
import { Modal, Button, Label, Select, TextInput } from "flowbite-react";

import type { ApplicationStatus, ApplicationRow } from "../../../../shared/features/applications/types.ts";

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

export function ApplicationEditModal({ open, target, saving, error, onClose, onSave }: Props) {
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

    return (
        <Modal show={open} onClose={onClose}>
            <div className="p-4 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">지원 상태 수정</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">
                        ✕
                    </button>
                </div>

                {target && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-slate-100">{target.company}</p>
                        <p className="text-xs text-slate-400">{positionLabel}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <div>
                        <Label htmlFor="edit-status" className="mb-1 block text-xs md:text-sm">
                            지원 상태
                        </Label>
                        <Select
                            id="edit-status"
                            value={status}
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
                            <Label htmlFor="edit-applied-at" className="mb-1 block text-xs md:text-sm">
                                지원일
                            </Label>
                            <TextInput
                                id="edit-applied-at"
                                type="date"
                                value={appliedAt ?? ""}
                                className="dark:[color-scheme:dark]"
                                onChange={(e) => setAppliedAt(normalizeYmd(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-doc-deadline" className="mb-1 block text-xs md:text-sm">
                                서류 마감일
                            </Label>
                            <TextInput
                                id="edit-doc-deadline"
                                type="date"
                                value={docDeadline ?? ""}
                                className="dark:[color-scheme:dark]"
                                onChange={(e) => setDocDeadline(normalizeYmd(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-interview-at" className="mb-1 block text-xs md:text-sm">
                                면접일
                            </Label>
                            <TextInput
                                id="edit-interview-at"
                                type="date"
                                value={interviewAt ?? ""}
                                className="dark:[color-scheme:dark]"
                                onChange={(e) => setInterviewAt(normalizeYmd(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-final-result-at" className="mb-1 block text-xs md:text-sm">
                                최종 발표일
                            </Label>
                            <TextInput
                                id="edit-final-result-at"
                                type="date"
                                value={finalResultAt ?? ""}
                                className="dark:[color-scheme:dark]"
                                onChange={(e) => setFinalResultAt(normalizeYmd(e.target.value))}
                            />
                        </div>
                    </div>

                    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button color="gray" onClick={onClose}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}