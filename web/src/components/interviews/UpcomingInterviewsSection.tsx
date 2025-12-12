import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

export function UpcomingInterviewsSection({ items, loading }: Props) {
    return (
        <div className="mb-4 rounded-xl border border-slate-900 bg-slate-950 px-4 py-3">
            <h3 className="mb-2 text-sm font-semibold text-slate-200">
                다가오는 면접
            </h3>

            {loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <span>면접 일정을 불러오는 중이에요…</span>
                </div>
            ) : items.length === 0 ? (
                <p className="text-xs text-slate-300">
                    아직 예정된 면접이 없어요. 새 면접을 추가해보세요.
                </p>
            ) : (
                <div className="mt-1 space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5"
                        >
                            <div className="mr-3 min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-50">
                                    {item.company} · {item.role}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                    일정: {item.scheduledAtLabel}
                                    {item.type ? ` · ${item.type}` : ""}
                                </p>
                                {item.note && (
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-200">
                                        {item.note}
                                    </p>
                                )}
                            </div>

                            <div className="inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5">
                <span className="text-[11px] font-semibold text-slate-900">
                  예정
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}