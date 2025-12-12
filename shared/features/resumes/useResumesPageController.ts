// src/features/resumes/useResumesPageController.ts
import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import { useResumesController } from "./useResumesController";

export function useResumesPageController() {
    // 📝 폼 상태
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");

    // 🔁 공통 도메인 훅 (API + 비즈니스 로직)
    const {
        resumes,
        loading,
        saving,
        error,
        createResumeVersion,
        setDefaultResumeVersion,
    } = useResumesController();

    const isValid = title.trim().length > 0 && target.trim().length > 0;

    // ✅ 생성 핸들러 (웹 form onSubmit용)
    const handleCreate = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!isValid) return;

            await createResumeVersion({
                title,
                target,
                note,
                link,
            });

            // 폼 초기화
            setTitle("");
            setTarget("");
            setNote("");
            setLink("");
        },
        [isValid, title, target, note, link, createResumeVersion],
    );

    // ✅ 기본 이력서 설정 핸들러
    const handleSetDefault = useCallback(
        (resumeId: string) => {
            void setDefaultResumeVersion(resumeId);
        },
        [setDefaultResumeVersion],
    );

    return {
        // 폼 상태 + setter
        title,
        target,
        note,
        link,
        setTitle,
        setTarget,
        setNote,
        setLink,
        isValid,

        // 생성 관련
        handleCreate,
        saving,
        error,

        // 목록 관련
        resumes,
        loading,

        // 기본 이력서 설정
        handleSetDefault,
    };
}