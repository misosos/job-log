import { useCallback, useEffect, useState } from "react";
import type { PlannerScope, PlannerTask } from "./types";
import {
    createPlannerTask,
    fetchPlannerTasks,
    togglePlannerTaskDone,
    deletePlannerTask,
} from "./api";

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
            try {
                await togglePlannerTaskDone(id);
                await loadTasks();
            } catch (error) {
                console.error("[Planner] 할 일 완료 상태 변경 실패:", error);
            }
        },
        [loadTasks],
    );

    const deleteTaskById = useCallback(
        async (id: string) => {
            try {
                await deletePlannerTask(id);
                await loadTasks();
            } catch (error) {
                console.error("[Planner] 할 일 삭제 실패:", error);
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