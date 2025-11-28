// src/pages/dashboard/DashboardPage.tsx
import { DashboardUpcomingSection } from "../../components/dashboard/DashboardUpcomingSection";
import { DashboardRecentApplicationsSection } from "../../components/dashboard/DashboardRecentApplicationsSection";
import {DashboardTodayTasksSection} from "../../components/dashboard/DashboardTodayTasksSection.tsx";
import {DashboardSummarySection} from "../../components/dashboard/DashboardSummarySection.tsx";

export function DashboardPage() {
    return (
        <div className="space-y-6">
            <DashboardSummarySection />
            <DashboardUpcomingSection />
            <DashboardRecentApplicationsSection />
            <DashboardTodayTasksSection/>
        </div>
    );
}