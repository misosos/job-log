// src/components/dashboard/DashboardApplicationItem.tsx

import { ApplicationStatusBadge } from "../common/ApplicationStatusBadge";
import type { ApplicationStatus } from "../applications/types";

type ApplicationItemProps = {
    company: string;
    role: string;
    status: ApplicationStatus;
    dateLabel: string; // "11.27 지원", "11.30 마감" 이런 식으로
};

export function DashboardApplicationItem({
                                             company,
                                             role,
                                             status,
                                             dateLabel,
                                         }: ApplicationItemProps) {
    return (
        <div className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
            <div>
                <p className="font-medium text-white">{company}</p>
                <p className="text-sm text-slate-300">{role}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
                <ApplicationStatusBadge status={status} />
                <span className="text-xs text-slate-400">{dateLabel}</span>
            </div>
        </div>
    );
}