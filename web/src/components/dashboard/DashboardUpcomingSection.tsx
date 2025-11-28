import {Timeline,} from "flowbite-react";
import {DashboardUpcomingItem} from "./DashboardUpcomingItem.tsx";
import {SectionCard} from "../common/SectionCard.tsx";

export function DashboardUpcomingSection() {
    return (
        <div>
            <SectionCard title={"다가오는 마감/면접"}>
                <Timeline>
                    <DashboardUpcomingItem />
                </Timeline>
            </SectionCard>
        </div>
    );
}
