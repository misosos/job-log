// src/components/applications/ApplicationList.tsx (웹용)

import { memo } from "react";
import type { Timestamp } from "firebase/firestore";

import { SectionCard } from "../common/SectionCard";
import { ApplicationStatusBadge } from "../common/ApplicationStatusBadge";

// ✅ features 쪽의 공통 타입 재사용
import type { ApplicationRow } from "../../features/applications/types";

// ✅ RN이랑 동일하게 props 타입 분리
export type ApplicationListProps = {
    loading: boolean;
    applications: ApplicationRow[];
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

// ✅ deadline이 undefined일 수도 있으니까 | undefined 허용
function formatDeadline(deadline: Timestamp | null | undefined): string {
    if (!deadline) return "-";
    const d = deadline.toDate();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatDday(deadline: Timestamp | null | undefined): string {
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

type RowProps = {
    app: ApplicationRow;
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

// ✅ RN처럼 Row 컴포넌트 분리 + memo
const ApplicationRowItem = memo(function ApplicationRowItem({
                                                                app,
                                                                onEdit,
                                                                onDelete,
                                                            }: RowProps) {
    const deadlineLabel = formatDeadline(app.deadline as Timestamp | null | undefined);
    const dday = formatDday(app.deadline as Timestamp | null | undefined);

    return (
        <div className="flex items-center justify-between py-3">
            {/* 회사 / 직무 */}
            <div>
                <p className="text-sm font-medium text-white">{app.company}</p>
                <p className="text-xs text-slate-300">{app.role}</p>
            </div>

            {/* 상태 / 날짜 / 액션 */}
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

                {(onEdit || onDelete) && (
                    <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
                        {onEdit && (
                            <button
                                type="button"
                                onClick={() => onEdit(app)}
                                className="hover:text-rose-300"
                            >
                                수정
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(app.id)}
                                className="hover:text-rose-300"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

// ✅ 메인 리스트 컴포넌트
export function ApplicationList({
                                    loading,
                                    applications,
                                    onEdit,
                                    onDelete,
                                }: ApplicationListProps) {
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
                {applications.map((app) => (
                    <ApplicationRowItem
                        key={app.id}
                        app={app}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </SectionCard>
    );
}