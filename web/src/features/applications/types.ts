// src/features/applications/types.ts
import type { Timestamp } from "firebase/firestore";

export type ApplicationStatus =
    | "planned"        // 지원 예정
    | "submitted"      // 서류 제출
    | "screening"      // 서류 검토/통과 구간
    | "interview"      // 면접 진행 중
    | "offer"          // 합격/오퍼
    | "rejected";      // 불합격

export interface JobApplication {
    id: string;
    userId: string;

    company: string;
    position: string;

    status: ApplicationStatus;

    // 지원일 / 마감일
    appliedAt?: Timestamp | null;
    deadline?: Timestamp | null;

    // 대시보드용 메모 필드
    memo?: string;

    // Firestore 공통 필드
    createdAt: Timestamp;
    updatedAt: Timestamp;
}