// src/components/dashboard/DashboardUpcomingSection.tsx (웹 버전)

import { useMemo } from "react";
import { SectionCard } from "../common/SectionCard";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";
import { MdEvent } from "react-icons/md";

export function DashboardUpcomingSection() {
    // 공용 컨트롤러 훅 재사용
    const { upcoming, loading, listError } = useInterviewPageController();

    // 대시보드에서는 상위 3개까지만 노출
    const items = useMemo(
        () => upcoming.slice(0, 3),
        [upcoming],
    );

    return (
        <SectionCard title="다가오는 면접">
            {/* 에러 표시 */}
            {listError && (
                <p className="mb-2 text-xs text-red-300">
                    {listError}
                </p>
            )}

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-14 w-full animate-pulse rounded-md bg-slate-800/60"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-xs text-slate-400 leading-relaxed">
                    앞으로 예정된 면접이 없어요.
                    <br />
                    인터뷰 페이지에서 새로운 면접 일정을 추가해보세요.
                </p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                            {/* 아이콘 영역 */}
                            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/80">
                                <MdEvent className="h-4 w-4 text-emerald-400" />
                            </div>

                            {/* 텍스트 영역 */}
                            <div className="flex-1">
                                <p className="text-[11px] text-slate-400">
                                    {item.scheduledAtLabel ?? "일정 미정"}
                                </p>
                                <p className="truncate text-sm font-medium text-slate-50">
                                    {item.company || "회사 미입력"}
                                    {item.role ? ` · ${item.role}` : ""}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {item.type ? `${item.type} 면접` : "면접 유형 미입력"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}