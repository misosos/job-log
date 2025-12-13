import { useMemo } from "react";

import { SectionCard } from "../common/SectionCard";
import { ApplicationList } from "../applications/ApplicationList";
import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationRow } from "../../../../shared/features/applications/types";

const RECENT_LIMIT = 5;

function pickRecent(items: ApplicationRow[], limit = RECENT_LIMIT): ApplicationRow[] {
    return items.slice(0, limit);
}

export function DashboardRecentApplicationsSection() {
    const { applications, loading } = useApplications();

    const recentItems = useMemo(() => pickRecent(applications), [applications]);

    return (
        <SectionCard title="최근 지원 내역">
            <ApplicationList loading={loading} applications={recentItems} />
        </SectionCard>
    );
}