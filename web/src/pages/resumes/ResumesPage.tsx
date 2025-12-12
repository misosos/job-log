// src/pages/resumes/ResumesPage.tsx
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

    return (
        <div className="space-y-6">
            <SectionCard title="이력서 버전 관리">
                <p className="mb-4 text-sm text-slate-300">
                    회사/직무별로 다른 이력서 버전을 만들고, 공고에 맞게 골라 쓸 수 있어요.
                </p>

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

                {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

                <ResumeList
                    resumes={resumes}
                    loading={loading || saving}
                    onSetDefault={handleSetDefault}
                />
            </SectionCard>
        </div>
    );
}