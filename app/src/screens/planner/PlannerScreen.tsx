// app/screens/planner/PlannerScreen.tsx

import React, { useMemo, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";

import type { PlannerScope, PlannerTask } from "../../../../shared/features/planner/types";
import { usePlanner } from "../../features/planner/usePlanner";

import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
import type { PlannerTaskWithLabel } from "../../components/planner/PlannerTaskItem";

// ✅ deadline 파싱 (YYYY-MM-DD -> ms)
function parseDeadlineMs(deadline?: string | null): number | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d).getTime();
}

// ✅ 오늘 00:00(ms)
function getStartOfTodayMs(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

type PlannerTaskMaybeDeadline = PlannerTask & { deadline?: string | null };
type ApplicationRowMaybePosition = ApplicationRow & { position?: string };

export function PlannerScreen() {
    // 폼 입력용 로컬 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");

    // ✅ 신규: 마감일(YYYY-MM-DD). null이면 마감일 없음
    const [newDeadline, setNewDeadline] = useState<string | null>(null);

    // 공고 선택: "" = 선택 안 함
    const [newApplicationId, setNewApplicationId] = useState<string>("");

    // 플래너 비즈니스 로직
    const {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
    } = usePlanner();

    // 지원 내역 공통 훅
    const { applications } = useApplications();

    // 공고 id → "회사 · 직무" 라벨 맵
    const applicationLabelMap = useMemo<Record<string, string>>(() => {
        const map: Record<string, string> = {};

        (applications ?? []).forEach((raw) => {
            const app = raw as ApplicationRowMaybePosition;
            const company = app.company ?? "";
            const position = app.position ?? app.role ?? "";
            map[app.id] = position ? `${company} · ${position}` : company;
        });

        return map;
    }, [applications]);

    // 셀렉트용 옵션
    const applicationOptions = useMemo(
        () =>
            (applications ?? []).map((raw) => {
                const app = raw as ApplicationRowMaybePosition;
                const position = app.position ?? app.role ?? "";
                return {
                    value: app.id,
                    label:
                        applicationLabelMap[app.id] ??
                        (position ? `${app.company} · ${position}` : app.company) ??
                        "",
                };
            }),
        [applications, applicationLabelMap],
    );

    /**
     * ✅ 화면 표시용 버킷 재분류
     * - deadline이 있으면: 미래(>오늘 00:00)면 앞으로의 계획, 아니면 오늘 할 일
     * - deadline이 없으면: 기존 scope로 판단 (week=앞으로, today=오늘)
     */
    const { todayTasksWithLabel, futureTasksWithLabel } = useMemo(() => {
        const all: PlannerTaskMaybeDeadline[] = [
            ...(todayTasks ?? []),
            ...(weekTasks ?? []),
        ] as PlannerTaskMaybeDeadline[];

        const startOfTodayMs = getStartOfTodayMs();

        const todayBucket: PlannerTaskWithLabel[] = [];
        const futureBucket: PlannerTaskWithLabel[] = [];

        for (const t of all) {
            const deadline = t.deadline ?? null;
            const dueMs = parseDeadlineMs(deadline);

            const applicationLabel = t.applicationId
                ? applicationLabelMap[t.applicationId] ?? null
                : null;

            const withLabel: PlannerTaskWithLabel = {
                ...(t as PlannerTask),
                // ✅ 혹시 타입에 deadline이 아직 없더라도 화면에선 유지
                ...(deadline !== null ? { deadline } : { deadline: null }),
                applicationLabel,
            } as PlannerTaskWithLabel;

            if (dueMs !== null) {
                // deadline이 있으면 deadline 기준
                if (dueMs > startOfTodayMs) futureBucket.push(withLabel);
                else todayBucket.push(withLabel);
            } else {
                // deadline이 없으면 scope 기준
                if (t.scope === "week") futureBucket.push(withLabel);
                else todayBucket.push(withLabel);
            }
        }

        return {
            todayTasksWithLabel: todayBucket,
            futureTasksWithLabel: futureBucket,
        };
    }, [todayTasks, weekTasks, applicationLabelMap]);

    // 추가
    const handleAddTask = async (): Promise<void> => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        await createTask({
            title: trimmed,
            scope: newScope,
            deadline: newDeadline,
            applicationId: newApplicationId || undefined,
        });

        setNewTitle("");
        setNewScope("today");
        setNewDeadline(null);
        setNewApplicationId("");
    };

    const handleToggleTask = async (id: string): Promise<void> => {
        await toggleTask(id);
    };

    const handleDeleteTask = async (id: string): Promise<void> => {
        await deleteTaskById(id);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.section}>
                <PlannerNewTaskForm
                    title={newTitle}
                    scope={newScope}
                    deadline={newDeadline}
                    applicationId={newApplicationId}
                    applicationOptions={applicationOptions}
                    saving={saving}
                    onTitleChange={setNewTitle}
                    onScopeChange={setNewScope}
                    onDeadlineChange={setNewDeadline}
                    onApplicationChange={setNewApplicationId}
                    onSubmit={handleAddTask}
                />
            </View>

            <View style={styles.section}>
                <PlannerTaskSection
                    title="오늘 할 일"
                    loading={loading}
                    tasks={todayTasksWithLabel}
                    emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                />
            </View>

            <View style={styles.section}>
                <PlannerTaskSection
                    title="앞으로의 계획"
                    loading={loading}
                    tasks={futureTasksWithLabel}
                    emptyMessage="앞으로 할 공부/지원 계획을 여기에 정리할 수 있어요."
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    section: {
        marginBottom: 16,
    },
});