import { useMemo } from "react";
import { useAuth } from "../../libs/auth-context";
import { SectionCard } from "../common/SectionCard";
import { useResumesController } from "../../features/resumes/useResumesController";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

const EMPTY_USER_ID = "web";

function getDefaultResume(resumes: ResumeVersion[]): ResumeVersion | null {
    return resumes.find((r) => r.isDefault) ?? null;
}

function DefaultResumeCard({ resume }: { resume: ResumeVersion }) {
    return (
        <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-rose-900">
                    {resume.title}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-rose-600">
                    기본 이력서 • 타겟: {resume.target}
                </p>

                <p className="mt-0.5 text-[11px] text-rose-600">
                    마지막 수정: {resume.updatedAt || "-"}
                </p>

                {resume.note ? (
                    <p className="mt-1 line-clamp-2 text-xs text-rose-700">
                        메모: {resume.note}
                    </p>
                ) : null}
            </div>

            {resume.link ? (
                <a
                    href={resume.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-3 inline-flex shrink-0 items-center rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-400"
                >
                    열기
                </a>
            ) : null}
        </div>
    );
}

export function DashboardDefaultResumeSection() {
    const { user } = useAuth();
    const userId = user?.uid ?? EMPTY_USER_ID;

    const { resumes, loading, error } = useResumesController(userId);

    const defaultResume = useMemo(() => getDefaultResume(resumes), [resumes]);

    return (
        <SectionCard title="기본 이력서">
            {loading ? (
                <div className="h-16 w-full animate-pulse rounded-md bg-rose-100" />
            ) : error ? (
                <p className="text-sm text-rose-700">{error}</p>
            ) : !defaultResume ? (
                <p className="text-sm text-rose-700">
                    아직 기본 이력서가 설정되지 않았어요. 이력서 페이지에서 하나를 기본으로
                    설정해 보세요.
                </p>
            ) : (
                <DefaultResumeCard resume={defaultResume} />
            )}
        </SectionCard>
    );
}