import { useCallback, useEffect, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";

import {
    createApplication,
    updateApplication,
    deleteApplication,
    listApplications,
} from "./api";
import type { ApplicationRow,JobApplication, ApplicationStatus } from "./types";

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

// 날짜 포맷
function formatAppliedLabel(appliedAt?: Timestamp | null): string {
    if (!appliedAt) return "";
    const date = appliedAt.toDate();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day} 지원`;
}

// 7일 이내 마감 여부
function isWithinNext7Days(deadline?: Timestamp | null): boolean {
    if (!deadline) return false;
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const target = deadline.toDate();
    return target >= now && target <= end;
}

// JobApplication → UI에서 쓰는 ApplicationRow로 변환
function toRow(app: JobApplication): ApplicationRow {
    return {
        id: app.id,
        company: app.company ?? "",
        role: app.position ?? "",
        status: app.status ?? DEFAULT_STATUS,
        appliedAtLabel: formatAppliedLabel(app.appliedAt ?? null),
        deadline: app.deadline ?? null,
    };
}

export type CreateApplicationFormInput = {
    company: string;
    role: string;
    status: ApplicationStatus;
    /** "YYYY-MM-DD" */
    deadline?: string;
};

export function useApplications() {
    const [applications, setApplications] = useState<ApplicationRow[]>([]);
    const [loading, setLoading] = useState(true);

    // 생성 관련
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // 수정 관련
    const [editingTarget, setEditingTarget] = useState<ApplicationRow | null>(null);
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
            // 필요하면 에러 상태도 추가 가능
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    // 생성
    const create = useCallback(
        async ({ company, role, status, deadline }: CreateApplicationFormInput) => {
            if (!company.trim() || !role.trim()) return;

            setSaving(true);
            setSaveError(null);

            try {
                let deadlineTs: Timestamp | null = null;
                if (deadline && deadline.trim()) {
                    const [year, month, day] = deadline.split("-").map(Number);
                    const date = new Date(year, month - 1, day);
                    deadlineTs = Timestamp.fromDate(date);
                }

                await createApplication({
                    company: company.trim(),
                    position: role.trim(),
                    status,
                    deadline: deadlineTs ?? undefined,
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
    const openEdit = (row: ApplicationRow) => {
        setEditingTarget(row);
        setEditError(null);
    };
    const closeEdit = () => setEditingTarget(null);

    const saveEdit = async (id: string, status: ApplicationStatus) => {
        setEditSaving(true);
        setEditError(null);
        try {
            await updateApplication(id, { status });
            setEditingTarget(null);
            await load();
        } catch (e) {
            console.error("지원 내역 수정 실패:", e);
            setEditError("지원 내역을 수정하는 중 문제가 발생했습니다.");
        } finally {
            setEditSaving(false);
        }
    };

    // 삭제
    const remove = async (id: string) => {
        await deleteApplication(id);
        await load();
    };

    // 요약 정보는 memo로
    const { totalCount, inProgressCount, dueThisWeekCount } = useMemo(() => {
        const total = applications.length;
        const inProgress = applications.filter(
            (a) => a.status !== "최종 합격" && a.status !== "불합격",
        ).length;
        const dueWeek = applications.filter((a) =>
            isWithinNext7Days(a.deadline),
        ).length;

        return {
            totalCount: total,
            inProgressCount: inProgress,
            dueThisWeekCount: dueWeek,
        };
    }, [applications]);

    return {
        applications,
        loading,
        // 생성
        create,
        saving,
        saveError,
        // 수정
        editingTarget,
        openEdit,
        closeEdit,
        saveEdit,
        editSaving,
        editError,
        // 삭제
        remove,
        // 요약
        totalCount,
        inProgressCount,
        dueThisWeekCount,
    };
}