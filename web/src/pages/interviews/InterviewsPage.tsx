// src/pages/interviews/InterviewsPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { Button, Label, TextInput, Textarea } from "flowbite-react";
import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

import { SectionCard } from "../../components/common/SectionCard";
import { auth, db } from "../../libs/firebase";
import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import type { InterviewItem } from "../../features/interviews/interviews";

type InterviewDoc = {
    company?: string;
    role?: string;
    type?: string;
    scheduledAt?: Timestamp | null;
    note?: string;
    status?: "예정" | "완료";
    createdAt?: Timestamp | null;
};

function formatDateTime(ts?: Timestamp | null): string {
    if (!ts) return "";
    const date = ts.toDate();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function splitUpcomingAndPast(items: InterviewItem[]) {
    const now = new Date();
    const upcoming: InterviewItem[] = [];
    const past: InterviewItem[] = [];

    items.forEach((item) => {
        const target = item.scheduledAt ? item.scheduledAt.toDate() : null;

        if (target && target >= now) {
            upcoming.push(item);
        } else {
            past.push(item);
        }
    });

    return {
        upcoming,
        past,
    };
}

export function InterviewsPage() {
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 새 면접 추가용 폼 상태
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [date, setDate] = useState(""); // YYYY-MM-DD
    const [time, setTime] = useState(""); // HH:MM
    const [type, setType] = useState("온라인");
    const [note, setNote] = useState("");

    const [saving, setSaving] = useState(false);

    const loadInterviews = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setInterviews([]);
                return;
            }

            const colRef = collection(db, "users", user.uid, "interviews");
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
                    scheduledAtLabel: formatDateTime(scheduledAt),
                    note: data.note ?? undefined,
                    status: data.status ?? "예정",
                };
            });

            setInterviews(items);
        } catch (err) {
            console.error("면접 기록 불러오기 실패:", err);
            setError("면접 기록을 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadInterviews();
    }, []);

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!company.trim() || !role.trim() || !date) {
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setError("로그인이 필요합니다.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const [year, month, day] = date.split("-").map((v) => Number(v));
            let hour = 9;
            let minute = 0;

            if (time) {
                const [hStr, mStr] = time.split(":");
                hour = Number(hStr);
                minute = Number(mStr);
            }

            const jsDate = new Date(year, month - 1, day, hour, minute, 0);

            await addDoc(collection(db, "users", user.uid, "interviews"), {
                company: company.trim(),
                role: role.trim(),
                type: type.trim(),
                scheduledAt: Timestamp.fromDate(jsDate),
                note: note.trim() ? note.trim() : null,
                status: "예정",
                createdAt: serverTimestamp(),
            });

            setCompany("");
            setRole("");
            setDate("");
            setTime("");
            setType("온라인");
            setNote("");

            await loadInterviews();
        } catch (err) {
            console.error("면접 기록 저장 실패:", err);
            setError("면접을 저장하는 중 문제가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const { upcoming, past } = splitUpcomingAndPast(interviews);

    return (
        <div className="space-y-6">
            <SectionCard title="새 면접 기록 추가">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <Label htmlFor="company" className="text-xs text-slate-200">
                                회사명
                            </Label>
                            <TextInput
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="예: IBK기업은행, 카카오페이 등"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="role" className="text-xs text-slate-200">
                                직무 / 포지션
                            </Label>
                            <TextInput
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="예: 디지털 인턴, 데이터 분석 인턴 등"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                            <Label htmlFor="date" className="text-xs text-slate-200">
                                면접 일자
                            </Label>
                            <TextInput
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="time" className="text-xs text-slate-200">
                                면접 시간
                            </Label>
                            <TextInput
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="type" className="text-xs text-slate-200">
                                형태
                            </Label>
                            <TextInput
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                placeholder="예: 온라인, 오프라인, 화상 등"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="note" className="text-xs text-slate-200">
                            메모 / 예상 질문 &amp; 회고
                        </Label>
                        <Textarea
                            id="note"
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="예상 질문, 준비할 내용, 면접 이후 느낀 점 등을 자유롭게 적어두면 좋아요."
                        />
                    </div>

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    <div className="flex justify-end">
                        <Button type="submit" color="purple" disabled={saving}>
                            {saving ? "저장 중..." : "면접 기록 저장"}
                        </Button>
                    </div>
                </form>
            </SectionCard>

            <UpcomingInterviewsSection items={upcoming} loading={loading} />
            <InterviewReviewSection items={past} loading={loading} />
        </div>
    );
}