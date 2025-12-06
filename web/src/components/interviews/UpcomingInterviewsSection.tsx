import { Badge } from "flowbite-react";

import { SectionCard } from "../common/SectionCard";
import type { InterviewItem } from "../../features/interviews/interviews";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

export function UpcomingInterviewsSection({ items, loading }: Props) {
    return (
        <SectionCard title="다가오는 면접">
            {loading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 w-full animate-pulse rounded-md bg-slate-800/60" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-300">
                    아직 예정된 면접이 없어요. 새 면접을 추가해보세요.
                </p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start justify-between rounded-md bg-slate-800/60 px-3 py-2"
                        >
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {item.company} · {item.role}
                                </p>
                                <p className="text-xs text-slate-400">
                                    일정: {item.scheduledAtLabel}
                                    {item.type ? ` · ${item.type}` : null}
                                </p>
                                {item.note && (
                                    <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                                        {item.note}
                                    </p>
                                )}
                            </div>
                            <Badge color="warning" size="xs">
                                예정
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}