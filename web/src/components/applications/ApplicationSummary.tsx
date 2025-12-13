import { SectionCard } from "../common/SectionCard";

type Props = {
    loading: boolean;
    total: number;

    /** 진행 중(불합격/최종합격 제외 등) */
    inProgress: number;

    /** (Deprecated) 기존: 이번 주 마감 */
    dueThisWeek?: number;

    /** ✅ 추천: 7일 이내 서류 마감 */
    docDueSoon?: number;

    /** ✅ 추천: 7일 이내 면접 일정 */
    interviewSoon?: number;

    /** ✅ 추천: 7일 이내 최종 발표 */
    finalSoon?: number;

    /** ✅ 0건인 배지도 보여줄지(기본 false = 숨김) */
    showZeroBadges?: boolean;
};

function toCount(value?: number | null): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

const SKELETON_CHIPS = [0, 1, 2, 3];

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
    // ✅ docDueSoon이 "전달되면(0 포함)" 그대로 사용, 없을 때만 legacy(dueThisWeek) 사용
    const docCount = toCount(docDueSoon ?? dueThisWeek ?? 0);
    const interviewCount = toCount(interviewSoon ?? 0);
    const finalCount = toCount(finalSoon ?? 0);

    const shouldShow = (count: number) => showZeroBadges || count > 0;

    // ✅ 실제로 일정이 하나라도 있는지(0 배지 표시 옵션과 무관)
    const hasAnySoon = docCount > 0 || interviewCount > 0 || finalCount > 0;

    return (
        <SectionCard title="지원 현황 요약">
            {loading ? (
                <div className="flex flex-wrap gap-2">
                    {SKELETON_CHIPS.map((i) => (
                        <div
                            key={i}
                            className="h-8 w-28 animate-pulse rounded-full bg-slate-800/60"
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-200">
            전체 <span className="font-semibold">{total}</span>건
          </span>

                    <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-rose-200">
            진행 중 <span className="font-semibold">{inProgress}</span>건
          </span>

                    {shouldShow(docCount) && (
                        <span
                            className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2.5 py-1 text-rose-200"
                            title="오늘 포함 7일 이내 서류 마감"
                        >
              서류 마감(7일) <span className="font-semibold">{docCount}</span>건
            </span>
                    )}

                    {shouldShow(interviewCount) && (
                        <span
                            className="rounded-full border border-rose-200/30 bg-rose-200/10 px-2.5 py-1 text-rose-100"
                            title="오늘 포함 7일 이내 면접 일정"
                        >
              면접(7일) <span className="font-semibold">{interviewCount}</span>건
            </span>
                    )}

                    {shouldShow(finalCount) && (
                        <span
                            className="rounded-full border border-rose-100/30 bg-rose-100/10 px-2.5 py-1 text-rose-100"
                            title="오늘 포함 7일 이내 최종 발표"
                        >
              최종 발표(7일) <span className="font-semibold">{finalCount}</span>건
            </span>
                    )}

                    {/* ✅ 아무 일정도 없을 때 힌트: showZeroBadges=false일 때만 표시 */}
                    {!showZeroBadges && !hasAnySoon && (
                        <span className="rounded-full border border-slate-700 bg-slate-900/40 px-2.5 py-1 text-slate-400">
              7일 이내 일정 없음
            </span>
                    )}
                </div>
            )}
        </SectionCard>
    );
}