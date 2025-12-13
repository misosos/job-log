import { useMemo } from "react";

import { SectionCard } from "../common/SectionCard";
import { useApplications } from "../../features/applications/useApplications";
import { usePlanner } from "../../features/planner/usePlanner";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

type Summary = {
    totalApplications: number;
    inProgressApplications: number;
    todayTasks: number;
    upcomingInterviews: number;
};

const SKELETON_CELLS = [0, 1, 2, 3];

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs font-medium text-rose-700">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-rose-900">{value}</p>
        </div>
    );
}

function SummarySkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {SKELETON_CELLS.map((i) => (
                <div
                    key={i}
                    className="flex h-20 animate-pulse items-center justify-center rounded-lg border border-rose-200 bg-rose-100"
                />
            ))}
        </div>
    );
}

export function DashboardSummarySection() {
    // 지원 현황
    const { loading: applicationsLoading, totalCount, inProgressCount } = useApplications();

    // 플래너
    const { todayTasks, loading: plannerLoading } = usePlanner();

    // 면접
    const { upcoming, loading: interviewsLoading } = useInterviewPageController("web");

    // 로딩 통합
    const loading = applicationsLoading || plannerLoading || interviewsLoading;

    // 계산은 숫자만 의존하도록 (불필요한 렌더/메모 제거)
    const todayTasksCount = todayTasks.length;
    const upcomingInterviewsCount = upcoming.length;

    const summary: Summary = useMemo(
        () => ({
            totalApplications: totalCount,
            inProgressApplications: inProgressCount,
            todayTasks: todayTasksCount,
            upcomingInterviews: upcomingInterviewsCount,
        }),
        [totalCount, inProgressCount, todayTasksCount, upcomingInterviewsCount],
    );

    return (
        <SectionCard title="오늘의 취준 요약">
            {loading ? (
                <SummarySkeleton />
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <SummaryCard label="전체 지원" value={summary.totalApplications} />
                    <SummaryCard label="진행 중 공고" value={summary.inProgressApplications} />
                    <SummaryCard label="오늘 할 일" value={summary.todayTasks} />
                    <SummaryCard label="다가오는 면접" value={summary.upcomingInterviews} />
                </div>
            )}
        </SectionCard>
    );
}