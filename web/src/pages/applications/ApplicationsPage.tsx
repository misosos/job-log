// src/pages/applications/ApplicationsPage.tsx
import {
    ApplicationList,
} from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

export function ApplicationsPage() {
    const {
        // 폼 상태
        newCompany,
        newRole,
        newStatus,
        newDeadline,
        setNewCompany,
        setNewRole,
        setNewStatus,
        setNewDeadline,

        // 생성 관련
        saving,
        saveError,
        handleCreate,

        // 목록 관련
        applications,
        loading,
        totalCount,
        inProgressCount,
        dueThisWeekCount,

        // 수정/삭제 관련
        editingTarget,
        editSaving,
        editError,
        handleOpenEdit,
        handleSaveEdit,
        handleCloseEdit,
        handleDelete,
    } = useApplicationsPageController();

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
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />
        </div>
    );
}