// src/pages/planner/PlannerPage.tsx
import { useMemo, useState, useCallback, type ReactNode } from "react";
import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import { usePlannerPageController } from "../../features/planner/usePlannerPageController";
import { SectionCard } from "../../components/common/SectionCard";

function Modal({
                   open,
                   title,
                   onClose,
                   children,
               }: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-900/20 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl rounded-2xl border border-rose-200 bg-rose-50 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-rose-200 px-5 py-4">
                    <h2 className="text-sm font-semibold text-rose-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-5 py-5">{children}</div>
            </div>
        </div>
    );
}

export function PlannerPage() {
    const {
        newTitle,
        newScope,
        newDeadline,
        newApplicationId,
        setNewTitle,
        setNewScope,
        setNewDeadline,
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

    const [createOpen, setCreateOpen] = useState(false);

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dueMs = parseDeadlineMs((t as any).deadline);

            if (dueMs !== null) {
                if (dueMs <= startOfTodayMs) today.push(t);
                else future.push(t);
                continue;
            }

            if (t.scope === "today") today.push(t);
            else future.push(t);
        }

        return { todayBucket: today, futureBucket: future };
    }, [allTasksWithLabel]);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleCreateFromModal = useCallback(async () => {
        await handleCreate(); // 컨트롤러가 내부에서 폼 초기화한다는 전제
        setCreateOpen(false);
    }, [handleCreate]);

    return (
        <div className="space-y-6">
            {/* 상단 액션바 */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-rose-900">플래너</h1>
                    <p className="text-sm text-rose-700">
                        오늘/앞으로 할 일을 마감일 기준으로 정리해요.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-rose-50 hover:bg-rose-400 disabled:opacity-60"
                    disabled={saving}
                >
                    + 할 일 추가
                </button>
            </div>

            {/* ✅ 추가 폼: 모달로 이동 */}
            <Modal open={createOpen} title="새 할 일 추가" onClose={closeCreate}>
                <SectionCard>
                    <PlannerNewTaskForm
                        title={newTitle}
                        scope={newScope}
                        deadline={newDeadline}
                        onDeadlineChange={setNewDeadline}
                        applicationId={newApplicationId}
                        applicationOptions={applicationOptions}
                        saving={saving}
                        onTitleChange={setNewTitle}
                        onScopeChange={setNewScope}
                        onApplicationChange={(id) => setNewApplicationId(id ?? "")}
                        onSubmit={handleCreateFromModal}
                    />
                </SectionCard>
            </Modal>

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