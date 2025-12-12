// src/features/planner/usePlannerPageController.ts
import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";

import type { PlannerScope } from "./types";
import { usePlanner} from "./usePlanner";

// 지원 공고 재사용
import { useApplications } from "../applications/useApplications";
import type { ApplicationRow } from "../applications/types";
import type { CreatePlannerTaskInput } from "./usePlanner"; // 이미 export 되어 있다면 사용

// PlannerNewTaskForm에서 사용할 옵션 타입
export type PlannerApplicationOption = {
    id: string;
    label: string;
};

export function usePlannerPageController() {
    // ✅ 폼 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDdayLabel, setNewDdayLabel] = useState("오늘");
    // 🔥 새로 추가: 연결할 공고 ID
    const [newApplicationId, setNewApplicationId] = useState<string>("");

    // ✅ 플래너 비즈니스 로직 훅 (API 연동)
    const {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
    } = usePlanner();

    // ✅ 지원 공고 훅 재사용해서 셀렉트 옵션 만들기
    const { applications } = useApplications();

    const applicationOptions: PlannerApplicationOption[] = useMemo(
        () =>
            applications.map((app: ApplicationRow) => ({
                id: app.id,
                label: app.role ? `${app.company} · ${app.role}` : app.company,
            })),
        [applications],
    );

    // ✅ 생성 핸들러 (폼 submit)
    const handleCreate = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const trimmedTitle = newTitle.trim();
            if (!trimmedTitle) return;

            const payload: CreatePlannerTaskInput = {
                title: trimmedTitle,
                scope: newScope,
                ddayLabel: newDdayLabel,
                // 🔥 선택한 공고가 있으면 함께 저장
                applicationId: newApplicationId || undefined,
            };

            await createTask(payload);

            // 폼 초기화
            setNewTitle("");
            setNewScope("today");
            setNewDdayLabel("오늘");
            setNewApplicationId("");
        },
        [newTitle, newScope, newDdayLabel, newApplicationId, createTask],
    );

    // ✅ 토글 / 삭제 핸들러 래핑
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
        newApplicationId,          // 🔥 추가
        setNewTitle,
        setNewScope,
        setNewDdayLabel,
        setNewApplicationId,       // 🔥 추가

        // 목록/상태
        todayTasks,
        weekTasks,
        loading,
        saving,

        // 액션 핸들러
        handleCreate,
        handleToggleTask,
        handleDeleteTask,

        // 🔥 지원 공고 셀렉트 옵션
        applicationOptions,        // 🔥 추가
    };
}