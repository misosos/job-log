// src/pages/planner/PlannerPage.tsx
import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import { usePlannerPageController } from "../../features/planner/usePlannerPageController";

export function PlannerPage() {
    const {
        newTitle,
        newScope,
        newDdayLabel,
        setNewTitle,
        setNewScope,
        setNewDdayLabel,
        todayTasks,
        weekTasks,
        loading,
        saving,
        handleCreate,
        handleToggleTask,
        handleDeleteTask,
    } = usePlannerPageController();

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
                onSubmit={handleCreate}
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