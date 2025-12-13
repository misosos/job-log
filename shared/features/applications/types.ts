// src/features/applications/types.ts
import type { Timestamp } from "firebase/firestore";

/**
 * ✅ 실무형 상태(기존 값 유지 + 확장)
 */
export type ApplicationStatus =
    | "지원 예정"
    | "서류 제출"
    | "서류 통과"
    | "면접 예정"
    | "면접 완료"
    | "최종 합격"
    | "불합격"
    | "지원 철회";

/**
 * ✅ Firestore에 저장되는 지원현황(원본)
 *
 * 취준생 3대 날짜:
 * - docDeadline: 서류 마감일
 * - interviewAt: 면접일
 * - finalResultAt: 최종 발표일
 *
 * ⚠️ 기존 데이터/코드 호환:
 * - deadline: 예전 "마감일" (docDeadline과 동일 의미로 취급)
 * - role: 예전 "직무" 필드 (position과 동일 의미로 취급)
 *
 * ✅ 운영 팁:
 * - "저장(쓰기)"는 position + docDeadline를 우선 사용
 * - "조회(읽기)"는 position/role, docDeadline/deadline 둘 다 받아서 매핑
 */
export interface JobApplication {
    id: string;
    userId: string;

    company: string;

    /** ✅ 권장: position (신규 저장은 이걸로) */
    position?: string;

    /** ⚠️ 레거시 호환: role(예전 저장값) */
    role?: string;

    status: ApplicationStatus;

    /** 지원일 */
    appliedAt?: Timestamp | null;

    /** ✅ 권장: 서류 마감일 */
    docDeadline?: Timestamp | null;

    /** ✅ 면접일(단일) */
    interviewAt?: Timestamp | null;

    /** ✅ 최종 발표일 */
    finalResultAt?: Timestamp | null;

    memo?: string;

    createdAt?: Timestamp | null;
    updatedAt?: Timestamp | null;

    /** ⚠️ 레거시 호환: 예전 마감일(=docDeadline 취급) */
    deadline?: Timestamp | null;
}

/**
 * ✅ 화면용 Row 타입 (UI 렌더링 최적)
 * - 기존 UI는 role을 많이 쓰니까 role은 유지(필수)
 * - position은 점진 전환용(optional)
 * - 3대 날짜 필드 제공 (없으면 undefined/null)
 */
export type ApplicationRow = {
    id: string;
    company: string;

    /** ✅ 기존 UI 호환을 위해 유지 */
    role?: string;

    /** ✅ 권장: 앞으로는 position으로 통일해도 됨(점진 전환) */
    position?: string;

    status: ApplicationStatus;

    /** 표시용 라벨 */
    appliedAtLabel?: string;

    /** ✅ 3대 날짜 */
    docDeadline?: Timestamp | null;
    interviewAt?: Timestamp | null;
    finalResultAt?: Timestamp | null;

    /** ⚠️ 레거시 호환: deadline은 docDeadline로 간주 */
    deadline?: Timestamp | null;
};