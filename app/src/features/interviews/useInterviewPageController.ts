// src/features/interviews/useInterviewPageController.ts
import { useCallback, useMemo, useState } from "react";
import { auth } from "../../libs/firebase";
import { useInterviews } from "./useInterviews";
import { createInterview } from "./api";
import type { InterviewItem } from "./interviews";

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

export function useInterviewPageController() {
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid ?? null;

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
            const user = auth.currentUser;
            if (!user) {
                setFormError("로그인이 필요합니다.");
                return;
            }

            setSaving(true);
            setFormError(null);

            try {
                await createInterview({
                    userId: user.uid,
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
        [reload],
    );

    const { upcoming, past } = useMemo(
        () => splitUpcomingAndPast(interviews),
        [interviews],
    );

    return {
        // 목록 관련
        upcoming,
        past,
        loading,
        listError,

        // 생성 관련
        saving,
        formError,
        handleCreate,
    };
}