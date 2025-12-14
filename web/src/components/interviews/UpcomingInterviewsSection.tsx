import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

const TITLE = "다가오는 면접";

const WRAP_CLASS = "mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3";
const TITLE_CLASS = "mb-2 text-sm font-semibold text-rose-900";
const ITEM_CLASS =
    "flex items-start justify-between rounded-lg border border-rose-200 px-3 py-2.5";
const SPINNER_CLASS =
    "h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent";

function SectionFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className={WRAP_CLASS}>
            <h3 className={TITLE_CLASS}>{TITLE}</h3>
            {children}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center gap-2 text-xs text-rose-700">
            <div className={SPINNER_CLASS} />
            <span>면접 일정을 불러오는 중이에요…</span>
        </div>
    );
}

function EmptyState() {
    return (
        <p className="text-xs text-rose-700">
            아직 예정된 면접이 없어요. 새 면접을 추가해보세요.
        </p>
    );
}

function UpcomingItem({ item }: { item: InterviewItem }) {
    return (
        <div className={ITEM_CLASS}>
            <div className="mr-3 min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-rose-900">
                    {item.company} · {item.role}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-rose-700">
                    일정: {item.scheduledAtLabel}
                    {item.type ? ` · ${item.type}` : ""}
                </p>

                {item.note ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-rose-800">
                        {item.note}
                    </p>
                ) : null}
            </div>

            <div className="inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5">
                <span className="text-[11px] font-semibold text-rose-50">예정</span>
            </div>
        </div>
    );
}

function ListState({ items }: { items: InterviewItem[] }) {
    return (
        <div className="mt-1 space-y-2">
            {items.map((item) => (
                <UpcomingItem key={item.id} item={item} />
            ))}
        </div>
    );
}

export function UpcomingInterviewsSection({ items, loading }: Props) {
    return (
        <SectionFrame>
            {loading ? <LoadingState /> : items.length === 0 ? <EmptyState /> : <ListState items={items} />}
        </SectionFrame>
    );
}