// src/components/dashboard/DashboardTodayTasksSection.tsx (웹 버전)

import { useMemo } from "react";
import { SectionCard } from "../common/SectionCard";
import { usePlanner } from "../../../../shared/features/planner/usePlanner.ts";

export function DashboardTodayTasksSection() {
    const { todayTasks, loading } = usePlanner();

    // 오늘 할 일 상위 3개만 표시 (앱과 동일)
    const tasks = useMemo(
        () => todayTasks.slice(0, 3),
        [todayTasks],
    );

    return (
        <SectionCard title="오늘 할 일">
            {loading ? (
                <div className="w-full space-y-1.5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-9 w-full animate-pulse rounded-lg bg-slate-800/60"
                        />
                    ))}
                </div>
            ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-400">
                    오늘은 아직 등록된 할 일이 없어요. 플래너에서 할 일을 추가해 보세요.
                </p>
            ) : (
                <div className="w-full space-y-2">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2"
                        >
                            <p
                                className={
                                    task.done
                                        ? "text-sm text-slate-400 line-through"
                                        : "text-sm text-slate-50"
                                }
                            >
                                {task.title}
                            </p>

                            {task.ddayLabel && (
                                <span className="text-xs text-slate-400">
                  {task.ddayLabel}
                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}