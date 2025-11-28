// src/components/dashboard/DashboardUpcomingSection.tsx
import { SectionCard } from "../common/SectionCard";
import {DashboardUpcomingItem} from "./DashboardUpcomingItem.tsx";
import { Timeline } from "flowbite-react";

const dashboardUpcomingItems = [
    {
        id: "1",
        type: "deadline",
        dateTime: "2025-11-30T23:59:00",
        displayTime: "11.30 (토) 서류 마감",
        title: "카카오페이 데이터 산출 인턴 서류 마감",
        description: "자기소개서 최종 검토 및 지원서 제출",
        actionLabel: "지원서 정리하기",
        actionHref: "/applications", // 나중에 라우터 연결
    },
    {
        id: "2",
        type: "interview",
        dateTime: "2025-12-02T10:00:00",
        displayTime: "12.02 (월) 10:00 · 1차 면접",
        title: "IBK기업은행 디지털 인턴 1차 면접",
        description: "AI 서비스 기획 경험 중심으로 예상 질문 준비",
        actionLabel: "면접 준비하기",
        actionHref: "/interviews",
    },
    {
        id: "3",
        type: "deadline",
        dateTime: "2025-12-05T23:59:00",
        displayTime: "12.05 (목) 서류 마감",
        title: "신한은행 AI 인턴 서류 마감",
        actionLabel: "공고 다시 보기",
        actionHref: "/planner",
    },
];

export function DashboardUpcomingSection() {
    return (
        <SectionCard title="다가오는 마감 / 면접">
            <Timeline>
                {dashboardUpcomingItems.map((item) => (
                    <DashboardUpcomingItem key={item.id} {...item} />
                ))}
            </Timeline>
        </SectionCard>
    );
}