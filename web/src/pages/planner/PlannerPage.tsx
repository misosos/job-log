// src/pages/planner/PlannerPage.tsx
import { useMemo } from "react";
import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import { usePlannerPageController } from "../../features/planner/usePlannerPageController";

export function PlannerPage() {
    const {
        newTitle,
        newScope,
        newDdayLabel,
        newApplicationId,
        setNewTitle,
        setNewScope,
        setNewDdayLabel,
        setNewApplicationId,
        todayTasks,
        weekTasks,
        loading,
        saving,
        handleCreate,
        handleToggleTask,
        handleDeleteTask,
        applicationOptions,
    } = usePlannerPageController();

    // ✅ 앱처럼: 연결된 공고는 id가 아니라 라벨(공고명)로 표시
    // applicationOptions는 보통 { value: applicationId, label: 표시명 } 형태
    const applicationLabelById = useMemo(() => {
        const map = new Map<string, string>();

        for (const opt of applicationOptions ?? []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = (opt as any).value as string | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (opt as any).id as string | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const label = (opt as any).label as string | undefined;

            if (!label) continue;
            if (value) map.set(value, label);
            if (id) map.set(id, label);
        }

        return map;
    }, [applicationOptions]);

    const todayTasksWithLabel = useMemo(() => {
        return (todayTasks ?? []).map((t) => ({
            ...t,
            applicationLabel:
                t.applicationId ? applicationLabelById.get(t.applicationId) ?? null : null,
        }));
    }, [todayTasks, applicationLabelById]);

    const weekTasksWithLabel = useMemo(() => {
        return (weekTasks ?? []).map((t) => ({
            ...t,
            applicationLabel:
                t.applicationId ? applicationLabelById.get(t.applicationId) ?? null : null,
        }));
    }, [weekTasks, applicationLabelById]);

    return (
        <div className="space-y-6">
            <PlannerNewTaskForm
                title={newTitle}
                scope={newScope}
                ddayLabel={newDdayLabel}
                applicationId={newApplicationId}
                applicationOptions={applicationOptions}
                saving={saving}
                onTitleChange={setNewTitle}
                onScopeChange={setNewScope}
                onDdayLabelChange={setNewDdayLabel}
                // 🔥 여기만 래핑해서 null 방어
                onApplicationChange={(id) => setNewApplicationId(id ?? "")}
                onSubmit={handleCreate}
            />

            <PlannerTaskSection
                title="오늘 할 일"
                loading={loading}
                tasks={todayTasksWithLabel}
                emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
            />

            <PlannerTaskSection
                title="이번 주 계획"
                loading={loading}
                tasks={weekTasksWithLabel}
                emptyMessage="한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요."
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}