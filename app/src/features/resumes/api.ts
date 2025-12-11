import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    writeBatch,
} from "firebase/firestore";

import { db } from "../../libs/firebase";
import type { ResumeVersion } from "./types";

// Firestore 문서 타입
type ResumeDoc = {
    title?: string;
    target?: string;
    note?: string;
    link?: string | null;
    updatedAt?: Timestamp | null;
    createdAt?: Timestamp | null;
    isDefault?: boolean | null;
};

function formatDate(ts?: Timestamp | null): string {
    if (!ts) return "";
    const date = ts.toDate();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
}

// 이력서 리스트 불러오기
export async function fetchResumes(userId: string): Promise<ResumeVersion[]> {
    const colRef = collection(db, "users", userId, "resumes");
    const q = query(colRef, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
        const data = docSnap.data() as ResumeDoc;
        return {
            id: docSnap.id,
            title: data.title ?? "",
            target: data.target ?? "",
            note: data.note ?? undefined,
            link: data.link ?? undefined,
            updatedAt: formatDate(data.updatedAt ?? data.createdAt ?? null),
            isDefault: data.isDefault ?? false,
        };
    });
}

// 새 이력서 생성용 payload 타입
export type CreateResumePayload = {
    title: string;
    target: string;
    note?: string;
    link?: string;
};

// 새 이력서 버전 추가
export async function createResume(
    userId: string,
    payload: CreateResumePayload,
): Promise<void> {
    const colRef = collection(db, "users", userId, "resumes");

    await addDoc(colRef, {
        title: payload.title,
        target: payload.target,
        note: payload.note ?? null,
        link: payload.link ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDefault: false,
    });
}

// 기본 이력서 설정
export async function setDefaultResume(
    userId: string,
    resumeId: string,
): Promise<void> {
    const colRef = collection(db, "users", userId, "resumes");
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);

    snap.docs.forEach((docSnap) => {
        const isTarget = docSnap.id === resumeId;
        batch.update(docSnap.ref, {
            isDefault: isTarget,
            updatedAt: serverTimestamp(),
        });
    });

    await batch.commit();
}