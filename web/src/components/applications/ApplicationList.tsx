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
  deadline: Timestamp | null;
};

type Props = {
  loading: boolean;
  applications: ApplicationRow[];
};

function formatDeadline(deadline: Timestamp | null): string {
  if (!deadline) return "-";
  const d = deadline.toDate();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function formatDday(deadline: Timestamp | null): string {
  if (!deadline) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = deadline.toDate();
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-DAY";
  return `D+${Math.abs(diffDays)}`;
}

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
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          총 {applications.length}건의 지원 내역
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {applications.map((app) => {
          const deadlineLabel = formatDeadline(app.deadline);
          const dday = formatDday(app.deadline);

          return (
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
                  {app.appliedAtLabel || "-"}
                </span>
                {app.deadline && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>마감 {deadlineLabel}</span>
                    {dday && (
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400">
                        {dday}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}