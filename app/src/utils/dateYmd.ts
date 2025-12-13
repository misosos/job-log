// app/src/utils/dateYmd.ts
import type { PlannerScope } from "../../../shared/features/planner/types";

export function dateToYmd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function ymdToDate(ymd?: string | null): Date {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return new Date();
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
}

export function inferScopeFromDeadline(deadline: string): PlannerScope {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return "today";
    const [y, m, d] = deadline.split("-").map(Number);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();
    return due <= startOfToday ? "today" : "week";
}