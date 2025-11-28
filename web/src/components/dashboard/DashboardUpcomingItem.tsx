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

type DashboardUpcomingItemData = {
    id: string;
    dateTime: string;      // 필요하면 Date로 바꿔도 되고
    displayTime: string;   // 타임라인에 그대로 보여줄 문자열
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
};

export function DashboardUpcomingItem(item: DashboardUpcomingItemData) {
    return (
            <TimelineItem>
                <TimelinePoint icon={HiCalendar} />
                <TimelineContent>
                    <TimelineTime>{item.dateTime}</TimelineTime>
                    <TimelineTitle>{item.title}</TimelineTitle>
                    <TimelineBody>
                        {item.description}
                    </TimelineBody>
                    <Button color="gray">
                        자세히 알아보기
                        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                    </Button>
                </TimelineContent>
            </TimelineItem>
    );
}
