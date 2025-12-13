import { useMemo } from "react";
import { MdEvent } from "react-icons/md";
import { useAuth } from "../../libs/auth-context";
import { SectionCard } from "../common/SectionCard";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

const SKELETON_ROWS = [0, 1, 2];

type UpcomingItem = {
    id: string;
    company?: string | null;
    role?: string | null;
    type?: string | null;
    scheduledAtLabel?: string | null;
};

function Skeleton() {
    return (
        <div className="space-y-2">
            {SKELETON_ROWS.map((i) => (
                <div
                    key={i}
                    className="h-14 w-full animate-pulse rounded-md border border-rose-200 bg-rose-100"
                />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <p className="text-xs leading-relaxed text-rose-700/80">
            앞으로 예정된 면접이 없어요.
            <br />
            인터뷰 페이지에서 새로운 면접 일정을 추가해보세요.
        </p>
    );
}

function UpcomingRow({ item }: { item: UpcomingItem }) {
    const dateLabel = item.scheduledAtLabel ?? "일정 미정";
    const companyLabel = item.company?.trim() ? item.company : "회사 미입력";
    const roleLabel = item.role?.trim() ? ` · ${item.role}` : "";
    const typeLabel = item.type?.trim() ? `${item.type} 면접` : "면접 유형 미입력";

    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-rose-50">
                <MdEvent className="h-4 w-4 text-rose-500" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[11px] text-rose-600">{dateLabel}</p>
                <p className="truncate text-sm font-medium text-rose-900">
                    {companyLabel}
                    {roleLabel}
                </p>
                <p className="mt-0.5 text-[11px] text-rose-600">{typeLabel}</p>
            </div>
        </div>
    );
}

export function DashboardUpcomingSection() {
    const { user } = useAuth();
    const userId = user?.uid ?? "web";

    const { upcoming, loading, listError } = useInterviewPageController(userId);

    const items = useMemo(() => upcoming.slice(0, 3), [upcoming]);

    return (
        <SectionCard title="다가오는 면접">
            {!!listError && <p className="mb-2 text-xs text-rose-600">{listError}</p>}

            {loading ? (
                <Skeleton />
            ) : items.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <UpcomingRow key={item.id} item={item as UpcomingItem} />
                    ))}
                </div>
            )}
        </SectionCard>
    );
}