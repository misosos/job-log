import { useEffect, useState, type FormEvent } from "react";
import {
    collection,
    addDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    writeBatch,
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

export function ResumesPage() {
    const [resumes, setResumes] = useState<ResumeVersion[]>([]);
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");
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
                    link: data.link ?? undefined,
                    updatedAt: formatDate(data.updatedAt ?? data.createdAt ?? null),
                    isDefault: data.isDefault ?? false,
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
                link: link.trim() ? link.trim() : null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isDefault: false,
            });

            setTitle("");
            setTarget("");
            setNote("");
            setLink("");

            await loadResumes();
        } catch (err) {
            console.error("이력서 버전 저장 실패:", err);
            setError("이력서 버전을 저장하는 중 문제가 발생했습니다.");
        }
    };

    const handleSetDefault = async (resumeId: string) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setError("로그인이 필요합니다.");
                return;
            }

            const colRef = collection(db, "users", user.uid, "resumes");
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
            await loadResumes();
        } catch (err) {
            console.error("기본 이력서 설정 실패:", err);
            setError("기본 이력서를 설정하는 중 문제가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-6">
            <SectionCard title="이력서 버전 관리">
                <p className="mb-4 text-sm text-slate-300">
                    회사/직무별로 다른 이력서 버전을 만들고, 공고에 맞게 골라 쓸 수 있어요.
                </p>

                <ResumeForm
                    title={title}
                    target={target}
                    link={link}
                    note={note}
                    isValid={isValid}
                    onSubmit={handleCreate}
                    onChangeTitle={setTitle}
                    onChangeTarget={setTarget}
                    onChangeLink={setLink}
                    onChangeNote={setNote}
                />

                {error && (
                    <p className="mb-2 text-xs text-red-400">
                        {error}
                    </p>
                )}

                <ResumeList
                    resumes={resumes}
                    loading={loading}
                    onSetDefault={handleSetDefault}
                />
            </SectionCard>
        </div>
    );
}