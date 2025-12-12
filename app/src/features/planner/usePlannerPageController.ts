// src/features/planner/usePlannerPageController.ts
import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import type { PlannerScope } from "./types";
import {
    usePlanner,
    type CreatePlannerTaskInput,
} from "./usePlanner";

export function usePlannerPageController() {
    // 📝 폼 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");

    // 🔁 공통 비즈니스 로직 훅 재사용
    const {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
        reload,
    } = usePlanner();

    // ✅ 생성 핸들러 (웹 form onSubmit용)
    const handleCreate = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!newTitle.trim()) return;

            const payload: CreatePlannerTaskInput = {
                title: newTitle,
                scope: newScope,
                ddayLabel: newDdayLabel,
            };

            await createTask(payload);

            // 폼 초기화
            setNewTitle("");
            // scope / ddayLabel은 그대로 두고 싶으면 유지, 아니면 여기서 같이 초기화해도 됨
            // setNewScope("today");
            // setNewDdayLabel("오늘");
        },
        [newTitle, newScope, newDdayLabel, createTask],
    );

    // ✅ 토글 / 삭제 핸들러
    const handleToggleTask = useCallback(
        (id: string) => {
            void toggleTask(id);
        },
        [toggleTask],
    );

    const handleDeleteTask = useCallback(
        (id: string) => {
            void deleteTaskById(id);
        },
        [deleteTaskById],
    );

    return {
        // 폼 상태 + setter
        newTitle,
        newScope,
        newDdayLabel,
        setNewTitle,
        setNewScope,
        setNewDdayLabel,

        // 목록 / 상태
        todayTasks,
        weekTasks,
        loading,
        saving,

        // 액션 핸들러
        handleCreate,
        handleToggleTask,
        handleDeleteTask,

        // 필요하면 대시보드 등에서 다시 쓰라고 reload도 노출
        reload,
    };
}