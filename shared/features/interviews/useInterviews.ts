import { useCallback, useEffect, useState } from "react";
import type { InterviewItem } from "./interviews";
import { fetchInterviews } from "./api";

export function useInterviews(userId: string | null | undefined) {
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        // 로그인 안 되어 있으면 그냥 빈 리스트로
        if (!userId) {
            setInterviews([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const items = await fetchInterviews(userId);
            setInterviews(items);
        } catch (err) {
            console.error("면접 기록 불러오기 실패:", err);
            setError("면접 기록을 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        interviews,
        loading,
        error,
        reload: load,
    };
}