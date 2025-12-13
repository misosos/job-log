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
                            className="h-8 w-28 animate-pulse rounded-full bg-rose-100"
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2 text-sm text-rose-700">
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800">
            전체 <span className="font-semibold text-rose-900">{total}</span>건
          </span>

                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800">
            진행 중 <span className="font-semibold text-rose-900">{inProgress}</span>건
          </span>

                    {shouldShow(docCount) && (
                        <span
                            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800"
                            title="오늘 포함 7일 이내 서류 마감"
                        >
              서류 마감(7일) <span className="font-semibold text-rose-900">{docCount}</span>건
            </span>
                    )}

                    {shouldShow(interviewCount) && (
                        <span
                            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800"
                            title="오늘 포함 7일 이내 면접 일정"
                        >
              면접(7일) <span className="font-semibold text-rose-900">{interviewCount}</span>건
            </span>
                    )}

                    {shouldShow(finalCount) && (
                        <span
                            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800"
                            title="오늘 포함 7일 이내 최종 발표"
                        >
              최종 발표(7일) <span className="font-semibold text-rose-900">{finalCount}</span>건
            </span>
                    )}

                    {/* ✅ 아무 일정도 없을 때 힌트: showZeroBadges=false일 때만 표시 */}
                    {!showZeroBadges && !hasAnySoon && (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-600">
              7일 이내 일정 없음
            </span>
                    )}
                </div>
            )}
        </SectionCard>
    );
}