// src/components/interviews/InterviewReviewSection.tsx (웹 버전)

import type { InterviewItem } from "../../features/interviews/interviews";

type Props = {
    /** 이미 '지난 면접'만 들어온다고 가정 (useInterviewPageController의 past) */
    items: InterviewItem[];
    loading: boolean;
};

export function InterviewReviewSection({ items, loading }: Props) {
    if (loading) {
        return (
            <div className="mb-3 rounded-xl border border-slate-900 bg-slate-950 px-4 py-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-200">
                    면접 회고
                </h3>
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-18 w-full rounded-md bg-slate-800/70"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mb-3 rounded-xl border border-slate-900 bg-slate-950 px-4 py-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-200">
                    면접 회고
                </h3>
                <p className="whitespace-pre-line text-xs text-slate-300 leading-relaxed">
                    아직 회고를 남긴 완료된 면접이 없어요.
                    {"\n"}
                    면접이 끝난 뒤 느낀 점과 개선점을 간단히 기록해보세요.
                </p>
            </div>
        );
    }

    return (
        <div className="mb-3 rounded-xl border border-slate-900 bg-slate-950 px-4 py-3">
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
                면접 회고
            </h3>

            <div className="mt-1 space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5"
                    >
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-50">
                                    {item.company} · {item.role}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                    진행일: {item.scheduledAtLabel}
                                    {item.type ? ` · ${item.type}` : ""}
                                </p>
                            </div>

                            {/* 완료 뱃지 */}
                            <div className="inline-flex rounded-full bg-emerald-500 px-2 py-0.5">
                <span className="text-[10px] font-semibold text-slate-900">
                  완료
                </span>
                            </div>
                        </div>

                        {item.note && (
                            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-200">
                                {item.note}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}