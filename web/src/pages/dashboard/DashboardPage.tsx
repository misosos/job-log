// src/pages/dashboard/DashboardPage.tsx
import { DashboardRecentApplicationsSection } from "../../components/dashboard/DashboardRecentApplicationsSection";
import {DashboardTodayTasksSection} from "../../components/dashboard/DashboardTodayTasksSection.tsx";
import { DashboardDefaultResumeSection } from "../../components/dashboard/DashboardDefaultResumeSection";

export function DashboardPage() {
    return (
        <div className="space-y-6">

            <DashboardRecentApplicationsSection />
            <DashboardTodayTasksSection/>
            <DashboardDefaultResumeSection />
        </div>
    );
}