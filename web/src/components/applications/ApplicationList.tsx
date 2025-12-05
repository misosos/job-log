import { SectionCard } from "../common/SectionCard";
import {
    ApplicationStatusBadge,
    type ApplicationStatus,
} from "../common/ApplicationStatusBadge";
import type { Timestamp } from "firebase/firestore";

export type ApplicationRow = {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAtLabel: string;
    deadline?: Timestamp | null;
};

type Props = {
    loading: boolean;
    applications: ApplicationRow[];
};

export function ApplicationList({ loading, applications }: Props) {
    if (loading) {
        return (
            <SectionCard title="지원 목록">
                <div className="py-6 text-sm text-slate-400">
                    지원 내역을 불러오는 중입니다…
                </div>
            </SectionCard>
        );
    }

    if (applications.length === 0) {
        return (
            <SectionCard title="지원 목록">
                <div className="py-6 text-sm text-slate-400">
                    아직 등록된 지원 내역이 없어요. 첫 번째 지원을 기록해보세요!
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="지원 목록">
            <div className="divide-y divide-slate-800">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="flex items-center justify-between py-3"
                    >
                        <div>
                            <p className="text-sm font-medium text-white">
                                {app.company}
                            </p>
                            <p className="text-xs text-slate-300">{app.role}</p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <ApplicationStatusBadge status={app.status} />
                            <span className="text-xs text-slate-400">
                {app.appliedAtLabel}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}