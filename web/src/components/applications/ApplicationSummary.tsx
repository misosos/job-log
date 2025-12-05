import { SectionCard } from "../common/SectionCard";

type Props = {
    loading: boolean;
    total: number;
    inProgress: number;
    dueThisWeek: number;
};

export function ApplicationSummary({
                                       loading,
                                       total,
                                       inProgress,
                                       dueThisWeek,
                                   }: Props) {
    return (
        <SectionCard title="지원 현황 요약">
            {loading ? (
                <div className="text-sm text-slate-400">불러오는 중...</div>
            ) : (
                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                    <span>전체 {total}건</span>
                    <span className="text-emerald-300">
            진행 중 {inProgress}건
          </span>
                    <span className="text-slate-400">
            이번 주 마감 {dueThisWeek}건
          </span>
                </div>
            )}
        </SectionCard>
    );
}