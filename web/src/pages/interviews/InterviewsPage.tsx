// src/pages/interviews/InterviewsPage.tsx
import { useCallback, useEffect, useRef, useState } from "react";

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

    const didSubmitRef = useRef(false);

    // ✅ 저장 완료(saving=false) & 에러 없음(formError 없음)일 때만 모달 자동 닫기
    useEffect(() => {
        if (!createOpen) return;
        if (!didSubmitRef.current) return;
        if (saving) return;

        if (!formError) {
            setCreateOpen(false);
        }
        didSubmitRef.current = false;
    }, [createOpen, saving, formError]);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleCreateAndClose = useCallback(
        async (...args: Parameters<typeof handleCreate>) => {
            didSubmitRef.current = true;
            await handleCreate(...args);
        },
        [handleCreate],
    );

    return (
        <div className="space-y-6">
            {/* 헤더 + 추가 버튼 */}
            <header className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-rose-900">면접</h1>
                    <p className="text-sm text-rose-700">
                        예정된 면접과 지난 면접 리뷰를 한 번에 관리해요.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-rose-50 hover:bg-rose-400 active:scale-[0.99]"
                >
                    + 면접 추가
                </button>
            </header>

            {listError && <p className="text-xs text-rose-700">{listError}</p>}

            <UpcomingInterviewsSection items={upcoming} loading={loading} />
            <InterviewReviewSection items={past} loading={loading} />

            {/* ✅ Create Modal */}
            {createOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-rose-900/20 px-4"
                    onClick={closeCreate}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="새 면접 기록 추가"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-rose-900">
                                새 면접 기록 추가
                            </h2>
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-full px-2 py-1 text-rose-400 hover:text-rose-600"
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