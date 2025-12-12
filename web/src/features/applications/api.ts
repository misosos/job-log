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
} from "firebase/firestore";

import { db, auth } from "../../libs/firebase";
import type { ApplicationStatus, JobApplication } from "./types.ts";

// 로그인 유저 UID 가져오기
function getUserIdOrThrow(): string {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("로그인이 필요합니다.");
    }
    return user.uid;
}

// 유저별 applications 컬렉션 레퍼런스
function applicationsCollection(userId: string) {
    return collection(db, "users", userId, "applications");
}

// Firestore 문서를 JobApplication 형태로 매핑
function mapApplicationDoc(
    snap: QueryDocumentSnapshot | DocumentSnapshot,
): JobApplication {
    const data = snap.data() as Omit<JobApplication, "id">;
    return {
        id: snap.id,
        ...data,
    };
}

// 1) 생성: 지원 내역 추가
export type CreateApplicationInput = {
    company: string;
    position: string;
    status?: ApplicationStatus;
    appliedAt?: Timestamp | null;
    deadline?: Timestamp | null;
    memo?: string;
};

export async function createApplication(
    input: CreateApplicationInput,
): Promise<JobApplication> {
    const userId = getUserIdOrThrow();
    const colRef = applicationsCollection(userId);

    const nowServer = serverTimestamp();

    const docRef = await addDoc(colRef, {
        userId,
        company: input.company,
        position: input.position,
        // 기본 상태를 한국어 레이블로 통일
        status: input.status ?? "지원 예정",
        appliedAt: input.appliedAt ?? null,
        deadline: input.deadline ?? null,
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
    orderByField?: "createdAt" | "appliedAt" | "deadline";
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
        constraints.push(
            orderBy(options.orderByField, options.orderDirection ?? "desc"),
        );
    } else {
        constraints.push(orderBy("createdAt", "desc"));
    }

    if (options.limit) {
        constraints.push(fsLimit(options.limit));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => mapApplicationDoc(docSnap));
}

// 3) 단건 조회
export async function getApplication(
    id: string,
): Promise<JobApplication | null> {
    const userId = getUserIdOrThrow();
    const docRef = doc(db, "users", userId, "applications", id);
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
    deadline?: Timestamp | null;
    memo?: string;
};

export async function updateApplication(
    id: string,
    patch: UpdateApplicationInput,
): Promise<void> {
    const userId = getUserIdOrThrow();
    const docRef = doc(db, "users", userId, "applications", id);

    const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
    };

    if (patch.company !== undefined) payload.company = patch.company;
    if (patch.position !== undefined) payload.position = patch.position;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.appliedAt !== undefined) payload.appliedAt = patch.appliedAt;
    if (patch.deadline !== undefined) payload.deadline = patch.deadline;
    if (patch.memo !== undefined) payload.memo = patch.memo;

    await updateDoc(docRef, payload);
}

// 5) 삭제
export async function deleteApplication(id: string): Promise<void> {
    const userId = getUserIdOrThrow();
    const docRef = doc(db, "users", userId, "applications", id);
    await deleteDoc(docRef);
}