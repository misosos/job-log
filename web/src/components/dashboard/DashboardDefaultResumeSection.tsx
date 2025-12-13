// src/components/dashboard/DashboardDefaultResumeSection.tsx
import { useMemo } from "react";
import { useAuth } from "../../libs/auth-context";
import { SectionCard } from "../common/SectionCard";
import { useResumesController } from "../../features/resumes/useResumesController";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

export function DashboardDefaultResumeSection() {
    const { user } = useAuth();
    const userId = user?.uid ?? "web";

    const { resumes, loading, error } = useResumesController(userId);

    const defaultResume = useMemo<ResumeVersion | null>(
        () => resumes.find((r) => r.isDefault) ?? null,
        [resumes],
    );

    return (
        <SectionCard title="기본 이력서">
            {loading ? (
                <div className="h-16 w-full animate-pulse rounded-md !bg-rose-100" />
            ) : error ? (
                <p className="text-sm !text-rose-700">{error}</p>
            ) : !defaultResume ? (
                <p className="text-sm !text-rose-700">
                    아직 기본 이력서가 설정되지 않았어요. 이력서 페이지에서 하나를 기본으로
                    설정해 보세요.
                </p>
            ) : (
                <div className="flex items-center justify-between rounded-md !border !border-rose-200 !bg-rose-50 px-3 py-2">
                    <div>
                        <p className="text-sm font-semibold !text-rose-900">
                            {defaultResume.title}
                        </p>
                        <p className="text-xs font-semibold !text-rose-600">
                            기본 이력서 • 타겟: {defaultResume.target}
                        </p>
                        <p className="text-[11px] !text-rose-600">
                            마지막 수정: {defaultResume.updatedAt || "-"}
                        </p>
                        {defaultResume.note && (
                            <p className="mt-1 text-xs !text-rose-700">
                                메모: {defaultResume.note}
                            </p>
                        )}
                    </div>

                    {defaultResume.link && (
                        <a
                            href={defaultResume.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-md !bg-rose-500 px-3 py-1.5 text-xs font-semibold !text-white shadow-sm transition hover:!bg-rose-400"
                        >
                            열기
                        </a>
                    )}
                </div>
            )}
        </SectionCard>
    );
}