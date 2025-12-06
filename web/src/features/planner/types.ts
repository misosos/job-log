export type PlannerScope = "today" | "week";

export type PlannerTask = {
    id: string;
    title: string;
    ddayLabel: string; // 예: "D-3", "오늘", "이번 주"
    done: boolean;
    scope: PlannerScope;
};