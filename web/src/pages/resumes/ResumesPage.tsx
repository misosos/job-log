// src/pages/resumes/ResumesPage.tsx
import { useEffect, useState, type FormEvent } from "react";
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
import { ResumeForm } from "../../components/resumes/ResumeForm";
import {
    ResumeList,
    type ResumeVersion,
} from "../../components/resumes/ResumeList";

type ResumeDoc = {
    title?: string;
    target?: string;
    note?: string;
    updatedAt?: Timestamp | null;
    createdAt?: Timestamp | null;
};

function formatDate(ts?: Timestamp | null): string {
    if (!ts) return "";
    const date = ts.toDate();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
}

export function ResumesPage() {
    const [resumes, setResumes] = useState<ResumeVersion[]>([]);
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isValid = title.trim().length > 0 && target.trim().length > 0;

    const loadResumes = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setResumes([]);
                return;
            }

            const colRef = collection(db, "users", user.uid, "resumes");
            const q = query(colRef, orderBy("updatedAt", "desc"));
            const snap = await getDocs(q);

            const rows: ResumeVersion[] = snap.docs.map((docSnap) => {
                const data = docSnap.data() as ResumeDoc;
                return {
                    id: docSnap.id,
                    title: data.title ?? "",
                    target: data.target ?? "",
                    note: data.note ?? undefined,
                    updatedAt: formatDate(data.updatedAt ?? data.createdAt ?? null),
                };
            });

            setResumes(rows);
        } catch (err) {
            console.error("이력서 버전 불러오기 실패:", err);
            setError("이력서 정보를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadResumes();
    }, []);

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            const user = auth.currentUser;
            if (!user) {
                setError("로그인이 필요합니다.");
                return;
            }

            await addDoc(collection(db, "users", user.uid, "resumes"), {
                title: title.trim(),
                target: target.trim(),
                note: note.trim() ? note.trim() : null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setTitle("");
            setTarget("");
            setNote("");

            await loadResumes();
        } catch (err) {
            console.error("이력서 버전 저장 실패:", err);
            setError("이력서 버전을 저장하는 중 문제가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <SectionCard title="이력서 버전 관리">
                <p className="mb-4 text-sm text-slate-300">
                    회사/직무별로 다른 이력서 버전을 만들어 두고, 공고에 맞게 골라 쓸 수
                    있어요.
                </p>

                <ResumeForm
                    title={title}
                    target={target}
                    note={note}
                    isValid={isValid}
                    onSubmit={handleCreate}
                    onChangeTitle={setTitle}
                    onChangeTarget={setTarget}
                    onChangeNote={setNote}
                />

                {error && (
                    <p className="mb-2 text-xs text-red-400">
                        {error}
                    </p>
                )}

                <ResumeList resumes={resumes} loading={loading} />
            </SectionCard>

            <SectionCard title="자기소개서/문항 관리">
                <p className="text-sm text-slate-300">
                    자주 쓰는 문항/답변을 카드처럼 모아서 관리할 수 있어요.
                    <br />
                    나중에 Firestore 연동해서 실제 문항/답변도 저장해보면 좋아요.
                </p>
            </SectionCard>
        </div>
    );
}