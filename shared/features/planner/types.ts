import type { Timestamp } from "firebase/firestore";

export type PlannerScope = "today" | "week";

export type PlannerTask = {
    id: string;
    title: string;
    scope: PlannerScope;

    /** ✅ 신규 권장: 마감일(날짜). 웹에서는 YYYY-MM-DD로 저장/사용 */
    deadline?: string | null;

    /** (호환용) 기존 D-day 라벨 직접 저장 방식 */
    ddayLabel?: string;

    done: boolean;
    createdAt?: Timestamp | null;

    applicationId?: string;
};