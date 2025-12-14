import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

type ModalProps = {
    open: boolean;
    title: string;
    disabledClose?: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

function Modal({ open, title, disabledClose = false, onClose, children }: ModalProps) {
    if (!open) return null;

    const handleBackdropClick = () => {
        if (disabledClose) return;
        onClose();
    };

    const handleCloseClick = () => {
        if (disabledClose) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                className="absolute inset-0 bg-rose-900/20"
                onClick={handleBackdropClick}
                aria-label="닫기"
                disabled={disabledClose}
            />

            <div
                className="relative w-full max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-rose-900">{title}</h2>
                    <button
                        type="button"
                        onClick={handleCloseClick}
                        disabled={disabledClose}
                        className="rounded-full px-2 py-1 text-rose-400 hover:text-rose-600 disabled:opacity-50"
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

    // "제출 시도" 플래그: 저장 완료 시 모달 자동 닫기 판단에만 사용
    const didSubmitRef = useRef(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => {
        if (saving) return; // 저장 중에는 닫힘 방지
        setCreateOpen(false);
        didSubmitRef.current = false;
    }, [saving]);

    // 저장 완료(saving=false) & 제출 시도했고 & 에러 없으면 자동 닫기
    useEffect(() => {
        if (!createOpen) return;
        if (!didSubmitRef.current) return;
        if (saving) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!formError) setCreateOpen(false);
        didSubmitRef.current = false;
    }, [createOpen, saving, formError]);

    const handleCreateAndClose = useCallback(
        async (...args: Parameters<typeof handleCreate>) => {
            didSubmitRef.current = true;
            await handleCreate(...args);
        },
        [handleCreate],
    );

    const sectionsLoading = useMemo(() => loading, [loading]);

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
                    className="inline-flex items-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-rose-50 hover:bg-rose-400 active:scale-[0.99] disabled:opacity-60"
                    disabled={saving}
                >
                    + 면접 추가
                </button>
            </header>

            {listError && <p className="text-xs text-rose-700">{listError}</p>}

            <UpcomingInterviewsSection items={upcoming} loading={sectionsLoading} />
            <InterviewReviewSection items={past} loading={sectionsLoading} />

            <Modal
                open={createOpen}
                title="새 면접 기록 추가"
                disabledClose={saving}
                onClose={closeCreate}
            >
                <InterviewCreateForm
                    saving={saving}
                    error={formError}
                    onSubmit={handleCreateAndClose}
                />
            </Modal>
        </div>
    );
}