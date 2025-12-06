import { useEffect, useState, type FormEvent } from "react";

import type { PlannerScope, PlannerTask } from "../../features/planner/types";
import {
    createPlannerTask,
    fetchPlannerTasks,
    updatePlannerTaskDone,
} from "../../features/planner/api";
import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";

export function PlannerPage() {
    const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
    const [weekTasks, setWeekTasks] = useState<PlannerTask[]>([]);
    const [loading, setLoading] = useState(true);

    // 새 할 일 추가용 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");
    const [saving, setSaving] = useState(false);

    //  Firestore에서 할 일 불러오기 (API 사용)
    const loadTasks = async () => {
        setLoading(true);
        try {
            const all = await fetchPlannerTasks();

            setTodayTasks(all.filter((t) => t.scope === "today"));
            setWeekTasks(all.filter((t) => t.scope === "week"));
        } catch (error) {
            console.error("플래너 태스크 불러오기 실패:", error);
            setTodayTasks([]);
            setWeekTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadTasks();
    }, []);

    //  새 할 일 추가 → API + 로컬 상태 반영
    const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) return;

        const ddayLabel = newDdayLabel.trim() || "오늘";

        setSaving(true);
        try {
            const newTask = await createPlannerTask({
                title: trimmedTitle,
                scope: newScope,
                ddayLabel,
            });

            if (newTask.scope === "today") {
                setTodayTasks((prev) => [newTask, ...prev]);
            } else {
                setWeekTasks((prev) => [newTask, ...prev]);
            }

            setNewTitle("");
            // scope / ddayLabel은 유지
        } catch (error) {
            console.error("할 일 추가 실패:", error);
        } finally {
            setSaving(false);
        }
    };

    //  완료 토글 → 로컬 상태 업데이트 + API 호출
    const toggleTask =
        (group: PlannerScope) =>
            async (id: string): Promise<void> => {
                let newDone: boolean | undefined;

                if (group === "today") {
                    setTodayTasks((prev) =>
                        prev.map((task) => {
                            if (task.id === id) {
                                const updated = { ...task, done: !task.done };
                                newDone = updated.done;
                                return updated;
                            }
                            return task;
                        }),
                    );
                } else {
                    setWeekTasks((prev) =>
                        prev.map((task) => {
                            if (task.id === id) {
                                const updated = { ...task, done: !task.done };
                                newDone = updated.done;
                                return updated;
                            }
                            return task;
                        }),
                    );
                }

                if (typeof newDone === "undefined") return;

                try {
                    await updatePlannerTaskDone(id, newDone);
                } catch (error) {
                    console.error("할 일 완료 상태 변경 실패:", error);
                }
            };

    return (
        <div className="space-y-6">
            <PlannerNewTaskForm
                title={newTitle}
                scope={newScope}
                ddayLabel={newDdayLabel}
                saving={saving}
                onTitleChange={setNewTitle}
                onScopeChange={(value) => setNewScope(value)}
                onDdayLabelChange={setNewDdayLabel}
                onSubmit={handleAddTask}
            />

            <PlannerTaskSection
                title="오늘 할 일"
                loading={loading}
                tasks={todayTasks}
                emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                onToggle={(id) => {
                    void toggleTask("today")(id);
                }}
            />

            <PlannerTaskSection
                title="이번 주 계획"
                loading={loading}
                tasks={weekTasks}
                emptyMessage="한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요."
                onToggle={(id) => {
                    void toggleTask("week")(id);
                }}
            />
        </div>
    );
}