// src/components/applications/ApplicationList.tsx

import { memo } from "react";
import type { Timestamp } from "firebase/firestore";

import { SectionCard } from "../common/SectionCard";
import { ApplicationStatusBadge } from "../common/ApplicationStatusBadge";

import type { ApplicationRow } from "../../../../shared/features/applications/types";

export type ApplicationListProps = {
    loading: boolean;
    applications: ApplicationRow[];
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

type DateLike = Timestamp | Date | string | null | undefined;

type TimestampLike = { toDate: () => Date };
function isTimestampLike(v: unknown): v is TimestampLike {
    return (
        typeof v === "object" &&
        v !== null &&
        "toDate" in v &&
        typeof (v as { toDate?: unknown }).toDate === "function"
    );
}

function toDate(value: DateLike): Date | null {
    if (!value) return null;

    if (isTimestampLike(value)) return value.toDate();
    if (value instanceof Date) return value;

    if (typeof value === "string") {
        const v = value.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
        const [y, m, d] = v.split("-").map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    }

    return null;
}

function formatMd(value: DateLike): string {
    const d = toDate(value);
    if (!d) return "-";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatDday(value: DateLike): string {
    const deadline = toDate(value);
    if (!deadline) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(deadline);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return "D-DAY";
    return `D+${Math.abs(diffDays)}`;
}

/** ✅ appliedAt(지원일)도 점진 도입 중이면 여기서만 확장해서 읽기 */
type ApplicationRowExtended = ApplicationRow & {
    appliedAt?: DateLike;
};

/** ✅ appliedAtLabel이 "12.13 지원" 같은 형태여도 리스트에서는 "12.13"만 보이게 정리 */
function normalizeAppliedLabel(label?: string): string {
    const v = (label ?? "").trim();
    if (!v) return "";
    return v.replace(/\s*지원\s*$/, "").trim();
}

type RowProps = {
    app: ApplicationRow;
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

const ApplicationRowItem = memo(function ApplicationRowItem({
                                                                app,
                                                                onEdit,
                                                                onDelete,
                                                            }: RowProps) {
    const ext = app as ApplicationRowExtended;

    const positionLabel = (app.position ?? "").trim() || (app.role ?? "").trim() || "";

    const documentDeadline: DateLike = app.docDeadline ?? app.deadline ?? null;
    const interviewAt: DateLike = app.interviewAt ?? null;
    const finalResultAt: DateLike = app.finalResultAt ?? null;

    // ✅ 1순위: appliedAtLabel(있으면)
    // ✅ 2순위: appliedAt(실제 값이 있으면)에서 MM.DD 생성
    const appliedFromLabel = normalizeAppliedLabel(app.appliedAtLabel);
    const appliedFromValue = ext.appliedAt ? formatMd(ext.appliedAt) : "";

    // ✅ 핵심: 기본값 "-" 제거 → 없으면 그냥 빈 문자열
    const appliedAtText = appliedFromLabel || appliedFromValue; // "" 가능
    const hasAppliedAt = Boolean(appliedAtText);

    const deadlineLabel = formatMd(documentDeadline);
    const interviewLabel = formatMd(interviewAt);
    const finalLabel = formatMd(finalResultAt);
    const dday = formatDday(documentDeadline);

    const hasAnySchedule = Boolean(
        toDate(documentDeadline) || toDate(interviewAt) || toDate(finalResultAt),
    );

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-semibold text-rose-900">{app.company}</p>
                <p className="text-xs text-rose-700">{positionLabel}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
                <ApplicationStatusBadge status={app.status} />

                {/* ✅ 지원일이 있을 때만 보여주기 (없으면 아예 렌더링 X) */}
                {hasAppliedAt && (
                    <span className="text-xs text-rose-600">지원일 {appliedAtText}</span>
                )}

                {hasAnySchedule && (
                    <div className="mt-0.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[11px] text-rose-700">
                        {toDate(documentDeadline) && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5">
                <span className="text-rose-600">서류</span>
                <span className="text-rose-900">{deadlineLabel}</span>
                                {dday && (
                                    <span className="ml-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-semibold text-rose-500">
                    {dday}
                  </span>
                                )}
              </span>
                        )}

                        {toDate(interviewAt) && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5">
                <span className="text-rose-600">면접</span>
                <span className="text-rose-900">{interviewLabel}</span>
              </span>
                        )}

                        {toDate(finalResultAt) && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5">
                <span className="text-rose-600">최종</span>
                <span className="text-rose-900">{finalLabel}</span>
              </span>
                        )}
                    </div>
                )}

                {(onEdit || onDelete) && (
                    <div className="mt-1 flex gap-3 text-[11px] text-rose-600">
                        {onEdit && (
                            <button
                                type="button"
                                onClick={() => onEdit(app)}
                                className="hover:text-rose-500"
                            >
                                수정
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(app.id)}
                                className="hover:text-rose-500"
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

export function ApplicationList({
                                    loading,
                                    applications,
                                    onEdit,
                                    onDelete,
                                }: ApplicationListProps) {
    if (loading) {
        return (
            <SectionCard title="지원 목록">
                <div className="py-6 text-sm text-rose-600">지원 내역을 불러오는 중입니다…</div>
            </SectionCard>
        );
    }

    if (applications.length === 0) {
        return (
            <SectionCard title="지원 목록">
                <div className="py-6 text-sm text-rose-600">
                    아직 등록된 지원 내역이 없어요. 첫 번째 지원을 기록해보세요!
                </div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="지원 목록">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-rose-600">총 {applications.length}건의 지원 내역</p>
            </div>

            <div className="divide-y divide-rose-100">
                {applications.map((app) => (
                    <ApplicationRowItem key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </div>
        </SectionCard>
    );
}