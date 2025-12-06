// src/components/dashboard/DashboardDefaultResumeSection.tsx
import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    orderBy,
    query,
    Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../libs/firebase";
import { SectionCard } from "../common/SectionCard";

type DashboardResume = {
    id: string;
    title: string;
    target: string;
    updatedAt: string;
    note?: string;
    link?: string;
};

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

export function DashboardDefaultResumeSection() {
    const [defaultResume, setDefaultResume] = useState<DashboardResume | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDefaultResume = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setDefaultResume(null);
                return;
            }

            const colRef = collection(db, "users", user.uid, "resumes");
            // updatedAt 기준으로 정렬해서 불러온 뒤, isDefault === true 인 것만 선택
            const q = query(colRef, orderBy("updatedAt", "desc"));
            const snap = await getDocs(q);

            if (snap.empty) {
                setDefaultResume(null);
                return;
            }

            const targetDoc = snap.docs
                .map((docSnap) => {
                    const data = docSnap.data() as ResumeDoc;
                    return { id: docSnap.id, data };
                })
                .find(({ data }) => data.isDefault === true);

            if (!targetDoc) {
                setDefaultResume(null);
                return;
            }

            const { id, data } = targetDoc;

            setDefaultResume({
                id,
                title: data.title ?? "",
                target: data.target ?? "",
                note: data.note ?? undefined,
                link: (data.link as string | undefined) ?? undefined,
                updatedAt: formatDate(
                    data.updatedAt ?? data.createdAt ?? null,
                ),
            });
        } catch (err) {
            console.error("기본 이력서 불러오기 실패:", err);
            setError("기본 이력서를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDefaultResume();
    }, []);

    return (
        <SectionCard title="기본 이력서">
            {loading ? (
                <div className="h-16 w-full animate-pulse rounded-md bg-slate-800/60" />
            ) : error ? (
                <p className="text-sm text-red-400">{error}</p>
            ) : !defaultResume ? (
                <p className="text-sm text-slate-400">
                    아직 기본 이력서가 설정되지 않았어요. 이력서 페이지에서 하나를 기본으로
                    설정해 보세요.
                </p>
            ) : (
                <div className="flex items-center justify-between rounded-md bg-slate-900/50 px-3 py-2">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            {defaultResume.title}
                        </p>
                        <p className="text-xs text-emerald-300">
                            기본 이력서 • 타겟: {defaultResume.target}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            마지막 수정: {defaultResume.updatedAt}
                        </p>
                        {defaultResume.note && (
                            <p className="mt-1 text-xs text-slate-400">
                                메모: {defaultResume.note}
                            </p>
                        )}
                    </div>

                    {defaultResume.link && (
                        <a
                            href={defaultResume.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-emerald-400"
                        >
                            열기
                        </a>
                    )}
                </div>
            )}
        </SectionCard>
    );
}