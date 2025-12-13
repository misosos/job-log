import { SectionCard } from "../common/SectionCard";

type Props = {
    loading: boolean;
    total: number;

    /** 진행 중(불합격/최종합격 제외 등) */
    inProgress: number;

    /** (Deprecated) 기존: 이번 주 마감 */
    dueThisWeek?: number;

    /** 추천: 7일 이내 서류 마감 */
    docDueSoon?: number;

    /** 추천: 7일 이내 면접 일정 */
    interviewSoon?: number;

    /** 추천: 7일 이내 최종 발표 */
    finalSoon?: number;

    /** 0건인 배지도 보여줄지(기본 false = 숨김) */
    showZeroBadges?: boolean;
};

const SKELETON_CHIPS = [0, 1, 2, 3] as const;

function toCount(value?: number | null): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type BadgeSpec = {
    key: string;
    label: string;
    title?: string;
    count: number;
};

const CHIP_BASE =
    "rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1";
const CHIP_TEXT = "text-rose-800";
const CHIP_HINT = "text-rose-600";
const COUNT_STRONG = "font-semibold text-rose-900";

function Chip({
                  label,
                  count,
                  title,
              }: {
    label: string;
    count: number;
    title?: string;
}) {
    return (
        <span className={`${CHIP_BASE} ${CHIP_TEXT}`} title={title}>
      {label} <span className={COUNT_STRONG}>{count}</span>건
    </span>
    );
}

export function ApplicationSummary({
                                       loading,
                                       total,
                                       inProgress,
                                       dueThisWeek,
                                       docDueSoon,
                                       interviewSoon,
                                       finalSoon,
                                       showZeroBadges = false,
                                   }: Props) {
    // docDueSoon이 전달되면(0 포함) 우선, 없으면 legacy(dueThisWeek)
    const docCount = toCount(docDueSoon ?? dueThisWeek);
    const interviewCount = toCount(interviewSoon);
    const finalCount = toCount(finalSoon);

    const badges: BadgeSpec[] = [
        {
            key: "doc",
            label: "서류 마감(7일)",
            title: "오늘 포함 7일 이내 서류 마감",
            count: docCount,
        },
        {
            key: "interview",
            label: "면접(7일)",
            title: "오늘 포함 7일 이내 면접 일정",
            count: interviewCount,
        },
        {
            key: "final",
            label: "최종 발표(7일)",
            title: "오늘 포함 7일 이내 최종 발표",
            count: finalCount,
        },
    ];

    const visibleBadges = showZeroBadges
        ? badges
        : badges.filter((b) => b.count > 0);

    const hasAnySoon = badges.some((b) => b.count > 0);

    return (
        <SectionCard title="지원 현황 요약">
            {loading ? (
                <div className="flex flex-wrap gap-2">
                    {SKELETON_CHIPS.map((i) => (
                        <div
                            key={i}
                            className="h-8 w-28 animate-pulse rounded-full bg-rose-100"
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2 text-sm text-rose-700">
          <span className={`${CHIP_BASE} ${CHIP_TEXT}`}>
            전체 <span className={COUNT_STRONG}>{total}</span>건
          </span>

                    <span className={`${CHIP_BASE} ${CHIP_TEXT}`}>
            진행 중 <span className={COUNT_STRONG}>{inProgress}</span>건
          </span>

                    {visibleBadges.map((b) => (
                        <Chip key={b.key} label={b.label} count={b.count} title={b.title} />
                    ))}

                    {!showZeroBadges && !hasAnySoon && (
                        <span className={`${CHIP_BASE} ${CHIP_HINT}`}>7일 이내 일정 없음</span>
                    )}
                </div>
            )}
        </SectionCard>
    );
}