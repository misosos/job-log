import {
    Button,
    TimelineBody,
    TimelineContent,
    TimelineItem,
    TimelinePoint,
    TimelineTime,
    TimelineTitle,
} from "flowbite-react";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";

export function DashboardUpcomingItem() {
    return (
            <TimelineItem>
                <TimelinePoint icon={HiCalendar} />
                <TimelineContent>
                    <TimelineTime>2022년 2월</TimelineTime>
                    <TimelineTitle>Tailwind CSS의 애플리케이션 UI 코드</TimelineTitle>
                    <TimelineBody>
                        대시보드 레이아웃, 차트, 칸반 보드, 캘린더, 사전 주문 전자상거래 및 마케팅 페이지를 포함하여 20개 이상의 페이지에 액세스하세요.
                    </TimelineBody>
                    <Button color="gray">
                        자세히 알아보기
                        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                    </Button>
                </TimelineContent>
            </TimelineItem>
    );
}
