// src/pages/resumes/ResumesPage.tsx
import { useState, type FormEvent } from "react";
import { SectionCard } from "../../components/common/SectionCard";
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import { useResumesController } from "../../features/resumes/useResumesController";

export function ResumesPage() {
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");

    const {
        resumes,
        loading,
        saving,
        error,
        createResumeVersion,
        setDefaultResumeVersion,
    } = useResumesController();

    const isValid = title.trim().length > 0 && target.trim().length > 0;

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid) return;

        await createResumeVersion({
            title,
            target,
            note,
            link,
        });

        setTitle("");
        setTarget("");
        setNote("");
        setLink("");
    };

    const handleSetDefault = (resumeId: string) => {
        void setDefaultResumeVersion(resumeId);
    };

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