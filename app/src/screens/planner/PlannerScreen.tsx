import React, { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";
import type { PlannerScope } from "../../features/planner/types";
import { usePlanner } from "../../features/planner/usePlanner";

export function PlannerScreen() {
    // 폼 입력용 로컬 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");

    // 비즈니스 로직/데이터는 훅에서 관리
    const {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
    } = usePlanner();

    // RN에서는 이벤트 객체 안 쓰고 콜백만
    const handleAddTask = async (): Promise<void> => {
        await createTask({
            title: newTitle,
            scope: newScope,
            ddayLabel: newDdayLabel,
        });

        // 훅 쪽에서 빈 제목은 무시하니까 여기선 그냥 초기화해도 안전
        setNewTitle("");
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