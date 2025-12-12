// src/components/dashboard/DashboardRecentApplicationsSection.tsx
import { useMemo } from "react";

import { SectionCard } from "../common/SectionCard";
import { ApplicationList } from "../applications/ApplicationList";
import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationRow } from "../../features/applications/types";

export function DashboardRecentApplicationsSection() {
    const { applications, loading } = useApplications();

    // 최근 5개만 사용 (useApplications에서 이미 정렬되어 있다고 가정)
    const recentItems: ApplicationRow[] = useMemo(
        () => applications.slice(0, 5),
        [applications],
    );

    return (
        <SectionCard title="최근 지원 내역">
            <ApplicationList loading={loading} applications={recentItems} />
        </SectionCard>
    );
}