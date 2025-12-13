// src/pages/resumes/ResumesPage.tsx
import { useCallback, useState } from "react";

import { SectionCard } from "../../components/common/SectionCard";
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import { useResumesPageController } from "../../features/resumes/useResumesPageController";
import { useAuth } from "../../libs/auth-context";

export function ResumesPage() {
    const { user } = useAuth();
    const userId = user?.uid ?? "web";

    const {
        // 폼
        title,
        target,
        note,
        link,
        setTitle,
        setTarget,
        setNote,
        setLink,
        isValid,

        // 생성
        handleCreate,
        saving,
        error,

        // 목록
        resumes,
        loading,

        // 기본 이력서 설정
        handleSetDefault,
    } = useResumesPageController(userId);

    const [createOpen, setCreateOpen] = useState(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    return (
        <div className="space-y-6">
            <SectionCard title="이력서 버전 관리">
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                        회사/직무별로 다른 이력서 버전을 만들고, 공고에 맞게 골라 쓸 수 있어요.
                    </p>

                    {/* ✅ 폼 대신 버튼만 노출 */}
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                            disabled={saving}
                        >
                            + 새 이력서 추가
                        </button>
                    </div>

                    {/* ✅ 목록은 그대로 */}
                    <ResumeList
                        resumes={resumes}
                        loading={loading || saving}
                        onSetDefault={handleSetDefault}
                    />
                </div>
            </SectionCard>

            {/* ✅ Create Modal */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* backdrop */}
                    <button
                        type="button"
                        aria-label="닫기"
                        className="absolute inset-0 bg-slate-950/70"
                        onClick={closeCreate}
                    />

                    {/* modal */}
                    <div
                        className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="새 이력서 추가"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-100">
                                새 이력서 기록 추가
                            </h2>
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-md px-2 py-1 text-slate-400 hover:text-slate-200"
                                aria-label="닫기"
                            >
                                ✕
                            </button>
                        </div>

                        <ResumeForm
                            title={title}
                            target={target}
                            link={link}
                            note={note}
                            isValid={isValid}
                            onSubmit={handleCreate}
                            onChangeTitle={setTitle}
                            onChangeTarget={setTarget}
                            onChangeLink={setLink}
                            onChangeNote={setNote}
                        />

                        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}