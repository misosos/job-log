// src/features/applications/useApplicationsPageController.ts
import { useCallback, useState } from "react";

import type { ApplicationStatus } from "../../../../shared/features/applications/types";
import {
    useApplications,
    type CreateApplicationFormInput,
    type ApplicationRowWithLabels,
} from "./useApplications";

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

/** ✅ 웹/앱 공용: DOM FormEvent 대신 최소 형태만 사용 */
type SubmitEventLike = {
    preventDefault?: () => void;
};

export function useApplicationsPageController() {
    // 폼 상태
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState(""); // UI 호환 이름 유지(= position으로 저장)
    const [newStatus, setNewStatus] = useState<ApplicationStatus>(DEFAULT_STATUS);

    // ✅ 지원일(YYYY-MM-DD)
    const [newAppliedAt, setNewAppliedAt] = useState("");

    // ✅ 실용적인 일정 필드(서류/면접/최종)
    const [newDocumentDeadline, setNewDocumentDeadline] = useState("");
    const [newInterviewAt, setNewInterviewAt] = useState("");
    const [newFinalResultAt, setNewFinalResultAt] = useState("");

    const {
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

        // ✅ 실용 요약(7일)
        docDue7Count,
        interviewDue7Count,
        finalResultDue7Count,

        // (호환)
        dueThisWeekCount,
    } = useApplications();

    const handleCreate = useCallback(
        async (e?: SubmitEventLike) => {
            e?.preventDefault?.();

            const company = newCompany.trim();
            const position = newRole.trim();
            if (!company || !position) return;

            const appliedAt = newAppliedAt.trim();
            const docDeadline = newDocumentDeadline.trim();
            const interviewAt = newInterviewAt.trim();
            const finalResultAt = newFinalResultAt.trim();

            const payload: CreateApplicationFormInput = {
                company,
                position,
                status: newStatus,

                // ✅ 신규: 지원일 (미입력이면 undefined)
                appliedAt: appliedAt || undefined,

                // ✅ 신규 권장: 3대 날짜
                docDeadline: docDeadline || undefined,
                interviewAt: interviewAt || undefined,
                finalResultAt: finalResultAt || undefined,

                // ✅ (호환) legacy deadline도 서류마감으로 동기화
                deadline: docDeadline || undefined,
            };

            await create(payload);

            // 폼 초기화
            setNewCompany("");
            setNewRole("");
            setNewStatus(DEFAULT_STATUS);

            setNewAppliedAt("");
            setNewDocumentDeadline("");
            setNewInterviewAt("");
            setNewFinalResultAt("");
        },
        [
            newCompany,
            newRole,
            newStatus,
            newAppliedAt,
            newDocumentDeadline,
            newInterviewAt,
            newFinalResultAt,
            create,
        ],
    );

    const handleOpenEdit = useCallback(
        (row: ApplicationRowWithLabels) => {
            openEdit(row);
        },
        [openEdit],
    );

    /**
     * ✅ 웹/앱 공용 삭제
     * - 웹: window.confirm 있으면 confirm
     * - 앱(RN): window 없으므로 confirm 없이 삭제 실행 (RN 화면에서 Alert로 감싸서 호출하면 됨)
     */
    const handleDelete = useCallback(
        async (id: string) => {
            const canUseWindowConfirm =
                typeof window !== "undefined" && typeof window.confirm === "function";

            if (canUseWindowConfirm) {
                const ok = window.confirm("이 지원 내역을 삭제할까요?");
                if (!ok) return;
            }

            await remove(id);
        },
        [remove],
    );

    // ✅ EditModal meta(지원일/서류/면접/최종) 저장
    const handleSaveEdit = useCallback(
        async (
            id: string,
            status: ApplicationStatus,
            meta?: {
                /** ✅ 지원일 추가 */
                appliedAt?: string | null;

                docDeadline?: string | null;
                interviewAt?: string | null;
                finalResultAt?: string | null;

                // 레거시 호환
                documentDeadline?: string | null;
                interviewDate?: string | null;
                finalResultDate?: string | null;
            },
        ) => {
            await saveEdit(id, status, meta);
        },
        [saveEdit],
    );

    return {
        // 폼 상태 + setter
        newCompany,
        newRole,
        newStatus,
        newAppliedAt,
        newDocumentDeadline,
        newInterviewAt,
        newFinalResultAt,
        setNewCompany,
        setNewRole,
        setNewStatus,
        setNewAppliedAt,
        setNewDocumentDeadline,
        setNewInterviewAt,
        setNewFinalResultAt,

        // 생성 관련
        saving,
        saveError,
        handleCreate,

        // 목록 관련
        applications,
        loading,
        totalCount,
        inProgressCount,

        // ✅ 요약(실용: 7일)
        docDueSoonCount: docDue7Count,
        interviewSoonCount: interviewDue7Count,
        finalSoonCount: finalResultDue7Count,

        // (호환)
        dueThisWeekCount,

        // 수정/삭제 관련
        editingTarget,
        editSaving,
        editError,
        handleOpenEdit,
        handleSaveEdit,
        handleCloseEdit: closeEdit,
        handleDelete,
    };
}