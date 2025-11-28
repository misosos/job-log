import { SectionCard } from "../common/SectionCard"
import { DashboardApplicationItem } from "./DashboardApplicationItem";

const recentApplications = [
    {
        company: "카카오페이",
        role: "데이터 산출 인턴",
        status: "서류 제출" as const,
        dateLabel: "11.27 지원",
    },
    {
        company: "IBK기업은행",
        role: "디지털 인턴",
        status: "서류 통과" as const,
        dateLabel: "11.20 결과",
    },
    {
        company: "AXA손보",
        role: "데이터 직무",
        status: "지원 예정" as const,
        dateLabel: "11.30 마감",
    },
];

export function DashboardRecentApplicationsSection() {
    return (
        <SectionCard title="최근 지원 내역">
            <div className="space-y-2">
                {recentApplications.map((app) => (
                    <DashboardApplicationItem key={app.company + app.role} {...app} />
                ))}
            </div>
        </SectionCard>
    );
}