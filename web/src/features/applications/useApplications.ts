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

    // date input: YYYY-MM-DD
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

/** ✅ "지원 {appliedAtLabel}"로 붙여 쓰니까 여기서는 날짜만 반환 */
function formatAppliedLabel(appliedAt?: Timestamp | null): string {
    return appliedAt ? formatDotDate(appliedAt) : "";
}

function isWithinNextNDays(ts?: Timestamp | null, days = 7): boolean {
    if (!ts) return false;
    if (days <= 0) return false;

    const now = new Date();
    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
    );

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
    /** ✅ 리스트에서 raw도 포함 */
    appliedAt?: Timestamp | null;

    docDeadlineLabel?: string;
    interviewAtLabel?: string;
    finalResultAtLabel?: string;
};

export type CreateApplicationFormInput = {
    company: string;
    position: string;
    status: ApplicationStatus;

    /** ✅ 지원일(YYYY-MM-DD) */
    appliedAt?: string;

    docDeadline?: string;
    documentDeadline?: string;
    deadline?: string;

    interviewAt?: string;
    finalResultAt?: string;
};

/** ✅ EditModal meta: 신규 키 or 레거시 키 둘 다 허용 */
type EditMeta = {
    /** ✅ 지원일 */
    appliedAt?: string | null;

    // 신규(권장)
    docDeadline?: string | null;
    interviewAt?: string | null;
    finalResultAt?: string | null;

    // 레거시(호환)
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

    // ✅ 지원일: fallback 금지(없으면 그냥 null)
    const appliedAt = app.appliedAt ?? null;

    return {
        id: app.id,
        company: app.company ?? "",

        // ✅ UI 호환: role도 같이 채움(값은 position으로 통일)
        position,
        role: position,

        status: app.status ?? DEFAULT_STATUS,

        // ✅ 지원일 raw + label
        appliedAt,
        appliedAtLabel: formatAppliedLabel(appliedAt),

        docDeadline,
        interviewAt,
        finalResultAt,

        // 레거시 유지
        deadline: app.deadline ?? null,

        // 라벨
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

    // 생성
    const create = useCallback(
        async (input: CreateApplicationFormInput) => {
            const company = input.company.trim();
            const position = input.position.trim();
            if (!company || !position) return;

            setSaving(true);
            setSaveError(null);

            try {
                // ✅ 지원일: 입력 없으면 null
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

                    // ✅ 지원일은 "선택했을 때만" 넣기
                    ...(appliedAtTs ? { appliedAt: appliedAtTs } : {}),

                    docDeadline: docDeadlineTs,
                    interviewAt: interviewTs,
                    finalResultAt: finalTs,

                    // ✅ 레거시 동기화(서류마감)
                    deadline: docDeadlineTs,
                });

                await load();
            } catch (e) {
                console.error("지원 내역 저장 실패:", e);
                setSaveError("지원 내역을 저장하는 중 문제가 발생했습니다.");
            } finally {
                setSaving(false);
            }
        },
        [load],
    );

    // 수정 모달
    const openEdit = useCallback((row: ApplicationRowWithLabels) => {
        setEditingTarget(row);
        setEditError(null);
    }, []);

    const closeEdit = useCallback(() => {
        setEditingTarget(null);
    }, []);

    // 수정
    const saveEdit = useCallback(
        async (id: string, status: ApplicationStatus, meta?: EditMeta) => {
            setEditSaving(true);
            setEditError(null);

            try {
                const patch: UpdateApplicationInput = { status };

                // ✅ 지원일: meta에 appliedAt 키가 "존재"하면(=사용자가 건드렸으면) null 포함해서 반영
                const touchedApplied = !!meta && ("appliedAt" in meta);
                if (touchedApplied) {
                    patch.appliedAt = toTimestampFromYmd(meta?.appliedAt ?? null);
                }

                // ✅ 서류마감
                const touchedDoc = !!meta && ("docDeadline" in meta || "documentDeadline" in meta);
                if (touchedDoc) {
                    const ymd = meta?.docDeadline ?? meta?.documentDeadline ?? null;
                    const ts = toTimestampFromYmd(ymd);
                    patch.docDeadline = ts;
                    patch.deadline = ts; // legacy 동기화
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
            } finally {
                setEditSaving(false);
            }
        },
        [load],
    );

    // 삭제
    const remove = useCallback(
        async (id: string) => {
            try {
                await deleteApplication(id);
                await load();
            } catch (e) {
                console.error("지원 내역 삭제 실패:", e);
            }
        },
        [load],
    );

    // 요약(7일)
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

            // (호환)
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

        totalCount,
        inProgressCount,
        docDue7Count,
        interviewDue7Count,
        finalResultDue7Count,

        dueThisWeekCount,
        isWithinNext7Days,
    };
}