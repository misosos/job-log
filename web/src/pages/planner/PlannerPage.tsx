// src/pages/planner/PlannerPage.tsx
import { useState, type FormEvent } from "react";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import type { PlannerScope } from "../../features/planner/types";
import { usePlannerController } from "../../features/planner/usePlannerController";

export function PlannerPage() {
    const {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
    } = usePlannerController();

    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");

    const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newTitle.trim()) return;

        await createTask({
            title: newTitle,
            scope: newScope,
            ddayLabel: newDdayLabel,
        });

        setNewTitle("");
    };

    const handleToggleTask = (id: string) => {
        void toggleTask(id);
    };

    const handleDeleteTask = (id: string) => {
        void deleteTaskById(id);
    };

    return (
        <div className="space-y-6">
            <PlannerNewTaskForm
                title={newTitle}
                scope={newScope}
                ddayLabel={newDdayLabel}
                saving={saving}
                onTitleChange={setNewTitle}
                onScopeChange={setNewScope}
                onDdayLabelChange={setNewDdayLabel}
                onSubmit={handleAddTask}
            />

            <PlannerTaskSection
                title="오늘 할 일"
                loading={loading}
                tasks={todayTasks}
                emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
            />

            <PlannerTaskSection
                title="이번 주 계획"
                loading={loading}
                tasks={weekTasks}
                emptyMessage="한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요."
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}