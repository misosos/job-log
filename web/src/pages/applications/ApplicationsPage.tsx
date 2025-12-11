// src/pages/applications/ApplicationsPage.tsx
import { useState, type FormEvent } from "react";

import {
    ApplicationList,
    type ApplicationRow,
} from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import type { ApplicationStatus } from "../../components/common/ApplicationStatusBadge";
import {
    useApplications,
    type CreateApplicationFormInput,
} from "../../features/applications/useApplications";

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

export function ApplicationsPage() {
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] =
        useState<ApplicationStatus>(DEFAULT_STATUS);
    const [newDeadline, setNewDeadline] = useState("");

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

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: CreateApplicationFormInput = {
            company: newCompany,
            role: newRole,
            status: newStatus,
            deadline: newDeadline || undefined,
        };

        await create(payload);

        setNewCompany("");
        setNewRole("");
        setNewStatus(DEFAULT_STATUS);
        setNewDeadline("");
    };

    const handleOpenEdit = (row: ApplicationRow) => {
        openEdit(row);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("이 지원 내역을 삭제할까요?")) return;
        await remove(id);
    };

    const handleSaveEdit = async (id: string, status: ApplicationStatus) => {
        await saveEdit(id, status);
    };

    return (
        <div className="space-y-6">
            <ApplicationCreateForm
                company={newCompany}
                role={newRole}
                status={newStatus}
                deadline={newDeadline}
                saving={saving}
                error={saveError}
                onCompanyChange={setNewCompany}
                onRoleChange={setNewRole}
                onStatusChange={setNewStatus}
                onDeadlineChange={setNewDeadline}
                onSubmit={handleCreate}
            />

            <ApplicationSummary
                loading={loading}
                total={totalCount}
                inProgress={inProgressCount}
                dueThisWeek={dueThisWeekCount}
            />

            <ApplicationList
                loading={loading}
                applications={applications}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
            />

            <ApplicationEditModal
                open={!!editingTarget}
                target={editingTarget}
                saving={editSaving}
                error={editError}
                onClose={closeEdit}
                onSave={handleSaveEdit}
            />
        </div>
    );
}