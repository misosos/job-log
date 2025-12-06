import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { auth, db } from "../../libs/firebase";
import type { PlannerScope, PlannerTask } from "./types";

// Firestore에 저장된 문서 타입
type PlannerTaskDoc = {
    title?: string;
    ddayLabel?: string;
    done?: boolean;
    scope?: PlannerScope;
    createdAt?: unknown;
};

// 현재 로그인 유저의 모든 플래너 태스크 불러오기
export async function fetchPlannerTasks(): Promise<PlannerTask[]> {
    const user = auth.currentUser;
    if (!user) {
        console.warn("fetchPlannerTasks: 로그인 필요");
        return [];
    }

    const colRef = collection(db, "users", user.uid, "tasks");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const all: PlannerTask[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as PlannerTaskDoc;
        return {
            id: docSnap.id,
            title: data.title ?? "",
            ddayLabel: data.ddayLabel ?? "",
            done: data.done ?? false,
            scope: data.scope ?? "today",
        };
    });

    return all;
}

// 새 태스크 생성
export type CreatePlannerTaskInput = {
    title: string;
    scope: PlannerScope;
    ddayLabel: string;
};

export async function createPlannerTask(
    input: CreatePlannerTaskInput,
): Promise<PlannerTask> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("로그인이 필요합니다.");
    }

    const colRef = collection(db, "users", user.uid, "tasks");

    const payload = {
        title: input.title,
        ddayLabel: input.ddayLabel,
        done: false,
        scope: input.scope,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(colRef, payload);

    const newTask: PlannerTask = {
        id: docRef.id,
        title: payload.title,
        ddayLabel: payload.ddayLabel,
        done: false,
        scope: input.scope,
    };

    return newTask;
}

// 완료 여부 토글(또는 지정) – Firestore에 반영만 담당
export async function updatePlannerTaskDone(
    taskId: string,
    done: boolean,
): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("로그인이 필요합니다.");
    }

    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, { done });
}