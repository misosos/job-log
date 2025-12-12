// src/components/dashboard/DashboardSummarySection.tsx
import { useMemo } from "react";

import { SectionCard } from "../common/SectionCard";
import { useApplications } from "../../features/applications/useApplications";
import { usePlanner } from "../../features/planner/usePlanner.ts";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

export function DashboardSummarySection() {
    // ✅ 지원 현황: 공통 useApplications 훅 재사용
    const {
        loading: applicationsLoading,
        totalCount,
        inProgressCount,
    } = useApplications();

    // ✅ 플래너: 오늘 할 일 / 주간 계획 훅 재사용
    const {
        todayTasks,
        loading: plannerLoading,
    } = usePlanner();

    // ✅ 면접: 다가오는 면접 목록 훅 재사용
    const {
        upcoming,
        loading: interviewsLoading,
    } = useInterviewPageController();

    // ✅ 로딩 상태 통합
    const loading = applicationsLoading || plannerLoading || interviewsLoading;

    // ✅ 요약 데이터 메모이즈 (앱이랑 동일한 계산 로직)
    const summary = useMemo(
        () => ({
            totalApplications: totalCount,
            inProgressApplications: inProgressCount,
            todayTasks: todayTasks.length,
            upcomingInterviews: upcoming.length,
        }),
        [totalCount, inProgressCount, todayTasks.length, upcoming.length],
    );

    return (
        <SectionCard title="오늘의 취준 요약">
            {loading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="flex h-20 items-center justify-center rounded-lg bg-slate-800/60"
                        >
                            <span className="text-xs text-slate-400">불러오는 중...</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-slate-900/60 p-4">
                        <p className="text-xs font-medium text-slate-400">전체 지원</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                            {summary.totalApplications}
                        </p>
                    </div>

                    <div className="rounded-lg bg-slate-900/60 p-4">
                        <p className="text-xs font-medium text-slate-400">진행 중 공고</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                            {summary.inProgressApplications}
                        </p>
                    </div>

                    <div className="rounded-lg bg-slate-900/60 p-4">
                        <p className="text-xs font-medium text-slate-400">오늘 할 일</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                            {summary.todayTasks}
                        </p>
                    </div>

                    <div className="rounded-lg bg-slate-900/60 p-4">
                        <p className="text-xs font-medium text-slate-400">다가오는 면접</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                            {summary.upcomingInterviews}
                        </p>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}