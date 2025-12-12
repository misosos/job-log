import type { Timestamp } from "firebase/firestore";

export type PlannerScope = "today" | "week";

export type PlannerTask = {
    id: string;
    title: string;
    ddayLabel: string;
    done: boolean;
    scope: PlannerScope;
    applicationId?: string;
    createdAt?: Timestamp | null;
};