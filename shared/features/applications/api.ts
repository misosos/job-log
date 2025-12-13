// src/features/applications/api.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit as fsLimit,
    serverTimestamp,
    Timestamp,
    updateDoc,
    type DocumentSnapshot,
    type QueryDocumentSnapshot,
    type QueryConstraint,
    type Firestore,
} from "firebase/firestore";
import type { Auth } from "firebase/auth";

import type { ApplicationStatus, JobApplication } from "./types.ts";

// 플랫폼별(firebase 초기화 위치별)로 주입받을 인스턴스
let injectedDb: Firestore | null = null;
let injectedAuth: Auth | null = null;

// ✅ 웹/앱에서 앱 시작 시 한 번만 호출해 주입
export function initApplicationsApi(deps: { db: Firestore; auth: Auth }) {
    injectedDb = deps.db;
    injectedAuth = deps.auth;
}

function getAuthOrThrow(): Auth {
    if (!injectedAuth) {
        throw new Error(
            "Applications API가 초기화되지 않았습니다. initApplicationsApi를 먼저 호출하세요.",
        );
    }
    return injectedAuth;
}

function getDbOrThrow(): Firestore {
    if (!injectedDb) {
        throw new Error(
            "Applications API가 초기화되지 않았습니다. initApplicationsApi를 먼저 호출하세요.",
        );
    }
    return injectedDb;
}

// 로그인 유저 UID 가져오기
function getUserIdOrThrow(): string {
    const auth = getAuthOrThrow();
    const user = auth.currentUser;
    if (!user) throw new Error("로그인이 필요합니다.");
    return user.uid;
}

// 유저별 applications 컬렉션 레퍼런스
function applicationsCollection(userId: string) {
    const db = getDbOrThrow();
    return collection(db, "users", userId, "applications");
}

// Firestore 문서를 JobApplication 형태로 매핑
function mapApplicationDoc(
    snap: QueryDocumentSnapshot | DocumentSnapshot,
): JobApplication {
    // Firestore 문서는 레거시/확장 필드가 섞일 수 있으므로 널널하게 받는다.
    const data = (snap.data() ?? {}) as Record<string, unknown>;

    // ✅ any 없이 처리: 마지막에만 JobApplication으로 캐스팅
    return {
        id: snap.id,
        ...(data as Record<string, unknown>),
    } as JobApplication;
}

/**
 * ✅ 서류마감 동기화 규칙
 * - docDeadline이 들어오면: deadline도 같이 맞춰준다(레거시 화면/쿼리 호환)
 * - deadline만 들어오면: docDeadline도 같이 맞춰준다(점진 마이그레이션)
 */
function resolveDocAndLegacyDeadline(input: {
    docDeadline?: Timestamp | null | undefined;
    deadline?: Timestamp | null | undefined;
}): { docDeadline: Timestamp | null; deadline: Timestamp | null } {
    const docDeadline = input.docDeadline ?? input.deadline ?? null;
    const deadline = input.deadline ?? input.docDeadline ?? null;
    return { docDeadline, deadline };
}

// 1) 생성: 지원 내역 추가
export type CreateApplicationInput = {
    company: string;

    /** ✅ 신규 권장: position */
    position: string;

    /** (옵션) */
    status?: ApplicationStatus;

    /** 지원일 */
    appliedAt?: Timestamp | null;

    /** ✅ 신규 권장: 서류 마감일 */
    docDeadline?: Timestamp | null;

    /** ✅ 면접일 */
    interviewAt?: Timestamp | null;

    /** ✅ 최종 발표일 */
    finalResultAt?: Timestamp | null;

    /** ⚠️ 레거시: 예전 마감일(=서류마감으로 취급) */
    deadline?: Timestamp | null;

    memo?: string;
};

