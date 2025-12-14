import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { ApplicationList } from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

type CreateModalProps = {
    open: boolean;
    title?: string;
    disabledClose?: boolean;
    onClose: () => void;
    children: ReactNode;
};

function CreateModal({
                         open,
                         title = "지원 기록 추가",
                         disabledClose = false,
                         onClose,
                         children,
                     }: CreateModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-rose-950/25"
                onClick={disabledClose ? undefined : onClose}
                aria-label="닫기"
            />

            {/* panel */}
            <div className="relative mx-auto mt-16 w-[min(560px,calc(100%-24px))] rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-rose-900">{title}</h2>

                    <button
                        type="button"
                        onClick={disabledClose ? undefined : onClose}
                        disabled={disabledClose}
                        className="rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

export function ApplicationsPage() {
    const c = useApplicationsPageController();

    // CreateForm 모달 상태
    const [createOpen, setCreateOpen] = useState(false);

    const canCloseCreate = !c.saving;

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => {
        if (!canCloseCreate) return;
        setCreateOpen(false);
    }, [canCloseCreate]);

    const isCreateValid = useMemo(
        () => Boolean(c.newCompany.trim() && c.newRole.trim()),
        [c.newCompany, c.newRole],
    );

    const handleCreateAndClose = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            if (!isCreateValid) return;

            await c.handleCreate(e);

            // 저장 시도 후 닫기(실패 시 유지하고 싶으면 controller가 boolean을 리턴하도록 바꾸는게 베스트)
            setCreateOpen(false);
        },
        [c, isCreateValid],
    );

    return (
        <div className="space-y-6">
            {/* header: 제목 + 추가 버튼 */}
            <header className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-rose-900">지원 현황</h1>
                    <p className="text-sm text-rose-700/80">
                        지원한 공고를 한눈에 정리하고, 마감 일정 위주로 관리해요.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    disabled={c.saving}
                    className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400 disabled:opacity-60"
                >
                    + 지원 추가
                </button>
            </header>

            {/* summary */}
            <div className="grid gap-6 md:grid-cols-2">
                <ApplicationSummary
                    loading={c.loading}
                    total={c.totalCount}
                    inProgress={c.inProgressCount}
                    docDueSoon={c.docDueSoonCount}
                    interviewSoon={c.interviewSoonCount}
                    finalSoon={c.finalSoonCount}
                />
            </div>

            {/* list */}
            <section className="space-y-3">
                <div className="flex items-end justify-between">
                    <h2 className="text-sm font-semibold text-rose-900">지원 목록</h2>
                    <span className="text-xs text-rose-700/70">총 {c.totalCount}건</span>
                </div>

                <ApplicationList
                    loading={c.loading}
                    applications={c.applications}
                    onEdit={c.handleOpenEdit}
                    onDelete={c.handleDelete}
                />
            </section>

            {/* Create Modal */}
            <CreateModal open={createOpen} onClose={closeCreate} disabledClose={!canCloseCreate}>
                <ApplicationCreateForm
                    company={c.newCompany}
                    position={c.newRole}
                    status={c.newStatus}
                    appliedAt={c.newAppliedAt}
                    docDeadline={c.newDocumentDeadline}
                    interviewAt={c.newInterviewAt}
                    finalResultAt={c.newFinalResultAt}
                    saving={c.saving}
                    error={c.saveError}
                    onCompanyChange={c.setNewCompany}
                    onPositionChange={c.setNewRole}
                    onStatusChange={c.setNewStatus}
                    onAppliedAtChange={c.setNewAppliedAt}
                    onDocDeadlineChange={c.setNewDocumentDeadline}
                    onInterviewAtChange={c.setNewInterviewAt}
                    onFinalResultAtChange={c.setNewFinalResultAt}
                    onSubmit={handleCreateAndClose}
                />
            </CreateModal>

            {/* Edit Modal */}
            <ApplicationEditModal
                open={!!c.editingTarget}
                target={c.editingTarget ?? null}
                saving={c.editSaving}
                error={c.editError}
                onClose={c.handleCloseEdit}
                onSave={c.handleSaveEdit}
            />
        </div>
    );
}