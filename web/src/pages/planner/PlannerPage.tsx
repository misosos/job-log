import {
    useCallback,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import { usePlannerPageController } from "../../features/planner/usePlannerPageController";

// -----------------------------
// helpers
// -----------------------------
type RelatedApplicationOption = {
    value?: string;
    id?: string;
    label: string;
};

function ymdToMs(ymd?: string | null): number | null {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d).getTime();
}

function buildLabelMap(options?: RelatedApplicationOption[] | null) {
    const map = new Map<string, string>();
    for (const opt of options ?? []) {
        if (!opt?.label) continue;
        if (opt.value) map.set(opt.value, opt.label);
        if (opt.id) map.set(opt.id, opt.label);
    }
    return map;
}

// -----------------------------
// Modal
// -----------------------------
type ModalProps = {
    open: boolean;
    title: string;
    disabledClose?: boolean;
    onClose: () => void;
    children: ReactNode;
};

function Modal({
                   open,
                   title,
                   disabledClose = false,
                   onClose,
                   children,
               }: ModalProps) {
    if (!open) return null;

    const closeIfAllowed = () => {
        if (disabledClose) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-rose-900/20 backdrop-blur-sm"
                onClick={closeIfAllowed}
                aria-label="닫기"
                disabled={disabledClose}
            />

            {/* panel */}
            <div
                className="relative w-full max-w-xl rounded-2xl border border-rose-200 bg-rose-50 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="flex items-center justify-between border-b border-rose-200 px-5 py-4">
                    <h2 className="text-sm font-semibold text-rose-900">{title}</h2>
                    <button
                        type="button"
                        onClick={closeIfAllowed}
                        disabled={disabledClose}
                        className="rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
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

// -----------------------------
// Page
// -----------------------------
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

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => {
        if (saving) return; // 저장 중 닫힘 방지
        setCreateOpen(false);
    }, [saving]);

    const labelMap = useMemo(
        () => buildLabelMap(applicationOptions as RelatedApplicationOption[] | undefined),
        [applicationOptions],
    );

    const { todayBucket, futureBucket } = useMemo(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTodayMs = startOfToday.getTime();

        const all = [...(todayTasks ?? []), ...(weekTasks ?? [])].map((t) => ({
            ...t,
            applicationLabel: t.applicationId ? labelMap.get(t.applicationId) ?? null : null,
        }));

        const today: typeof all = [];
        const future: typeof all = [];

        for (const t of all) {
            const dueMs = ymdToMs((t as { deadline?: string | null }).deadline ?? null);

            if (dueMs !== null) {
                (dueMs <= startOfTodayMs ? today : future).push(t);
                continue;
            }

            (t.scope === "today" ? today : future).push(t);
        }

        return { todayBucket: today, futureBucket: future };
    }, [todayTasks, weekTasks, labelMap]);

    const handleCreateFromModal = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (saving) return;

            try {
                // 컨트롤러가 내부 state 기반으로 생성한다는 전제
                await handleCreate();
                setCreateOpen(false);
            } catch {
                // 실패 시 모달 유지
            }
        },
        [handleCreate, saving],
    );

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

            {/* Create Modal */}
            <Modal
                open={createOpen}
                title="새 할 일 추가"
                onClose={closeCreate}
                disabledClose={saving}
            >
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
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
                </div>
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