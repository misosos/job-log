// src/pages/planner/PlannerPage.tsx
import { useMemo } from "react";
import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import { usePlannerPageController } from "../../features/planner/usePlannerPageController";

export function PlannerPage() {
    const {
        newTitle,
        newScope,
        newDeadline, // ✅ 추가
        newApplicationId,
        setNewTitle,
        setNewScope,
        setNewDeadline, // ✅ 추가
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

    // todayTasks/weekTasks는 기존 scope 기반 분리일 수 있어서, 화면에서는 "마감일" 기준으로 다시 분리
    const allTasks = useMemo(
        () => [...(todayTasks ?? []), ...(weekTasks ?? [])],
        [todayTasks, weekTasks],
    );

    const allTasksWithLabel = useMemo(() => {
        return allTasks.map((t) => ({
            ...t,
            applicationLabel: t.applicationId
                ? applicationLabelById.get(t.applicationId) ?? null
                : null,
        }));
    }, [allTasks, applicationLabelById]);

    const { todayBucket, futureBucket } = useMemo(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const startOfTodayMs = start.getTime();

        const parseDeadlineMs = (deadline?: string | null): number | null => {
            if (!deadline) return null;
            const [y, m, d] = deadline.split("-").map((v) => Number(v));
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d).getTime();
        };

        const today: typeof allTasksWithLabel = [];
        const future: typeof allTasksWithLabel = [];

        for (const t of allTasksWithLabel) {
            const dueMs = parseDeadlineMs((t as any).deadline);

            // ✅ deadline이 있으면: 오늘(또는 지남) = 오늘 섹션, 내일 이후 = 앞으로의 계획
            if (dueMs !== null) {
                if (dueMs <= startOfTodayMs) today.push(t);
                else future.push(t);
                continue;
            }

            // ✅ deadline이 없으면: 기존 scope로 fallback
            if (t.scope === "today") today.push(t);
            else future.push(t);
        }

        return { todayBucket: today, futureBucket: future };
    }, [allTasksWithLabel]);

    return (
        <div className="space-y-6">
            <PlannerNewTaskForm
                title={newTitle}
                scope={newScope}
                // ✅ 이제는 D-day 라벨 입력 말고, 마감일만 선택
                deadline={newDeadline}
                onDeadlineChange={setNewDeadline}
                applicationId={newApplicationId}
                applicationOptions={applicationOptions}
                saving={saving}
                onTitleChange={setNewTitle}
                onScopeChange={setNewScope}
                // 🔥 여기만 래핑해서 null 방어
                onApplicationChange={(id) => setNewApplicationId(id ?? "")}
                onSubmit={handleCreate}
            />

            <PlannerTaskSection
                title="오늘 할 일"
                loading={loading}
                tasks={todayBucket}
                emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
            />

            <PlannerTaskSection
                title="앞으로의 계획"
                loading={loading}
                tasks={futureBucket}
                emptyMessage="한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요."
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}