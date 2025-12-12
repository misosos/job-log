// app/screens/planner/PlannerScreen.tsx

import React, { useMemo, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
// 🔹 기본 Planner 타입은 scope만 쓰면 되니까 PlannerTask 대신 PlannerScope만 import
import type {
    PlannerScope,
    PlannerTask,
} from "../../../../shared/features/planner/types";
import { usePlanner } from "../../features/planner/usePlanner";

import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
// 🔹 앱 전용 확장 타입: applicationLabel 포함된 태스크
import type { PlannerTaskWithLabel } from "../../components/planner/PlannerTaskItem";

export function PlannerScreen() {
    // 폼 입력용 로컬 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");
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

    // 지원 내역 공통 훅 (현재 시그니처: 인자 없음)
    const { applications } = useApplications();

    // 공고 id → "회사 · 직무" 라벨 맵
    const applicationLabelMap = useMemo<Record<string, string>>(() => {
        const map: Record<string, string> = {};

        (applications ?? []).forEach((app: ApplicationRow) => {
            const company = app.company ?? "";
            // 타입에 따라 role / position 둘 다 대응
            const position = (app as any).position ?? app.role ?? "";
            map[app.id] = position ? `${company} · ${position}` : company;
        });

        return map;
    }, [applications]);

    // 셀렉트용 옵션
    const applicationOptions = useMemo(
        () =>
            (applications ?? []).map((app: ApplicationRow) => {
                const position = (app as any).position ?? app.role ?? "";
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

    // Task에 applicationLabel 붙이기 (오늘)
    const todayTasksWithLabel = useMemo<PlannerTaskWithLabel[]>(
        () =>
            todayTasks.map((t: PlannerTask) => {
                const labelFromMap = t.applicationId
                    ? applicationLabelMap[t.applicationId]
                    : undefined;

                return {
                    ...t,
                    // 1순위: 공고 id로 찾은 "회사 · 직무"
                    // 2순위: applicationId 문자열 자체 (폼에서 label을 저장했을 경우 대비)
                    applicationLabel: labelFromMap ?? (t.applicationId || undefined),
                };
            }),
        [todayTasks, applicationLabelMap],
    );

    // Task에 applicationLabel 붙이기 (이번 주)
    const weekTasksWithLabel = useMemo<PlannerTaskWithLabel[]>(
        () =>
            weekTasks.map((t: PlannerTask) => {
                const labelFromMap = t.applicationId
                    ? applicationLabelMap[t.applicationId]
                    : undefined;

                return {
                    ...t,
                    applicationLabel: labelFromMap ?? (t.applicationId || undefined),
                };
            }),
        [weekTasks, applicationLabelMap],
    );

    // RN에서는 이벤트 객체 안 쓰고 콜백만
    const handleAddTask = async (): Promise<void> => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        await createTask({
            title: trimmed,
            scope: newScope,
            ddayLabel: newDdayLabel,
            // 빈 문자열이면 undefined로 저장 → "공고 연결 없음"
            applicationId: newApplicationId || undefined,
        });

        setNewTitle("");
        setNewApplicationId("");
    };

    const handleToggleTask = async (id: string): Promise<void> => {
        await toggleTask(id);
    };

    const handleDeleteTask = async (id: string): Promise<void> => {
        await deleteTaskById(id);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <View style={styles.section}>
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
                    title="이번 주 계획"
                    loading={loading}
                    tasks={weekTasksWithLabel}
                    emptyMessage="한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요."
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
        backgroundColor: "#020617", // slate-900 느낌
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    section: {
        marginBottom: 16,
    },
});