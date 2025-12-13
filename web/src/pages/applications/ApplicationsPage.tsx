// src/pages/applications/ApplicationsPage.tsx
import { useCallback, useState } from "react";

import { ApplicationList } from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

function CreateModal({
                         open,
                         title = "지원 기록 추가",
                         disabledClose,
                         onClose,
                         children,
                     }: {
    open: boolean;
    title?: string;
    disabledClose?: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-slate-950/70"
                onClick={disabledClose ? undefined : onClose}
                aria-label="닫기"
            />

            {/* panel */}
            <div className="relative mx-auto mt-16 w-[min(560px,calc(100%-24px))] rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
                    <button
                        type="button"
                        onClick={disabledClose ? undefined : onClose}
                        className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-900 hover:text-slate-200 disabled:opacity-50"
                        disabled={disabledClose}
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

    // ✅ CreateForm 모달 상태
    const [createOpen, setCreateOpen] = useState(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => {
        // 저장 중에는 닫힘 방지(원하면 제거 가능)
        if (saving) return;
        setCreateOpen(false);
    }, [saving]);

    // ✅ 제출 시 저장 후 모달 닫기(유효성 통과했을 때만)
    const handleCreateAndClose = useCallback(
        async (e?: React.FormEvent<HTMLFormElement>) => {
            // 폼 유효성(현재 페이지 상태 기준)
            const ok = newCompany.trim() && newRole.trim();
            if (!ok) return;

            await handleCreate(e);

            // 실패 시 모달 유지하고 싶으면 여기서 saveError 상태를 보고 판단하도록 훅을 boolean 리턴으로 바꾸는게 베스트.
            // 일단은 UX 상 "저장 시도 후 닫기"로 처리.
            setCreateOpen(false);
        },
        [handleCreate, newCompany, newRole],
    );

    return (
        <div className="space-y-6">
            {/* header: 제목 + 추가 버튼 */}
            <header className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-slate-100">지원 현황</h1>
                    <p className="text-sm text-slate-400">
                        지원한 공고를 한눈에 정리하고, 마감 일정 위주로 관리해요.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-400 disabled:opacity-60"
                    disabled={saving}
                >
                    + 지원 추가
                </button>
            </header>

            {/* ✅ 요약만 상단에 두고, Create는 모달로 */}
            <div className="grid gap-6 md:grid-cols-2">
                <ApplicationSummary
                    loading={loading}
                    total={totalCount}
                    inProgress={inProgressCount}
                    docDueSoon={docDueSoonCount}
                    interviewSoon={interviewSoonCount}
                    finalSoon={finalSoonCount}
                />

                {/* 오른쪽 칸이 허전하면 “간단 안내 카드” 정도만 */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="text-sm font-semibold text-slate-100">빠른 추가</div>
                    <p className="mt-1 text-sm text-slate-400">
                        오른쪽 위 <span className="text-rose-300">+ 지원 추가</span>로 기록을 추가할 수 있어요.
                    </p>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="mt-3 inline-flex rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                    >
                        지금 추가하기
                    </button>
                </div>
            </div>

            {/* list */}
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

            {/* ✅ Create Modal */}
            <CreateModal open={createOpen} onClose={closeCreate} disabledClose={saving}>
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
                    onSubmit={handleCreateAndClose}
                />
            </CreateModal>

            {/* Edit Modal 그대로 */}
            <ApplicationEditModal
                open={!!editingTarget}
                target={editingTarget ?? null}
                saving={editSaving}
                error={editError}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />
        </div>
    );
}