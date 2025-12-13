import { useCallback, useEffect, useState } from "react";
import type { PlannerScope, PlannerTask } from "../../../../shared/features/planner/types";
import {
    createPlannerTask,
    fetchPlannerTasks,
    togglePlannerTaskDone,
    deletePlannerTask,
} from "../../../../shared/features/planner/api";

export type CreatePlannerTaskInput = {
    title: string;
    scope: PlannerScope;

    /** ✅ 신규 권장: 마감일(YYYY-MM-DD). */
    deadline?: string | null;

    /** (호환용) 기존 방식: D-day 라벨 문자열 */
    ddayLabel?: string;

    applicationId?: string;
};

function computeDdayLabelFromDeadline(deadline?: string | null): string {
    if (!deadline) return "오늘";

    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return "오늘";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();

    const diffDays = Math.round((due - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

function parseDeadlineMs(deadline?: string | null): number | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d).getTime();
}

function bucketFromTask(task: PlannerTask): PlannerScope {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startOfTodayMs = start.getTime();

    const dueMs = parseDeadlineMs((task as unknown as { deadline?: string | null }).deadline ?? null);

    // ✅ deadline이 있으면: 오늘(또는 지남)=today, 내일 이후=week
    if (dueMs !== null) {
        return dueMs <= startOfTodayMs ? "today" : "week";
    }

    // ✅ deadline이 없으면: 기존 scope로 fallback
    return task.scope;
}

export function usePlanner() {
    const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
    const [weekTasks, setWeekTasks] = useState<PlannerTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const all = await fetchPlannerTasks();

            const today: PlannerTask[] = [];
            const week: PlannerTask[] = [];

            for (const t of all) {
                const bucket = bucketFromTask(t);
                if (bucket === "today") today.push(t);
                else week.push(t);
            }

            setTodayTasks(today);
            setWeekTasks(week);
        } catch (error) {
            console.error("[Planner] 플래너 태스크 불러오기 실패:", error);
            setTodayTasks([]);
            setWeekTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTasks();
    }, [loadTasks]);

    const createTask = useCallback(
        async ({ title, scope, deadline, ddayLabel, applicationId }: CreatePlannerTaskInput) => {
            const trimmedTitle = title.trim();
            if (!trimmedTitle) return;

            setSaving(true);
            try {
                const normalizedDdayLabel = ddayLabel?.trim();

                const newTask = await createPlannerTask({
                    title: trimmedTitle,
                    scope,
                    applicationId,

                    // ✅ 신규
                    deadline: deadline ?? null,

                    // ✅ (호환) ddayLabel이 없으면 deadline 기반으로 자동 생성
                    ddayLabel: normalizedDdayLabel && normalizedDdayLabel.length > 0
                        ? normalizedDdayLabel
                        : computeDdayLabelFromDeadline(deadline ?? null),
                });

                if (bucketFromTask(newTask) === "today") {
                    setTodayTasks((prev) => [newTask, ...prev]);
                } else {
                    setWeekTasks((prev) => [newTask, ...prev]);
                }
            } catch (error) {
                console.error("[Planner] 할 일 추가 실패:", error);
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const toggleTask = useCallback(
        async (id: string) => {
            // ✅ 1) 로컬에서 먼저 낙관적 업데이트 (깜빡임 방지)
            setTodayTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, done: !t.done } : t,
                ),
            );
            setWeekTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, done: !t.done } : t,
                ),
            );

            try {
                // ✅ 2) 서버에 실제 토글 요청
                await togglePlannerTaskDone(id);
            } catch (error) {
                console.error("[Planner] 할 일 완료 상태 변경 실패:", error);
                // 실패 시 다시 한 번 토글해서 원복
                setTodayTasks((prev) =>
                    prev.map((t) =>
                        t.id === id ? { ...t, done: !t.done } : t,
                    ),
                );
                setWeekTasks((prev) =>
                    prev.map((t) =>
                        t.id === id ? { ...t, done: !t.done } : t,
                    ),
                );
            }
        },
        [],
    );

    const deleteTaskById = useCallback(
        async (id: string) => {
            setSaving(true);
            // ✅ 로컬에서 먼저 제거
            setTodayTasks((prev) => prev.filter((t) => t.id !== id));
            setWeekTasks((prev) => prev.filter((t) => t.id !== id));

            try {
                await deletePlannerTask(id);
            } catch (error) {
                console.error("[Planner] 할 일 삭제 실패:", error);
                // 실패했으면 서버 상태로 다시 동기화
                void loadTasks();
            } finally {
                setSaving(false);
            }
        },
        [loadTasks],
    );

    return {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
        reload: loadTasks,
    };
}