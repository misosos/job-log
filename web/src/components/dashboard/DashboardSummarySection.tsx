// src/components/dashboard/DashboardSummarySection.tsx
import { DashboardSummaryCard } from "./DashboardSummaryCard";
import {
    HiOutlineBriefcase,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineCalendar,
} from "react-icons/hi";


// 지금은 더미 데이터, 나중에 실제 데이터로 교체하면 됨
const summaryMetrics = [
    {
        id: "total-applications",
        label: "전체 지원",
        value: 12,
        helperText: "올해 기준",
        icon: HiOutlineBriefcase,
    },
    {
        id: "in-progress",
        label: "진행 중인 공고",
        value: 5,
        helperText: "서류 통과 이상",
        icon: HiOutlineClock,
    },
    {
        id: "today-tasks",
        label: "오늘 할 일",
        value: 3,
        helperText: "오늘 To-do",
        icon: HiOutlineCheckCircle,
    },
    {
        id: "upcoming-interviews",
        label: "다가오는 면접",
        value: 1,
        helperText: "7일 이내",
        icon: HiOutlineCalendar,
    },
];

export function DashboardSummarySection() {
    return (
        <section className="mb-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryMetrics.map((metric) => (
                    <DashboardSummaryCard
                        key={metric.id}
                        label={metric.label}
                        value={metric.value}
                        helperText={metric.helperText}
                        icon={metric.icon}
                    />
                ))}
            </div>
        </section>
    );
}