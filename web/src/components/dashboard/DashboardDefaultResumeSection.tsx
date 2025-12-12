// src/components/dashboard/DashboardDefaultResumeSection.tsx
import { useMemo } from "react";
import { SectionCard } from "../common/SectionCard";
import { useResumesController } from "../../../../shared/features/resumes/useResumesController";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

export function DashboardDefaultResumeSection() {
    const { resumes, loading, error } = useResumesController();

    // isDefault === true 인 이력서를 하나 골라서 사용
    const defaultResume = useMemo<ResumeVersion | null>(
        () => resumes.find((r) => r.isDefault) ?? null,
        [resumes],
    );

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
                            {/* useResumesController 쪽에서 updatedAt을 문자열로 포맷해줬다고 가정 */}
                            마지막 수정: {defaultResume.updatedAt || "-"}
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