// src/features/applications/types.ts
import type { Timestamp } from "firebase/firestore";

/**
 * 지원 상태 공통 타입
 * - UI(뱃지), 폼, Firestore API 모두 이 타입만 사용하도록 통일
 */
export type ApplicationStatus =
  | "지원 예정"
  | "서류 제출"
  | "서류 통과"
  | "면접 진행"
  | "최종 합격"
  | "불합격";

/**
 * Firestore에 저장되는 1건의 지원 내역 도메인 모델
 */
export interface JobApplication {
  id: string;
  userId: string;

  company: string;
  position: string;

  status: ApplicationStatus;

  // 지원일 / 마감일 (serverTimestamp 때문에 null 가능)
  appliedAt: Timestamp | null;
  deadline: Timestamp | null;

  // 대시보드용 메모 필드 (선택)
  memo?: string;

  // Firestore 공통 필드 (처음 로딩 시 null일 수 있음)
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}