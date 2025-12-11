// app/screens/planner/PlannerScreen.tsx (예시 경로)

import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import type { PlannerScope, PlannerTask } from "../../features/planner/types";
import {
    createPlannerTask,
    fetchPlannerTasks,
    togglePlannerTaskDone,
    deletePlannerTask,
} from "../../features/planner/api";

export function PlannerScreen() {
    const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
    const [weekTasks, setWeekTasks] = useState<PlannerTask[]>([]);
    const [loading, setLoading] = useState(true);

    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");
    const [saving, setSaving] = useState(false);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const all = await fetchPlannerTasks();
            setTodayTasks(all.filter((t) => t.scope === "today"));
            setWeekTasks(all.filter((t) => t.scope === "week"));
        } catch (error) {
            console.error("[PlannerScreen] 플래너 태스크 불러오기 실패:", error);
            setTodayTasks([]);
            setWeekTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadTasks();
    }, []);

    // ✅ RN에서는 FormEvent 안 쓰고 그냥 콜백으로 처리
    const handleAddTask = async (): Promise<void> => {
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) return;

        setSaving(true);
        try {
            const newTask = await createPlannerTask({
                title: trimmedTitle,
                ddayLabel: newDdayLabel.trim() || "오늘",
                scope: newScope,
            });

            if (newTask.scope === "today") {
                setTodayTasks((prev) => [newTask, ...prev]);
            } else {
                setWeekTasks((prev) => [newTask, ...prev]);
            }

            setNewTitle("");
        } catch (error) {
            console.error("[PlannerScreen] 할 일 추가 실패:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleTask = async (id: string): Promise<void> => {
        try {
            await togglePlannerTaskDone(id);
            await loadTasks();
        } catch (error) {
            console.error("[PlannerScreen] 할 일 완료 상태 변경 실패:", error);
        }
    };

    const handleDeleteTask = async (id: string): Promise<void> => {
        try {
            await deletePlannerTask(id);
            await loadTasks();
        } catch (error) {
            console.error("[PlannerScreen] 할 일 삭제 실패:", error);
        }
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
                    saving={saving}
                    onTitleChange={setNewTitle}
                    onScopeChange={setNewScope}
                    onDdayLabelChange={setNewDdayLabel}
                    onSubmit={handleAddTask}
                />
            </View>

            <View style={styles.section}>
                <PlannerTaskSection
                    title="오늘 할 일"
                    loading={loading}
                    tasks={todayTasks}
                    emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                />
            </View>

            <View style={styles.section}>
                <PlannerTaskSection
                    title="이번 주 계획"
                    loading={loading}
                    tasks={weekTasks}
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

export default PlannerScreen;