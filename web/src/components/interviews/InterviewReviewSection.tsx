// src/components/interviews/InterviewReviewSection.tsx
import { Badge } from "flowbite-react";

import { SectionCard } from "../common/SectionCard";
import type { InterviewItem } from "../../features/interviews/interviews";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

export function InterviewReviewSection({ items, loading }: Props) {
    return (
        <SectionCard title="면접 회고">
            {loading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 w-full animate-pulse rounded-md bg-slate-800/60" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-300">
                    아직 회고를 남긴 면접이 없어요. 면접이 끝난 뒤 느낀 점과 개선점을 간단히 기록해보세요.
                </p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-md bg-slate-800/60 px-3 py-2"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {item.company} · {item.role}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        진행일: {item.scheduledAtLabel}
                                        {item.type ? ` · ${item.type}` : null}
                                    </p>
                                </div>
                                <Badge color="success" size="xs">
                                    완료
                                </Badge>
                            </div>
                            {item.note && (
                                <p className="mt-1 text-xs text-slate-300 whitespace-pre-line">
                                    {item.note}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}