import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    type QueryDocumentSnapshot,
    type Firestore,
} from "firebase/firestore";
import type { Auth } from "firebase/auth";

import type { PlannerTask, PlannerScope } from "./types";

// 웹/앱 공용으로 쓰기 위해 Firestore, Auth를 외부에서 주입
let injectedDb: Firestore | null = null;
let injectedAuth: Auth | null = null;

export function initPlannerApi(db: Firestore, auth: Auth): void {
    injectedDb = db;
    injectedAuth = auth;
}

function getDbOrThrow(): Firestore {
    if (!injectedDb) {
        throw new Error(
            "Planner API가 초기화되지 않았습니다. initPlannerApi(db, auth)를 먼저 호출하세요.",
        );
    }
    return injectedDb;
}

function getAuthOrThrow(): Auth {
    if (!injectedAuth) {
        throw new Error(
            "Planner API가 초기화되지 않았습니다. initPlannerApi(db, auth)를 먼저 호출하세요.",
        );
    }
    return injectedAuth;
}

// 로그인 유저 UID
function getUserIdOrThrow(): string {
    const auth = getAuthOrThrow();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("로그인이 필요합니다.");
    }
    return user.uid;
}

// 컬렉션 레퍼런스
function plannerTasksCollection(userId: string) {
    const db = getDbOrThrow();
    return collection(db, "users", userId, "tasks");
}

// 문서 → PlannerTask 매핑
function mapPlannerTaskDoc(docSnap: QueryDocumentSnapshot): PlannerTask {
    const data = docSnap.data() as Partial<PlannerTask> & {
        ddayLabel?: string | null;
        deadline?: string | null;
        scope?: PlannerScope;
        done?: boolean;
        applicationId?: string | null;
        // createdAt/updatedAt는 PlannerTask에 있을 수도, 없을 수도 있어서 느슨하게
        createdAt?: PlannerTask["createdAt"];
    };

    return {
        id: docSnap.id,
        title: data.title ?? "",
        scope: data.scope ?? "today",
        done: data.done ?? false,

        // 신규: 마감일
        deadline: data.deadline ?? null,

        // (호환) 기존 ddayLabel은 없으면 빈 문자열로(기존 UI 깨짐 방지)
        ddayLabel: data.ddayLabel ?? "",

        createdAt: data.createdAt ?? null,
        applicationId: data.applicationId ?? undefined,
    };
}

// 전체 태스크 불러오기
export async function fetchPlannerTasks(): Promise<PlannerTask[]> {
    const userId = getUserIdOrThrow();
    const colRef = plannerTasksCollection(userId);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap: QueryDocumentSnapshot) => mapPlannerTaskDoc(docSnap));
}

// 새 태스크 생성
export type CreatePlannerTaskInput = {
    title: string;
    scope: PlannerScope;

    /** 신규 권장: 마감일(YYYY-MM-DD) */
    deadline?: string | null;

    /** (호환용) 기존 방식: D-day 라벨 문자열 */
    ddayLabel?: string;

    applicationId?: string;
};

export async function createPlannerTask(
    input: CreatePlannerTaskInput,
): Promise<PlannerTask> {
    const userId = getUserIdOrThrow();
    const colRef = plannerTasksCollection(userId);
    const now = serverTimestamp();

    const docRef = await addDoc(colRef, {
        userId,
        title: input.title,
        scope: input.scope,
        done: false,
        createdAt: now,
        updatedAt: now,
        applicationId: input.applicationId ?? null,

        // 신규
        deadline: input.deadline ?? null,

        // (호환)
        ddayLabel: input.ddayLabel ?? null,
    });

    return {
        id: docRef.id,
        title: input.title,
        scope: input.scope,
        done: false,
        applicationId: input.applicationId,
        deadline: input.deadline ?? null,
        ddayLabel: input.ddayLabel ?? "",
    };
}

// 완료 여부 토글
export async function togglePlannerTaskDone(id: string): Promise<void> {
    const db = getDbOrThrow();
    const userId = getUserIdOrThrow();
    const taskRef = doc(db, "users", userId, "tasks", id);

    const snap = await getDoc(taskRef);
    if (!snap.exists()) return;

    const data = snap.data() as { done?: boolean };
    const currentDone = data.done ?? false;
    const nextDone = !currentDone;

    await updateDoc(taskRef, {
        done: nextDone,
        updatedAt: serverTimestamp(),
    });
}

// 삭제
export async function deletePlannerTask(id: string): Promise<void> {
    const db = getDbOrThrow();
    const userId = getUserIdOrThrow();
    const taskRef = doc(db, "users", userId, "tasks", id);
    await deleteDoc(taskRef);
}