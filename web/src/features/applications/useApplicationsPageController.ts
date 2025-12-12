// src/features/applications/useApplicationsPageController.ts
import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import type { ApplicationStatus, ApplicationRow } from "../../../../shared/features/applications/types";
import {
    useApplications,
    type CreateApplicationFormInput,
} from "./useApplications";

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

export function useApplicationsPageController() {
    // 폼 상태
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] =
        useState<ApplicationStatus>(DEFAULT_STATUS);
    const [newDeadline, setNewDeadline] = useState("");

    // 기존 비즈니스 로직 훅 재사용
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
        dueThisWeekCount,
    } = useApplications();

    const handleCreate = useCallback(
        async (e?: FormEvent<HTMLFormElement>) => {
            // 웹: form onSubmit 에서 들어오는 이벤트만 preventDefault
            if (e && typeof e.preventDefault === "function") {
                e.preventDefault();
            }

            const payload: CreateApplicationFormInput = {
                company: newCompany,
                role: newRole,
                status: newStatus,
                deadline: newDeadline || undefined,
            };

            await create(payload);

            // 폼 초기화
            setNewCompany("");
            setNewRole("");
            setNewStatus(DEFAULT_STATUS);
            setNewDeadline("");
        },
        [newCompany, newRole, newStatus, newDeadline, create],
    );

    const handleOpenEdit = useCallback(
        (row: ApplicationRow) => {
            openEdit(row);
        },
        [openEdit],
    );

    const handleDelete = useCallback(
        async (id: string) => {
            if (!window.confirm("이 지원 내역을 삭제할까요?")) return;
            await remove(id);
        },
        [remove],
    );

    const handleSaveEdit = useCallback(
        async (id: string, status: ApplicationStatus) => {
            await saveEdit(id, status);
        },
        [saveEdit],
    );

    return {
        // ✅ 폼 상태 + setter
        newCompany,
        newRole,
        newStatus,
        newDeadline,
        setNewCompany,
        setNewRole,
        setNewStatus,
        setNewDeadline,

        // ✅ 생성 관련
        saving,
        saveError,
        handleCreate,

        // ✅ 목록 관련
        applications,
        loading,
        totalCount,
        inProgressCount,
        dueThisWeekCount,

        // ✅ 수정 관련
        editingTarget,
        editSaving,
        editError,
        handleOpenEdit,
        handleSaveEdit,
        handleCloseEdit: closeEdit,

        // ✅ 삭제 관련
        handleDelete,
    };
}