export async function createApplication(
    input: CreateApplicationInput,
): Promise<JobApplication> {
    const userId = getUserIdOrThrow();
    const colRef = applicationsCollection(userId);

    const nowServer = serverTimestamp();

    const { docDeadline, deadline } = resolveDocAndLegacyDeadline({
        docDeadline: input.docDeadline,
        deadline: input.deadline,
    });

    const docRef = await addDoc(colRef, {
        userId,
        company: input.company,
        position: input.position,

        // ✅ 기본값은 유니온에 포함된 "지원 예정" 사용 (캐스팅 X)
        status: input.status ?? "지원 예정",

        appliedAt: input.appliedAt ?? null,

        // ✅ 신규 필드
        docDeadline,
        interviewAt: input.interviewAt ?? null,
        finalResultAt: input.finalResultAt ?? null,

        // ⚠️ 레거시 필드도 같이 유지(=서류마감)
        deadline,

        memo: input.memo ?? "",
        createdAt: nowServer,
        updatedAt: nowServer,
    });

    const snap = await getDoc(docRef);
    return mapApplicationDoc(snap);
}

// 2) 조회: 전체/필터 조회
export type ListApplicationsOptions = {
    status?: ApplicationStatus;
    limit?: number;

    orderByField?:
        | "createdAt"
        | "appliedAt"
        | "docDeadline"
        | "interviewAt"
        | "finalResultAt"
        | "deadline";

    orderDirection?: "asc" | "desc";
};

export async function listApplications(
    options: ListApplicationsOptions = {},
): Promise<JobApplication[]> {
    const userId = getUserIdOrThrow();
    const colRef = applicationsCollection(userId);

    const constraints: QueryConstraint[] = [];

    if (options.status) {
        constraints.push(where("status", "==", options.status));
    }

    if (options.orderByField) {
        constraints.push(orderBy(options.orderByField, options.orderDirection ?? "desc"));
    } else {
        constraints.push(orderBy("createdAt", "desc"));
    }

    if (options.limit) {
        constraints.push(fsLimit(options.limit));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    return snap.docs.map((docSnap: QueryDocumentSnapshot) => mapApplicationDoc(docSnap));
}

// 3) 단건 조회
export async function getApplication(id: string): Promise<JobApplication | null> {
    const userId = getUserIdOrThrow();
    const docRef = doc(getDbOrThrow(), "users", userId, "applications", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;
    return mapApplicationDoc(snap);
}

// 4) 수정
export type UpdateApplicationInput = {
    company?: string;
    position?: string;
    status?: ApplicationStatus;
    appliedAt?: Timestamp | null;

    /** ✅ 신규 권장: 서류 마감일 */
    docDeadline?: Timestamp | null;

    /** ✅ 면접일 */
    interviewAt?: Timestamp | null;

    /** ✅ 최종 발표일 */
    finalResultAt?: Timestamp | null;

    /** ⚠️ 레거시: 예전 마감일(=서류마감) */
    deadline?: Timestamp | null;

    memo?: string;
};

export async function updateApplication(
    id: string,
    patch: UpdateApplicationInput,
): Promise<void> {
    const userId = getUserIdOrThrow();
    const docRef = doc(getDbOrThrow(), "users", userId, "applications", id);

    const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
    };

    if (patch.company !== undefined) payload.company = patch.company;
    if (patch.position !== undefined) payload.position = patch.position;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.appliedAt !== undefined) payload.appliedAt = patch.appliedAt;
    if (patch.memo !== undefined) payload.memo = patch.memo;

    // ✅ 3대 날짜 업데이트
    if (patch.interviewAt !== undefined) payload.interviewAt = patch.interviewAt;
    if (patch.finalResultAt !== undefined) payload.finalResultAt = patch.finalResultAt;

    // ✅ 서류마감은 docDeadline/deadline 동기화
    const touchedDocDeadline = patch.docDeadline !== undefined;
    const touchedLegacyDeadline = patch.deadline !== undefined;

    if (touchedDocDeadline || touchedLegacyDeadline) {
        const { docDeadline, deadline } = resolveDocAndLegacyDeadline({
            docDeadline: touchedDocDeadline ? patch.docDeadline ?? null : undefined,
            deadline: touchedLegacyDeadline ? patch.deadline ?? null : undefined,
        });

        payload.docDeadline = docDeadline;
        payload.deadline = deadline;
    }

    await updateDoc(docRef, payload);
}

// 5) 삭제
export async function deleteApplication(id: string): Promise<void> {
    const userId = getUserIdOrThrow();
    const docRef = doc(getDbOrThrow(), "users", userId, "applications", id);
    await deleteDoc(docRef);
}