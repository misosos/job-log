// src/pages/applications/ApplicationsPage.tsx
import { SectionCard } from "../../components/common/SectionCard";
import { ApplicationStatusBadge, type ApplicationStatus } from "../../components/common/ApplicationStatusBadge";

type ApplicationRow = {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAt: string; // "2025-11-27" 이런 식
};

const mockApplications: ApplicationRow[] = [
    {
        id: "1",
        company: "카카오페이",
        role: "데이터 산출 인턴",
        status: "서류 제출",
        appliedAt: "11.27 지원",
    },
    {
        id: "2",
        company: "IBK기업은행",
        role: "디지털 인턴",
        status: "서류 통과",
        appliedAt: "11.20 결과",
    },
    {
        id: "3",
        company: "AXA손해보험",
        role: "데이터 직무",
        status: "지원 예정",
        appliedAt: "11.30 마감",
    },
];

export function ApplicationsPage() {
    return (
        <div className="space-y-6">
            {/* 상단 필터/요약 */}
            <SectionCard title="지원 현황 요약">
                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                    <span>전체 {mockApplications.length}건</span>
                    <span className="text-emerald-300">진행 중 2건</span>
                    <span className="text-slate-400">이번 주 마감 1건</span>
                </div>
            </SectionCard>

            {/* 리스트 */}
            <SectionCard title="지원 목록">
                <div className="divide-y divide-slate-800">
                    {mockApplications.map((app) => (
                        <div
                            key={app.id}
                            className="flex items-center justify-between py-3"
                        >
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {app.company}
                                </p>
                                <p className="text-xs text-slate-300">{app.role}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <ApplicationStatusBadge status={app.status} />
                                <span className="text-xs text-slate-400">
                  {app.appliedAt}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}