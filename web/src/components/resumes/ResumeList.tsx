import { useMemo } from "react";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

// Firestore Timestamp / Date / number / string 등을 모두 안전하게 처리
function toMillis(value: unknown): number {
  if (!value) return 0;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  }

  if (value instanceof Date) return value.getTime();

  // Firestore Timestamp (toDate) 또는 { seconds, nanoseconds }
  if (typeof value === "object") {
    const v = value as any;
    if (typeof v.toDate === "function") {
      const d = v.toDate();
      return d instanceof Date ? d.getTime() : 0;
    }
    if (typeof v.seconds === "number") {
      const nanos = typeof v.nanoseconds === "number" ? v.nanoseconds : 0;
      return v.seconds * 1000 + Math.floor(nanos / 1_000_000);
    }
  }

  return 0;
}

function formatResumeDate(value: unknown): string {
  const ms = toMillis(value);
  if (!ms) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(ms));
}

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
    <div className="flex items-center justify-between rounded-md border border-rose-100 bg-rose-50 px-3 py-2">
      {/* 왼쪽 정보 영역 */}
      <div>
        <p className="text-sm font-semibold text-rose-900">{resume.title}</p>
        <p className="text-xs text-rose-800/80">타겟: {resume.target}</p>
        <p className="text-xs text-rose-700/70">
          마지막 수정: {formatResumeDate((resume as any).updatedAt)}
        </p>

        {resume.note && (
          <p className="mt-1 text-xs text-rose-800/80">메모: {resume.note}</p>
        )}
      </div>

      {/* 오른쪽 태그 + 열기 / 기본설정 영역 */}
      <div className="flex flex-col items-end gap-2">
        {/* 기본 이력서 뱃지 또는 설정 버튼 */}
        {resume.isDefault ? (
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            기본 이력서
          </span>
        ) : (
          onSetDefault && (
            <button
              type="button"
              onClick={handleSetDefault}
              className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
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
            className="inline-flex items-center rounded-md bg-rose-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-rose-400"
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
        toMillis((b as any).updatedAt) - toMillis((a as any).updatedAt),
      ),
    [resumes],
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-14 w-full animate-pulse rounded-md border border-rose-100 bg-rose-100"
          />
        ))}
      </div>
    );
  }

  if (sortedResumes.length === 0) {
    return (
      <p className="text-sm text-rose-800/80">
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