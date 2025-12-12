// src/features/resumes/useResumesController.ts
import { useCallback, useEffect, useState } from "react";
import { createResume, fetchResumes, setDefaultResume } from "./api";
import type { ResumeVersion } from "./types";

type CreateResumeInput = {
    title: string;
    target: string;
    note?: string;
    link?: string;
};

/**
 * 웹/앱 공통으로 쓰는 이력서 컨트롤러 훅
 * - userId를 바깥(예: AuthContext)에서 주입받는다.
 */
export function useResumesController(userId: string | null) {
    const [resumes, setResumes] = useState<ResumeVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadResumes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (!userId) {
                // 로그인 안 되어 있으면 빈 배열로
                setResumes([]);
                return;
            }

            const rows = await fetchResumes(userId);
            setResumes(rows);
        } catch (err) {
            console.error("이력서 버전 불러오기 실패:", err);
            setError("이력서 정보를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        void loadResumes();
    }, [loadResumes]);

    const createResumeVersion = useCallback(
        async (input: CreateResumeInput) => {
            if (!userId) {
                setError("로그인이 필요합니다.");
                return;
            }

            setSaving(true);
            setError(null);

            try {
                await createResume(userId, {
                    title: input.title.trim(),
                    target: input.target.trim(),
                    note: input.note?.trim() || undefined,
                    link: input.link?.trim() || undefined,
                });

                await loadResumes();
            } catch (err) {
                console.error("이력서 버전 저장 실패:", err);
                setError("이력서 버전을 저장하는 중 문제가 발생했습니다.");
            } finally {
                setSaving(false);
            }
        },
        [userId, loadResumes],
    );

    const setDefaultResumeVersion = useCallback(
        async (resumeId: string) => {
            if (!userId) {
                setError("로그인이 필요합니다.");
                return;
            }

            setSaving(true);
            setError(null);

            try {
                await setDefaultResume(userId, resumeId);
                await loadResumes();
            } catch (err) {
                console.error("기본 이력서 설정 실패:", err);
                setError("기본 이력서를 설정하는 중 문제가 발생했습니다.");
            } finally {
                setSaving(false);
            }
        },
        [userId, loadResumes],
    );

    return {
        resumes,
        loading,
        saving,
        error,
        createResumeVersion,
        setDefaultResumeVersion,
        reload: loadResumes,
    };
}