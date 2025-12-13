// src/features/planner/usePlannerPageController.ts
import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";

import type { PlannerScope } from "../../../../shared/features/planner/types";
import { usePlanner } from "./usePlanner";

// 지원 공고 재사용
import { useApplications } from "../applications/useApplications";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
import type { CreatePlannerTaskInput } from "./usePlanner";

// PlannerNewTaskForm에서 사용할 옵션 타입 (웹/앱 호환)
export type PlannerApplicationOption = {
    /** 권장: value */
    value?: string;
    /** 호환: id */
    id?: string;
    label: string;
};

export function usePlannerPageController() {
    // ✅ 폼 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");

    /** ✅ 신규: 마감일(YYYY-MM-DD). date picker로 받고, ddayLabel은 자동 계산 */
    const [newDeadline, setNewDeadline] = useState<string | null>(null);

    /** 공고 선택: "" = 선택 안 함 */
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

    const applicationOptions: PlannerApplicationOption[] = useMemo(() => {
        return (applications ?? []).map((app: ApplicationRow) => ({
            value: app.id,
            id: app.id,
            label: app.role ? `${app.company} · ${app.role}` : app.company,
        }));
    }, [applications]);

    // ✅ 생성 핸들러 (폼 submit)
    const handleCreate = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const trimmedTitle = newTitle.trim();
            if (!trimmedTitle) return;

            const payload: CreatePlannerTaskInput = {
                title: trimmedTitle,
                scope: newScope,

                // ✅ 신규: 마감일(없으면 null)
                deadline: newDeadline ?? null,

                // ✅ ddayLabel은 이제 "수동 입력 제거" → 보내지 않는다
                // (usePlanner/createTask에서 deadline 기반으로 자동 계산 or 기본값 처리)

                // ✅ 공고 연결 없으면 undefined로
                applicationId: newApplicationId ? newApplicationId : undefined,
            };

            await createTask(payload);

            // 폼 초기화
            setNewTitle("");
            setNewScope("today");
            setNewDeadline(null);
            setNewApplicationId("");
        },
        [newTitle, newScope, newDeadline, newApplicationId, createTask],
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

        /** ✅ 신규 */
        newDeadline,
        setNewDeadline,

        newApplicationId,
        setNewTitle,
        setNewScope,
        setNewApplicationId,

        // 목록/상태
        todayTasks,
        weekTasks,
        loading,
        saving,

        // 액션 핸들러
        handleCreate,
        handleToggleTask,
        handleDeleteTask,

        // 지원 공고 셀렉트 옵션
        applicationOptions,
    };
}