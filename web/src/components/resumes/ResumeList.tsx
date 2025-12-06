import { useMemo } from "react";

export type ResumeVersion = {
    id: string;
    title: string;
    target: string;      // 예: "금융/데이터 공통", "카카오페이 데이터 인턴"
    updatedAt: string;   // YYYY.MM.DD
    note?: string;
    link?: string;       // 실제 파일 / 노션 / 구글 드라이브 URL
};

type ResumeItemProps = {
    resume: ResumeVersion;
};

function ResumeItem({ resume }: ResumeItemProps) {
    return (
        <div className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
            <div>
                <p className="text-sm font-medium text-white">{resume.title}</p>
                <p className="text-xs text-slate-400">타겟: {resume.target}</p>
                <p className="text-xs text-slate-500">마지막 수정: {resume.updatedAt}</p>

                {resume.link && (
                    <p className="mt-1 text-xs text-slate-400">
                        링크:
                        <a
                            href={resume.link}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 underline decoration-emerald-400/80 decoration-dotted hover:text-emerald-300"
                        >
                            열기
                        </a>
                    </p>
                )}

                {resume.note && (
                    <p className="mt-1 text-xs text-slate-400">메모: {resume.note}</p>
                )}
            </div>
            <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-200">
          버전 관리
        </span>
            </div>
        </div>
    );
}

type ResumeListProps = {
    resumes: ResumeVersion[];
    loading: boolean;
};

export function ResumeList({ resumes, loading }: ResumeListProps) {
    const sortedResumes = useMemo(
        () =>
            [...resumes].sort((a, b) =>
                (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
            ),
        [resumes],
    );

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-14 w-full animate-pulse rounded-md bg-slate-800/60"
                    />
                ))}
            </div>
        );
    }

    if (sortedResumes.length === 0) {
        return (
            <p className="text-sm text-slate-400">
                아직 등록된 이력서 버전이 없어요. 위 폼에서 첫 이력서를 추가해 보세요.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {sortedResumes.map((resume) => (
                <ResumeItem key={resume.id} resume={resume} />
            ))}
        </div>
    );
}