// src/features/interviews/useInterviewPageController.ts
import { useCallback, useMemo, useState } from "react";
import { useInterviews } from "./useInterviews";
import { createInterview } from "../../../../shared/features/interviews/api";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

// 🔹 웹 Firebase auth
import { auth } from "../../libs/firebase";

export type CreateInterviewFormValues = {
    company: string;
    role: string;
    date: string;
    time: string;
    type: string;
    note: string;
};

function splitUpcomingAndPast(items: InterviewItem[]) {
    const now = new Date();
    const upcoming: InterviewItem[] = [];
    const past: InterviewItem[] = [];

    items.forEach((item) => {
        const target = item.scheduledAt ? item.scheduledAt.toDate() : null;

        if (target && target >= now) {
            upcoming.push(item);
        } else {
            past.push(item);
        }
    });

    return { upcoming, past };
}

/** 🔧 전달된 userId + Firebase auth.currentUser를 합쳐서 실제 userId 계산 */
function getEffectiveUserId(userId: string | null): string | null {
    const currentUid = auth?.currentUser?.uid ?? null;
    if (currentUid) return currentUid;

    if (!userId || userId === "web" || userId === "app") {
        return null;
    }

    return userId;
}

/**
 * 웹/앱 공통 인터뷰 페이지 컨트롤러
 * - userId는 외부(AuthContext 등)에서 주입
 */
export function useInterviewPageController(userId: string | null) {
    const {
        interviews,
        loading,
        error: listError,
        reload,
    } = useInterviews(userId);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleCreate = useCallback(
        async (values: CreateInterviewFormValues) => {
            const effectiveUserId = getEffectiveUserId(userId);

            if (!effectiveUserId) {
                setFormError("로그인이 필요합니다.");
                return;
            }

            setSaving(true);
            setFormError(null);

            try {
                await createInterview({
                    userId: effectiveUserId,
                    company: values.company,
                    role: values.role,
                    date: values.date,
                    time: values.time,
                    type: values.type,
                    note: values.note,
                });

                await reload();
            } catch (err) {
                console.error("면접 기록 저장 실패:", err);
                setFormError("면접을 저장하는 중 문제가 발생했습니다.");
            } finally {
                setSaving(false);
            }
        },
        [userId, reload],
    );

    const { upcoming, past } = useMemo(
        () => splitUpcomingAndPast(interviews),
        [interviews],
    );

    return {
        // 목록
        upcoming,
        past,
        loading,
        listError,

        // 생성
        saving,
        formError,
        handleCreate,
    };
}