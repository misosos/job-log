// src/pages/applications/ApplicationsPage.tsx
import { SectionCard } from "../../components/common/SectionCard";
import { useEffect, useState } from "react";
import { ApplicationStatusBadge, type ApplicationStatus } from "../../components/common/ApplicationStatusBadge";

import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { auth, db } from "../../libs/firebase";

type ApplicationDoc = {
    company?: string;
    position?: string;
    role?: string;
    status?: ApplicationStatus;
    appliedAt?: Timestamp | null;
    deadline?: Timestamp | null;
};

type ApplicationRow = {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAtLabel: string; // "11.27 지원" 이런 식으로 표시용 텍스트
    deadline?: Timestamp | null;
};

function formatAppliedLabel(appliedAt?: Timestamp | null): string {
    if (!appliedAt) return "";
    const date = appliedAt.toDate();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day} 지원`;
}

function isWithinNext7Days(deadline?: Timestamp | null): boolean {
    if (!deadline) return false;
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const target = deadline.toDate();
    return target >= now && target <= end;
}

export function ApplicationsPage() {
    const [applications, setApplications] = useState<ApplicationRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.warn("로그인이 필요합니다.");
                    setApplications([]);
                    return;
                }

                const colRef = collection(db, "users", user.uid, "applications");
                const q = query(colRef, orderBy("createdAt", "desc"));
                const snap = await getDocs(q);

                const rows: ApplicationRow[] = snap.docs.map((docSnap) => {
                    const data = docSnap.data() as ApplicationDoc;
                    return {
                        id: docSnap.id,
                        company: data.company ?? "",
                        role: data.position ?? data.role ?? "",
                        status: (data.status as ApplicationStatus) ?? "지원 예정",
                        appliedAtLabel: formatAppliedLabel(data.appliedAt ?? null),
                        deadline: (data.deadline as Timestamp) ?? null,
                    };
                });

                setApplications(rows);
            } catch (error) {
                console.error("지원 내역 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, []);

    const totalCount = applications.length;
    const inProgressCount = applications.filter(
        (app) => app.status !== "최종 합격" && app.status !== "불합격",
    ).length;
    const dueThisWeekCount = applications.filter((app) =>
        isWithinNext7Days(app.deadline)
    ).length;

    return (
        <div className="space-y-6">
            {/* 상단 필터/요약 */}
            <SectionCard title="지원 현황 요약">
                {loading ? (
                    <div className="text-sm text-slate-400">불러오는 중...</div>
                ) : (
                    <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                        <span>전체 {totalCount}건</span>
                        <span className="text-emerald-300">진행 중 {inProgressCount}건</span>
                        <span className="text-slate-400">이번 주 마감 {dueThisWeekCount}건</span>
                    </div>
                )}
            </SectionCard>

            {/* 리스트 */}
            <SectionCard title="지원 목록">
                {loading ? (
                    <div className="py-6 text-sm text-slate-400">지원 내역을 불러오는 중입니다…</div>
                ) : applications.length === 0 ? (
                    <div className="py-6 text-sm text-slate-400">
                        아직 등록된 지원 내역이 없어요. 첫 번째 지원을 기록해보세요!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {applications.map((app) => (
                            <div
                                key={app.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {app.company}
                                    </p>
                                    <p className="text-xs text-slate-300">{app.role}</p>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <ApplicationStatusBadge status={app.status} />
                                    <span className="text-xs text-slate-400">
                                        {app.appliedAtLabel}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}