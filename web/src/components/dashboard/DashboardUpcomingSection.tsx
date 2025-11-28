import {Timeline,} from "flowbite-react";
import {DashboardUpcomingItem} from "./DashboardUpcomingItem.tsx";

export function DashboardUpcomingSection() {
    return (
        <div>
            <h2 className="jl-section-title">다가오는 마감 / 면접</h2>
            <Timeline>
                <DashboardUpcomingItem />
            </Timeline>
        </div>
    );
}
