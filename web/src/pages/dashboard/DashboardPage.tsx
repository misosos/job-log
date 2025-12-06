// src/pages/dashboard/DashboardPage.tsx
import { DashboardRecentApplicationsSection } from "../../components/dashboard/DashboardRecentApplicationsSection";
import {DashboardTodayTasksSection} from "../../components/dashboard/DashboardTodayTasksSection.tsx";
import { DashboardDefaultResumeSection } from "../../components/dashboard/DashboardDefaultResumeSection";
import {DashboardUpcomingSection} from "../../components/dashboard/DashboardUpcomingSection.tsx";

export function DashboardPage() {
    return (
        <div className="space-y-6">
            <DashboardUpcomingSection/>
            <DashboardRecentApplicationsSection />
            <DashboardTodayTasksSection/>
            <DashboardDefaultResumeSection />
        </div>
    );
}