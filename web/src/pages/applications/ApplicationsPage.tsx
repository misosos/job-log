// src/pages/applications/ApplicationsPage.tsx
import { ApplicationList } from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

export function ApplicationsPage() {
    const {
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

        saving,
        saveError,
        handleCreate,

        applications,
        loading,
        totalCount,
        inProgressCount,

        docDueSoonCount,
        interviewSoonCount,
        finalSoonCount,

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
            <header className="space-y-1">
                <h1 className="text-xl font-semibold text-slate-100">지원 현황</h1>
                <p className="text-sm text-slate-400">
                    지원한 공고를 한눈에 정리하고, 마감 일정 위주로 관리해요.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <ApplicationCreateForm
                    company={newCompany}
                    position={newRole}
                    status={newStatus}
                    appliedAt={newAppliedAt}
                    onAppliedAtChange={setNewAppliedAt}
                    docDeadline={newDocumentDeadline}
                    interviewAt={newInterviewAt}
                    finalResultAt={newFinalResultAt}
                    saving={saving}
                    error={saveError}
                    onCompanyChange={setNewCompany}
                    onPositionChange={setNewRole}
                    onStatusChange={setNewStatus}
                    onDocDeadlineChange={setNewDocumentDeadline}
                    onInterviewAtChange={setNewInterviewAt}
                    onFinalResultAtChange={setNewFinalResultAt}
                    onSubmit={handleCreate}
                />

                <ApplicationSummary
                    loading={loading}
                    total={totalCount}
                    inProgress={inProgressCount}
                    docDueSoon={docDueSoonCount}
                    interviewSoon={interviewSoonCount}
                    finalSoon={finalSoonCount}
                />
            </div>

            <section className="space-y-3">
                <div className="flex items-end justify-between">
                    <h2 className="text-sm font-semibold text-slate-200">지원 목록</h2>
                    <span className="text-xs text-slate-400">총 {totalCount}건</span>
                </div>

                <ApplicationList
                    loading={loading}
                    applications={applications}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                />
            </section>

            <ApplicationEditModal
                open={!!editingTarget}
                target={editingTarget ?? null}
                saving={editSaving}
                error={editError}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}  // ✅ 매핑 제거: 그대로 전달
            />
        </div>
    );
}