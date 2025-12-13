import { useMemo, useState } from "react";
import { Modal, Label, Select, TextInput } from "flowbite-react";

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

// -----------------------------
// style tokens (중복 제거용)
// -----------------------------
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

// -----------------------------
// utils
// -----------------------------
type TimestampLike = { toDate: () => Date };

function isTimestampLike(v: unknown): v is TimestampLike {
    if (typeof v !== "object" || v === null) return false;
    if (!("toDate" in v)) return false;
    const maybe = (v as { toDate?: unknown }).toDate;
    return typeof maybe === "function";
}

function tsToYmd(ts?: unknown | null): string | null {
    if (!ts) return null;

    if (typeof ts === "string") {
        return /^\d{4}-\d{2}-\d{2}$/.test(ts) ? ts : null;
    }

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

// target에서 임의 키 접근(캐스팅/any 없이 안전하게)
function getProp(obj: unknown, key: string): unknown {
    if (typeof obj !== "object" || obj === null) return undefined;
    if (!(key in obj)) return undefined;
    return (obj as Record<string, unknown>)[key];
}

function pickFirstExisting(obj: unknown, keys: string[]): unknown {
    for (const k of keys) {
        const v = getProp(obj, k);
        if (v !== undefined && v !== null) return v;
    }
    return null;
}

function getPositionLabel(target: ApplicationRow | null): string {
    if (!target) return "";
    const pos = getProp(target, "position");
    if (typeof pos === "string" && pos.trim()) return pos.trim();

    const role = getProp(target, "role"); // 있을 수도 있는 필드
    if (typeof role === "string" && role.trim()) return role.trim();

    return "";
}

// -----------------------------
// draft
// -----------------------------
type Draft = {
    status: ApplicationStatus;
    appliedAt: string | null;
    docDeadline: string | null;
    interviewAt: string | null;
    finalResultAt: string | null;
};

function buildInitialDraft(target: ApplicationRow | null): Draft {
    return {
        status: target?.status ?? "지원 예정",
        appliedAt: tsToYmd(pickFirstExisting(target, ["appliedAt"])),
        docDeadline: tsToYmd(pickFirstExisting(target, ["docDeadline", "documentDeadline", "deadline"])),
        interviewAt: tsToYmd(pickFirstExisting(target, ["interviewAt", "interviewDate"])),
        finalResultAt: tsToYmd(pickFirstExisting(target, ["finalResultAt", "finalResultDate"])),
    };
}

// -----------------------------
// content
// -----------------------------
function ApplicationEditModalContent({
                                         target,
                                         saving,
                                         error,
                                         onClose,
                                         onSave,
                                     }: {
    target: ApplicationRow | null;
    saving: boolean;
    error?: string | null;
    onClose: () => void;
    onSave: Props["onSave"];
}) {
    // 리마운트될 때만 초기화 (useEffect 불필요)
    const [draft, setDraft] = useState<Draft>(() => buildInitialDraft(target));
    const positionLabel = useMemo(() => getPositionLabel(target), [target]);

    const handleSubmit = () => {
        if (!target) return;
        onSave(target.id, draft.status, {
            appliedAt: draft.appliedAt,
            docDeadline: draft.docDeadline,
            interviewAt: draft.interviewAt,
            finalResultAt: draft.finalResultAt,
        });
    };

    return (
        <div className="[color-scheme:light] rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 md:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-rose-900">지원 상태 수정</h3>
                <button type="button" onClick={onClose} className="text-rose-500 hover:text-rose-400">
                    ✕
                </button>
            </div>

            {target && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-rose-900">{target.company}</p>
                    {positionLabel ? <p className="text-xs text-rose-700">{positionLabel}</p> : null}
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <Label htmlFor="edit-status" className={LABEL_CLASS}>
                        지원 상태
                    </Label>
                    <Select
                        id="edit-status"
                        value={draft.status}
                        className={SELECT_WRAP_CLASS}
                        onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ApplicationStatus }))}
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
                        <Label htmlFor="edit-applied-at" className={LABEL_CLASS}>
                            지원일
                        </Label>
                        <TextInput
                            id="edit-applied-at"
                            type="date"
                            value={draft.appliedAt ?? ""}
                            className={INPUT_WRAP_CLASS}
                            onChange={(e) => setDraft((p) => ({ ...p, appliedAt: normalizeYmd(e.target.value) }))}
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-doc-deadline" className={LABEL_CLASS}>
                            서류 마감일
                        </Label>
                        <TextInput
                            id="edit-doc-deadline"
                            type="date"
                            value={draft.docDeadline ?? ""}
                            className={INPUT_WRAP_CLASS}
                            onChange={(e) => setDraft((p) => ({ ...p, docDeadline: normalizeYmd(e.target.value) }))}
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-interview-at" className={LABEL_CLASS}>
                            면접일
                        </Label>
                        <TextInput
                            id="edit-interview-at"
                            type="date"
                            value={draft.interviewAt ?? ""}
                            className={INPUT_WRAP_CLASS}
                            onChange={(e) => setDraft((p) => ({ ...p, interviewAt: normalizeYmd(e.target.value) }))}
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-final-result-at" className={LABEL_CLASS}>
                            최종 발표일
                        </Label>
                        <TextInput
                            id="edit-final-result-at"
                            type="date"
                            value={draft.finalResultAt ?? ""}
                            className={INPUT_WRAP_CLASS}
                            onChange={(e) => setDraft((p) => ({ ...p, finalResultAt: normalizeYmd(e.target.value) }))}
                        />
                    </div>
                </div>

                {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-rose-200 bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-200"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "저장 중..." : "저장"}
                </button>
            </div>
        </div>
    );
}

// -----------------------------
// modal wrapper
// -----------------------------
export function ApplicationEditModal({ open, target, saving, error, onClose, onSave }: Props) {
    // ✅ target 바뀌면 Content를 아예 리마운트해서 draft 초기화
    const contentKey = useMemo(() => `${open ? "1" : "0"}:${target?.id ?? "none"}`, [open, target?.id]);

    return (
        <Modal show={open} onClose={onClose} className="[color-scheme:light]">
            {open ? (
                <ApplicationEditModalContent
                    key={contentKey}
                    target={target}
                    saving={saving}
                    error={error}
                    onClose={onClose}
                    onSave={onSave}
                />
            ) : null}
        </Modal>
    );
}