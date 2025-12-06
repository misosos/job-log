import { useMemo } from "react";
import type { ResumeVersion } from "../../features/resumes/types"

type ResumeItemProps = {
  resume: ResumeVersion;
  onSetDefault?: (id: string) => void;
};

function ResumeItem({ resume, onSetDefault }: ResumeItemProps) {
  const handleSetDefault = () => {
    if (!onSetDefault) return;
    onSetDefault(resume.id);
  };

  return (
    <div className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
      {/* 왼쪽 정보 영역 */}
      <div>
        <p className="text-sm font-medium text-white">{resume.title}</p>
        <p className="text-xs text-slate-400">타겟: {resume.target}</p>
        <p className="text-xs text-slate-500">마지막 수정: {resume.updatedAt}</p>

        {resume.note && (
          <p className="mt-1 text-xs text-slate-400">메모: {resume.note}</p>
        )}
      </div>

      {/* 오른쪽 태그 + 열기 / 기본설정 영역 */}
      <div className="flex flex-col items-end gap-2">
        {/* 기본 이력서 뱃지 또는 설정 버튼 */}
        {resume.isDefault ? (
          <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
            기본 이력서
          </span>
        ) : (
          onSetDefault && (
            <button
              type="button"
              onClick={handleSetDefault}
              className="rounded-full border border-emerald-400/70 px-2 py-0.5 text-[10px] text-emerald-300 hover:bg-emerald-500/10"
            >
              기본으로 설정
            </button>
          )
        )}

        {/* 이력서 열기 버튼 (링크가 있을 때만 표시) */}
        {resume.link && (
          <a
            href={resume.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-medium text-slate-900 shadow-sm transition hover:bg-emerald-400"
          >
            열기
          </a>
        )}
      </div>
    </div>
  );
}

type ResumeListProps = {
  resumes: ResumeVersion[];
  loading: boolean;
  onSetDefault?: (id: string) => void;
};

export function ResumeList({ resumes, loading, onSetDefault }: ResumeListProps) {
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
        <ResumeItem
          key={resume.id}
          resume={resume}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
}