import { useCallback, useEffect, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";

import {
    createApplication,
    updateApplication,
    deleteApplication,
    listApplications,
    type UpdateApplicationInput,
} from "../../../../shared/features/applications/api";

import type {
    ApplicationRow,
    JobApplication,
    ApplicationStatus,
} from "../../../../shared/features/applications/types";

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

// -----------------------------
// date utils
// -----------------------------
function toTimestampFromYmd(ymd?: string | null): Timestamp | null {
    const trimmed = (ymd ?? "").trim();
    if (!trimmed) return null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

    const [year, month, day] = trimmed.split("-").map(Number);
    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    return Timestamp.fromDate(date);
}

function formatDotDate(ts?: Timestamp | null): string {
    if (!ts) return "";
    const date = ts.toDate();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatAppliedLabel(appliedAt?: Timestamp | null): string {
    return appliedAt ? formatDotDate(appliedAt) : "";
}

function isWithinNextNDays(ts?: Timestamp | null, days = 7): boolean {
    if (!ts) return false;
    if (days <= 0) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const end = new Date(startOfToday);
    end.setDate(end.getDate() + (days - 1));
    end.setHours(23, 59, 59, 999);

    const target = ts.toDate();
    return target >= startOfToday && target <= end;
}

function isWithinNext7Days(deadline?: Timestamp | null): boolean {
    return isWithinNextNDays(deadline, 7);
}

// -----------------------------
// Types
// -----------------------------
export type ApplicationRowWithLabels = ApplicationRow & {
    appliedAt?: Timestamp | null;

    docDeadlineLabel?: string;
    interviewAtLabel?: string;
    finalResultAtLabel?: string;
};

export type CreateApplicationFormInput = {
    company: string;
    position: string;
    status: ApplicationStatus;

    appliedAt?: string;

    docDeadline?: string;
    documentDeadline?: string;
    deadline?: string;

    interviewAt?: string;
    finalResultAt?: string;
};

type EditMeta = {
    appliedAt?: string | null;

    docDeadline?: string | null;
    interviewAt?: string | null;
    finalResultAt?: string | null;

    documentDeadline?: string | null;
    interviewDate?: string | null;
    finalResultDate?: string | null;
};

function toRow(app: JobApplication): ApplicationRowWithLabels {
    const docDeadline = app.docDeadline ?? app.deadline ?? null;

    const position =
        (app.position ?? "").trim() ||
        (app.role ?? "").trim() ||
        "";

    const interviewAt = app.interviewAt ?? null;
    const finalResultAt = app.finalResultAt ?? null;
    const appliedAt = app.appliedAt ?? null;

    return {
        id: app.id,
        company: app.company ?? "",

        position,
        role: position,

        status: app.status ?? DEFAULT_STATUS,

        appliedAt,
        appliedAtLabel: formatAppliedLabel(appliedAt),

        docDeadline,
        interviewAt,
        finalResultAt,

        deadline: app.deadline ?? null,

        docDeadlineLabel: docDeadline ? `${formatDotDate(docDeadline)} 서류마감` : "",
        interviewAtLabel: interviewAt ? `${formatDotDate(interviewAt)} 면접` : "",
        finalResultAtLabel: finalResultAt ? `${formatDotDate(finalResultAt)} 최종발표` : "",
    };
}

export function useApplications() {
    const [applications, setApplications] = useState<ApplicationRowWithLabels[]>([]);
    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [editingTarget, setEditingTarget] = useState<ApplicationRowWithLabels | null>(null);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // ✅ 삭제 상태 (선택이지만 앱 UX에 좋음)
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const apps = await listApplications({
                orderByField: "createdAt",
                orderDirection: "desc",
            });
            setApplications(apps.map(toRow));
        } catch (e) {
            console.error("지원 내역 불러오기 실패:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const create = useCallback(
        async (input: CreateApplicationFormInput) => {
            const company = input.company.trim();
            const position = input.position.trim();
            if (!company || !position) return;

            setSaving(true);
            setSaveError(null);

            try {
                const appliedAtTs = toTimestampFromYmd(input.appliedAt ?? null);

                const docDeadlineYmd =
                    input.docDeadline?.trim() ||
                    input.documentDeadline?.trim() ||
                    input.deadline?.trim() ||
                    "";

                const docDeadlineTs = toTimestampFromYmd(docDeadlineYmd || null);
                const interviewTs = toTimestampFromYmd(input.interviewAt ?? null);
                const finalTs = toTimestampFromYmd(input.finalResultAt ?? null);

                await createApplication({
                    company,
                    position,
                    status: input.status,

                    ...(appliedAtTs ? { appliedAt: appliedAtTs } : {}),

                    docDeadline: docDeadlineTs,
                    interviewAt: interviewTs,
                    finalResultAt: finalTs,

                    deadline: docDeadlineTs,
                });

                await load();
            } catch (e) {
                console.error("지원 내역 저장 실패:", e);
                setSaveError("지원 내역을 저장하는 중 문제가 발생했습니다.");
                throw e; // ✅ 상위(UI)에서도 잡을 수 있게
            } finally {
                setSaving(false);
            }
        },
        [load],
    );

    const openEdit = useCallback((row: ApplicationRowWithLabels) => {
        setEditingTarget(row);
        setEditError(null);
    }, []);

    const closeEdit = useCallback(() => {
        setEditingTarget(null);
    }, []);

    const saveEdit = useCallback(
        async (id: string, status: ApplicationStatus, meta?: EditMeta) => {
            setEditSaving(true);
            setEditError(null);

            try {
                const patch: UpdateApplicationInput = { status };

                const touchedApplied = !!meta && ("appliedAt" in meta);
                if (touchedApplied) {
                    patch.appliedAt = toTimestampFromYmd(meta?.appliedAt ?? null);
                }

                const touchedDoc = !!meta && ("docDeadline" in meta || "documentDeadline" in meta);
                if (touchedDoc) {
                    const ymd = meta?.docDeadline ?? meta?.documentDeadline ?? null;
                    const ts = toTimestampFromYmd(ymd);
                    patch.docDeadline = ts;
                    patch.deadline = ts;
                }

                const touchedInterview = !!meta && ("interviewAt" in meta || "interviewDate" in meta);
                if (touchedInterview) {
                    const ymd = meta?.interviewAt ?? meta?.interviewDate ?? null;
                    patch.interviewAt = toTimestampFromYmd(ymd);
                }

                const touchedFinal = !!meta && ("finalResultAt" in meta || "finalResultDate" in meta);
                if (touchedFinal) {
                    const ymd = meta?.finalResultAt ?? meta?.finalResultDate ?? null;
                    patch.finalResultAt = toTimestampFromYmd(ymd);
                }

                await updateApplication(id, patch);

                setEditingTarget(null);
                await load();
            } catch (e) {
                console.error("지원 내역 수정 실패:", e);
                setEditError("지원 내역을 수정하는 중 문제가 발생했습니다.");
                throw e; // ✅ 상위에서도 잡게
            } finally {
                setEditSaving(false);
            }
        },
        [load],
    );

    // ✅ 삭제: 에러를 먹지 말고 throw + (추천) optimistic UI
    const remove = useCallback(
        async (id: string) => {
            setDeletingId(id);
            setDeleteError(null);

            // optimistic: 먼저 UI에서 제거
            setApplications((prev) => prev.filter((a) => a.id !== id));
            // 편집중인 것 삭제했으면 모달 닫기
            setEditingTarget((prev) => (prev?.id === id ? null : prev));

            try {
                await deleteApplication(id);
                // 서버 기준 동기화
                await load();
            } catch (e) {
                console.error("지원 내역 삭제 실패:", e);
                setDeleteError("지원 내역을 삭제하는 중 문제가 발생했습니다.");
                // 실패 시 서버 기준으로 복구
                await load();
                throw e; // ✅ 화면에서 Alert 띄울 수 있게
            } finally {
                setDeletingId(null);
            }
        },
        [load],
    );

    const {
        totalCount,
        inProgressCount,
        docDue7Count,
        interviewDue7Count,
        finalResultDue7Count,
        dueThisWeekCount,
    } = useMemo(() => {
        const total = applications.length;

        const inProgress = applications.filter(
            (a) => a.status !== "최종 합격" && a.status !== "불합격" && a.status !== "지원 철회",
        ).length;

        const docDue7 = applications.filter((a) =>
            isWithinNextNDays(a.docDeadline ?? a.deadline ?? null, 7),
        ).length;

        const interviewDue7 = applications.filter((a) =>
            isWithinNextNDays(a.interviewAt ?? null, 7),
        ).length;

        const finalDue7 = applications.filter((a) =>
            isWithinNextNDays(a.finalResultAt ?? null, 7),
        ).length;

        return {
            totalCount: total,
            inProgressCount: inProgress,
            docDue7Count: docDue7,
            interviewDue7Count: interviewDue7,
            finalResultDue7Count: finalDue7,
            dueThisWeekCount: docDue7,
        };
    }, [applications]);

    return {
        applications,
        loading,

        create,
        saving,
        saveError,

        editingTarget,
        openEdit,
        closeEdit,
        saveEdit,
        editSaving,
        editError,

        remove,
        deletingId,     // ✅ 추가
        deleteError,    // ✅ 추가

        totalCount,
        inProgressCount,
        docDue7Count,
        interviewDue7Count,
        finalResultDue7Count,

        dueThisWeekCount,
        isWithinNext7Days,
    };
}