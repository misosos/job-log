import type { Timestamp } from "firebase/firestore";

export type PlannerScope = "today" | "week";

export type PlannerTask = {
    id: string;
    title: string;
    scope: PlannerScope;

    deadline?: string | null;

    ddayLabel?: string;

    done: boolean;
    createdAt?: Timestamp | null;

    applicationId?: string;
};