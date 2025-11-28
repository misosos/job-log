// src/pages/planner/PlannerPage.tsx
import { SectionCard } from "../../components/common/SectionCard";

export function PlannerPage() {
    return (
        <div className="space-y-6">
            <SectionCard title="오늘 할 일">
                <div className="space-y-2">
                    {/* 나중에 DashboardTodayTasksSection에서 쓰는 TaskItem 재사용해도 됨 */}
                    <div className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
                        <div className="flex items-center gap-3">
                            <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-500" />
                            <p className="text-sm text-slate-200">
                                카카오페이 공고 JD 분석
                            </p>
                        </div>
                        <span className="text-xs text-emerald-300">D-3</span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="이번 주 계획">
                <p className="text-sm text-slate-300">
                    한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요.
                </p>
            </SectionCard>
        </div>
    );
}