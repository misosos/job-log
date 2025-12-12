import type { Timestamp } from "firebase/firestore";

export type InterviewStatus = "예정" | "완료";

export type InterviewItem = {
    id: string;
    company: string;
    role: string;
    type?: string;
    scheduledAt: Timestamp | null;
    scheduledAtLabel: string;
    note?: string;
    status: InterviewStatus;
};