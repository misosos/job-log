// src/pages/interviews/InterviewsPage.tsx
import { useCallback, useState } from "react";

import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

export function InterviewsPage() {
    const {
        upcoming,
        past,
        loading,
        listError,
        saving,
        formError,
        handleCreate,
    } = useInterviewPageController("web");

    const [createOpen, setCreateOpen] = useState(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    // ✅ 생성 성공하면 모달 닫기 (handleCreate 시그니처 그대로 전달)
    const handleCreateAndClose = useCallback(
        async (...args: Parameters<typeof handleCreate>) => {
            await handleCreate(...args);
            // 저장 성공/실패는 formError로 표시되고, 성공이면 닫히게
            setCreateOpen(false);
        },
        [handleCreate],
    );

    return (
        <div className="space-y-6">
            {/* 헤더 + 추가 버튼 */}
            <header className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-slate-100">면접</h1>
                    <p className="text-sm text-slate-400">
                        예정된 면접과 지난 면접 리뷰를 한 번에 관리해요.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 active:scale-[0.99]"
                >
                    + 면접 추가
                </button>
            </header>

            {listError && <p className="text-xs text-red-400">{listError}</p>}

            <UpcomingInterviewsSection items={upcoming} loading={loading} />
            <InterviewReviewSection items={past} loading={loading} />

            {/* ✅ Create Modal */}
            {createOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
                    onClick={closeCreate}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="새 면접 기록 추가"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-200">
                                새 면접 기록 추가
                            </h2>
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-full px-2 py-1 text-slate-400 hover:text-slate-200"
                                aria-label="닫기"
                            >
                                ✕
                            </button>
                        </div>

                        <InterviewCreateForm
                            saving={saving}
                            error={formError}
                            onSubmit={handleCreateAndClose}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}