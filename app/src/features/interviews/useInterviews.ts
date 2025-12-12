// src/features/interviews/useInterviews.ts
import { useCallback, useEffect, useState } from "react";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";
import { fetchInterviews } from "../../../../shared/features/interviews/api";

// 🔹 웹 Firebase auth
import { auth } from "../../libs/firebase";

/** 전달된 userId + Firebase auth.currentUser를 합쳐서 실제로 쓸 userId 계산 */
function getEffectiveUserId(
    userId: string | null | undefined,
): string | null {
    // 1) 로그인되어 있으면 auth.currentUser 우선
    const currentUid = auth?.currentUser?.uid ?? null;
    if (currentUid) return currentUid;

    // 2) "web" / "app" 같은 가짜 ID는 무시
    if (!userId || userId === "web" || userId === "app") {
        return null;
    }

    // 3) 나머지는 그대로 사용 (앱 등에서 진짜 uid를 넘기는 경우)
    return userId;
}

export function useInterviews(userId: string | null | undefined) {
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const effectiveUserId = getEffectiveUserId(userId);

        // 디버깅용 로그
        console.log("[useInterviews] load", {
            userIdProp: userId,
            effectiveUserId,
        });

        // 로그인 안 되어 있으면 그냥 빈 리스트로
        if (!effectiveUserId) {
            setInterviews([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const items = await fetchInterviews(effectiveUserId);
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