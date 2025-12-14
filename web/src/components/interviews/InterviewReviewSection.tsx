import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

type Props = {
    /** 이미 '지난 면접'만 들어온다고 가정 (useInterviewPageController의 past) */
    items: InterviewItem[];
    loading: boolean;
};

const TITLE = "면접 회고";

const WRAP_CLASS = "mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3";
const TITLE_CLASS = "mb-2 text-sm font-semibold text-rose-900/80";
const ITEM_CLASS = "rounded-lg border border-rose-200 px-3 py-2.5";

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
        <div className="space-y-2">
            {[1, 2].map((i) => (
                <div key={i} className="h-18 w-full rounded-md bg-rose-100/80" />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <p className="whitespace-pre-line text-xs leading-relaxed text-rose-700/80">
            아직 회고를 남긴 완료된 면접이 없어요.
            {"\n"}
            면접이 끝난 뒤 느낀 점과 개선점을 간단히 기록해보세요.
        </p>
    );
}

function ReviewItem({ item }: { item: InterviewItem }) {
    return (
        <div className={ITEM_CLASS}>
            <div className="mb-1 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-rose-900">
                        {item.company} · {item.role}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-rose-700/70">
                        진행일: {item.scheduledAtLabel}
                        {item.type ? ` · ${item.type}` : ""}
                    </p>
                </div>

                <div className="inline-flex rounded-full bg-rose-500 px-2 py-0.5">
                    <span className="text-[10px] font-semibold text-rose-50">완료</span>
                </div>
            </div>

            {item.note ? (
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-rose-900/80">
                    {item.note}
                </p>
            ) : null}
        </div>
    );
}

function ListState({ items }: { items: InterviewItem[] }) {
    return (
        <div className="mt-1 space-y-2">
            {items.map((item) => (
                <ReviewItem key={item.id} item={item} />
            ))}
        </div>
    );
}

export function InterviewReviewSection({ items, loading }: Props) {
    return (
        <SectionFrame>
            {loading ? <LoadingState /> : items.length === 0 ? <EmptyState /> : <ListState items={items} />}
        </SectionFrame>
    );
}