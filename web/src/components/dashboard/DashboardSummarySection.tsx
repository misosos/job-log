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
    } = useInterviewPageController("web");

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
                            className="flex h-20 items-center justify-center rounded-lg border border-rose-200 bg-rose-100"
                        >
                            <span className="text-xs text-rose-700">불러오는 중...</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                        <p className="text-xs font-medium text-rose-700">전체 지원</p>
                        <p className="mt-2 text-2xl font-semibold text-rose-900">
                            {summary.totalApplications}
                        </p>
                    </div>

                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                        <p className="text-xs font-medium text-rose-700">진행 중 공고</p>
                        <p className="mt-2 text-2xl font-semibold text-rose-900">
                            {summary.inProgressApplications}
                        </p>
                    </div>

                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                        <p className="text-xs font-medium text-rose-700">오늘 할 일</p>
                        <p className="mt-2 text-2xl font-semibold text-rose-900">
                            {summary.todayTasks}
                        </p>
                    </div>

                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                        <p className="text-xs font-medium text-rose-700">다가오는 면접</p>
                        <p className="mt-2 text-2xl font-semibold text-rose-900">
                            {summary.upcomingInterviews}
                        </p>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}