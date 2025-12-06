import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    type QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../libs/firebase";
import type { PlannerTask, PlannerScope } from "./types";

// 로그인 유저 UID
function getUserIdOrThrow(): string {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("로그인이 필요합니다.");
    }
    return user.uid;
}

// 컬렉션 레퍼런스
function plannerTasksCollection(userId: string) {
    return collection(db, "users", userId, "tasks");
}

// 문서 → PlannerTask 매핑
function mapPlannerTaskDoc(docSnap: QueryDocumentSnapshot): PlannerTask {
    const data = docSnap.data() as Partial<PlannerTask> & {
        ddayLabel?: string;
        scope?: PlannerScope;
        done?: boolean;
    };

    return {
        id: docSnap.id,
        title: data.title ?? "",
        ddayLabel: data.ddayLabel ?? "",
        done: data.done ?? false,
        scope: data.scope ?? "today",
    };
}

// 전체 태스크 불러오기
export async function fetchPlannerTasks(): Promise<PlannerTask[]> {
    const userId = getUserIdOrThrow();
    const colRef = plannerTasksCollection(userId);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => mapPlannerTaskDoc(docSnap));
}

// 새 태스크 생성
export type CreatePlannerTaskInput = {
    title: string;
    ddayLabel: string;
    scope: PlannerScope;
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
        ddayLabel: input.ddayLabel,
        scope: input.scope,
        done: false,
        createdAt: now,
        updatedAt: now,
    });

    return {
        id: docRef.id,
        title: input.title,
        ddayLabel: input.ddayLabel,
        done: false,
        scope: input.scope,
    };
}

// 완료 여부 토글
export async function togglePlannerTaskDone(id: string): Promise<void> {
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