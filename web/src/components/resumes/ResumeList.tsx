import { memo, useCallback, useMemo } from "react";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

/** Firestore Timestamp-like (toDate) */
type TimestampLike = { toDate: () => Date };
function isTimestampLike(v: unknown): v is TimestampLike {
    return (
        typeof v === "object" &&
        v !== null &&
        "toDate" in v &&
        typeof (v as { toDate?: unknown }).toDate === "function"
    );
}

/** Firestore Timestamp object shape { seconds, nanoseconds } */
type SecondsNanosLike = { seconds: number; nanoseconds?: number };
function isSecondsNanosLike(v: unknown): v is SecondsNanosLike {
    return (
        typeof v === "object" &&
        v !== null &&
        "seconds" in v &&
        typeof (v as { seconds?: unknown }).seconds === "number"
    );
}

function toMillis(value: unknown): number {
    if (!value) return 0;

    if (typeof value === "number") return Number.isFinite(value) ? value : 0;

    if (typeof value === "string") {
        const t = Date.parse(value);
        return Number.isNaN(t) ? 0 : t;
    }

    if (value instanceof Date) return value.getTime();

    if (isTimestampLike(value)) return value.toDate().getTime();

    if (isSecondsNanosLike(value)) {
        const nanos = typeof value.nanoseconds === "number" ? value.nanoseconds : 0;
        return value.seconds * 1000 + Math.floor(nanos / 1_000_000);
    }

    return 0;
}

const RESUME_DATE_FMT = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
});

function formatResumeDate(value: unknown): string {
    const ms = toMillis(value);
    if (!ms) return "-";
    return RESUME_DATE_FMT.format(new Date(ms));
}

/** ResumeVersion에 updatedAt 타입이 아직 느슨하면, 여기서만 안전하게 읽기 */
type ResumeVersionWithUpdatedAt = ResumeVersion & { updatedAt?: unknown };
function getUpdatedAt(resume: ResumeVersion): unknown {
    return (resume as ResumeVersionWithUpdatedAt).updatedAt;
}

type ResumeItemProps = {
    resume: ResumeVersion;
    onSetDefault?: (id: string) => void;
};

const ResumeItem = memo(function ResumeItem({ resume, onSetDefault }: ResumeItemProps) {
    const handleSetDefault = useCallback(() => {
        onSetDefault?.(resume.id);
    }, [onSetDefault, resume.id]);

    const updatedAtText = useMemo(() => formatResumeDate(getUpdatedAt(resume)), [resume]);

    return (
        <div className="flex items-center justify-between rounded-md border border-rose-100 bg-rose-50 px-3 py-2">
            {/* 왼쪽 정보 */}
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-rose-900">{resume.title}</p>
                <p className="truncate text-xs text-rose-800/80">타겟: {resume.target}</p>
                <p className="text-xs text-rose-700/70">마지막 수정: {updatedAtText}</p>

                {resume.note ? (
                    <p className="mt-1 line-clamp-2 text-xs text-rose-800/80">메모: {resume.note}</p>
                ) : null}
            </div>

            {/* 오른쪽 액션 */}
            <div className="ml-3 flex flex-col items-end gap-2">
                {resume.isDefault ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            기본 이력서
          </span>
                ) : onSetDefault ? (
                    <button
                        type="button"
                        onClick={handleSetDefault}
                        className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
                    >
                        기본으로 설정
                    </button>
                ) : null}

                {resume.link ? (
                    <a
                        href={resume.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md bg-rose-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-rose-400"
                    >
                        열기
                    </a>
                ) : null}
            </div>
        </div>
    );
});

type ResumeListProps = {
    resumes: ResumeVersion[];
    loading: boolean;
    onSetDefault?: (id: string) => void;
};

export function ResumeList({ resumes, loading, onSetDefault }: ResumeListProps) {
    const sortedResumes = useMemo(() => {
        return [...resumes].sort(
            (a, b) => toMillis(getUpdatedAt(b)) - toMillis(getUpdatedAt(a)),
        );
    }, [resumes]);

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
                <ResumeItem key={resume.id} resume={resume} onSetDefault={onSetDefault} />
            ))}
        </div>
    );
}