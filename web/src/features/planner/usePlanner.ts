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
    ddayLabel: string;
    applicationId?: string;
};

export function usePlanner() {
    const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
    const [weekTasks, setWeekTasks] = useState<PlannerTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const all = await fetchPlannerTasks();
            setTodayTasks(all.filter((t) => t.scope === "today"));
            setWeekTasks(all.filter((t) => t.scope === "week"));
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
        async ({ title, scope, ddayLabel, applicationId }: CreatePlannerTaskInput) => {
            const trimmedTitle = title.trim();
            if (!trimmedTitle) return;

            setSaving(true);
            try {
                const newTask = await createPlannerTask({
                    title: trimmedTitle,
                    ddayLabel: ddayLabel.trim() || "오늘",
                    scope,
                    applicationId,
                });

                if (newTask.scope === "today") {
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