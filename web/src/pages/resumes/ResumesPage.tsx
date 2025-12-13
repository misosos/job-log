import { useCallback, useState, type ReactNode } from "react";

import { SectionCard } from "../../components/common/SectionCard";
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import { useResumesPageController } from "../../features/resumes/useResumesPageController";
import { useAuth } from "../../libs/auth-context";

type ModalProps = {
    open: boolean;
    title: string;
    disabledClose?: boolean;
    onClose: () => void;
    children: ReactNode;
};

function Modal({
                   open,
                   title,
                   disabledClose = false,
                   onClose,
                   children,
               }: ModalProps) {
    if (!open) return null;

    const closeIfAllowed = () => {
        if (disabledClose) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* backdrop */}
            <button
                type="button"
                aria-label="닫기"
                className="absolute inset-0 bg-rose-900/20 backdrop-blur-sm"
                onClick={closeIfAllowed}
                disabled={disabledClose}
            />

            {/* panel */}
            <div
                className="relative w-full max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-rose-900">{title}</h2>
                    <button
                        type="button"
                        onClick={closeIfAllowed}
                        disabled={disabledClose}
                        className="rounded-md px-2 py-1 text-rose-500 hover:text-rose-700 disabled:opacity-50"
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

export function ResumesPage() {
    const { user } = useAuth();
    const userId = user?.uid ?? "web";

    const {
        // form
        title,
        target,
        note,
        link,
        setTitle,
        setTarget,
        setNote,
        setLink,
        isValid,

        // create
        handleCreate,
        saving,
        error,

        // list
        resumes,
        loading,

        // default
        handleSetDefault,
    } = useResumesPageController(userId);

    const [createOpen, setCreateOpen] = useState(false);

    const isBusy = loading || saving;

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => {
        if (saving) return; // 저장 중에는 닫기 방지
        setCreateOpen(false);
    }, [saving]);

    const handleCreateAndClose = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!isValid) return;

            try {
                await handleCreate(e);
                setCreateOpen(false);
            } catch {
                // 실패 시 모달 유지 (error는 controller state로 표시)
            }
        },
        [handleCreate, isValid],
    );

    return (
        <div className="space-y-6">
            <SectionCard title="이력서 버전 관리">
                <div className="space-y-4">
                    <p className="text-sm text-rose-700">
                        회사/직무별로 다른 이력서 버전을 만들고, 공고에 맞게 골라 쓸 수 있어요.
                    </p>

                    {/* button only */}
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-rose-50 hover:bg-rose-400 disabled:opacity-60"
                            disabled={saving}
                        >
                            + 새 이력서 추가
                        </button>
                    </div>

                    <ResumeList
                        resumes={resumes}
                        loading={isBusy}
                        onSetDefault={handleSetDefault}
                    />
                </div>
            </SectionCard>

            {/* Create Modal */}
            <Modal
                open={createOpen}
                title="새 이력서 기록 추가"
                disabledClose={saving}
                onClose={closeCreate}
            >
                <ResumeForm
                    title={title}
                    target={target}
                    link={link}
                    note={note}
                    isValid={isValid}
                    onSubmit={handleCreateAndClose}
                    onChangeTitle={setTitle}
                    onChangeTarget={setTarget}
                    onChangeLink={setLink}
                    onChangeNote={setNote}
                />

                {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
            </Modal>
        </div>
    );
}