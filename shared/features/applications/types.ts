// src/features/applications/types.ts
import type { Timestamp } from "firebase/firestore";

/** ...기존 ApplicationStatus, JobApplication, ApplicationRow 유지... */

export type ApplicationStatus =
    | "지원 예정"
    | "서류 제출"
    | "서류 통과"
    | "면접 진행"
    | "최종 합격"
    | "불합격";

export interface JobApplication {
    id: string;
    userId: string;
    company: string;
    position: string;
    status: ApplicationStatus;
    appliedAt: Timestamp | null;
    deadline: Timestamp | null;
    memo?: string;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
}

export type ApplicationRow = {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAtLabel?: string;
    deadline?: Timestamp | null;
};

