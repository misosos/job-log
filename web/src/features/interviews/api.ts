import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

import { db } from "../../libs/firebase";
import type { InterviewItem } from "./interviews";

// Firestore 문서 원본 타입
type InterviewDoc = {
    company?: string;
    role?: string;
    type?: string;
    scheduledAt?: Timestamp | null;
    note?: string;
    status?: "예정" | "완료";
    createdAt?: Timestamp | null;
};

// 날짜 포맷 유틸
export function formatInterviewDateTime(ts?: Timestamp | null): string {
    if (!ts) return "";
    const date = ts.toDate();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

// 인터뷰 리스트 가져오기
export async function fetchInterviews(userId: string): Promise<InterviewItem[]> {
    const colRef = collection(db, "users", userId, "interviews");
    const q = query(colRef, orderBy("scheduledAt", "asc"));
    const snap = await getDocs(q);

    const items: InterviewItem[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as InterviewDoc;
        const scheduledAt = data.scheduledAt ?? null;

        return {
            id: docSnap.id,
            company: data.company ?? "",
            role: data.role ?? "",
            type: data.type ?? undefined,
            scheduledAt,
            scheduledAtLabel: formatInterviewDateTime(scheduledAt),
            note: data.note ?? undefined,
            status: data.status ?? "예정",
        };
    });

    return items;
}

// 새 인터뷰 추가할 때 사용할 입력 타입
export type CreateInterviewInput = {
    userId: string;
    company: string;
    role: string;
    date: string;   // YYYY-MM-DD
    time?: string;  // HH:MM
    type: string;
    note?: string;
};

// 인터뷰 생성 API
export async function createInterview(input: CreateInterviewInput): Promise<void> {
    const { userId, company, role, date, time, type, note } = input;

    const [year, month, day] = date.split("-").map((v) => Number(v));
    let hour = 9;
    let minute = 0;

    if (time) {
        const [hStr, mStr] = time.split(":");
        hour = Number(hStr);
        minute = Number(mStr);
    }

    const jsDate = new Date(year, month - 1, day, hour, minute, 0);

    await addDoc(collection(db, "users", userId, "interviews"), {
        company: company.trim(),
        role: role.trim(),
        type: type.trim(),
        scheduledAt: Timestamp.fromDate(jsDate),
        note: note && note.trim() ? note.trim() : null,
        status: "예정",
        createdAt: serverTimestamp(),
    });
}