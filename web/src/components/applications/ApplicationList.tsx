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

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

type TimestampLike = { toDate: () => Date };
function isTimestampLike(v: unknown): v is TimestampLike {
    return (
        typeof v === "object" &&
        v !== null &&
        "toDate" in v &&
        typeof (v as { toDate?: unknown }).toDate === "function"
    );
}

function parseYmdToDate(ymd: string): Date | null {
    const v = ymd.trim();
    if (!YMD_RE.test(v)) return null;

    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return null;

    return new Date(y, m - 1, d);
}

function toDate(value: DateLike): Date | null {
    if (!value) return null;
    if (isTimestampLike(value)) return value.toDate();
    if (value instanceof Date) return value;
    return parseYmdToDate(value);
}

function formatMdFromDate(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatDdayFromDate(targetDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return "D-DAY";
    return `D+${Math.abs(diffDays)}`;
}

/** appliedAt(지원일) 점진 도입 대응 */
type ApplicationRowExtended = ApplicationRow & {
    appliedAt?: DateLike;
};

/** appliedAtLabel이 "12.13 지원" 같은 형태면 리스트에서는 "12.13"만 */
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

    const positionLabel =
        (app.position ?? "").trim() || (app.role ?? "").trim() || "";

    // 날짜 값은 "딱 1번"만 Date로 변환해서 재사용
    const docDeadlineValue: DateLike = app.docDeadline ?? app.deadline ?? null;
    const interviewValue: DateLike = app.interviewAt ?? null;
    const finalValue: DateLike = app.finalResultAt ?? null;

    const docDate = toDate(docDeadlineValue);
    const interviewDate = toDate(interviewValue);
    const finalDate = toDate(finalValue);

    // 지원일: label 우선 → 값(appliedAt) fallback
    const appliedFromLabel = normalizeAppliedLabel(app.appliedAtLabel);
    const appliedDate = toDate(ext.appliedAt ?? null);
    const appliedFromValue = appliedDate ? formatMdFromDate(appliedDate) : "";

    const appliedAtText = appliedFromLabel || appliedFromValue; // "" 가능
    const hasAppliedAt = appliedAtText.length > 0;

    const hasAnySchedule = Boolean(docDate || interviewDate || finalDate);

    const deadlineLabel = docDate ? formatMdFromDate(docDate) : "-";
    const interviewLabel = interviewDate ? formatMdFromDate(interviewDate) : "-";
    const finalLabel = finalDate ? formatMdFromDate(finalDate) : "-";

    // ✅ 각각 D-day 계산
    const docDday = docDate ? formatDdayFromDate(docDate) : "";
    const interviewDday = interviewDate ? formatDdayFromDate(interviewDate) : "";
    const finalDday = finalDate ? formatDdayFromDate(finalDate) : "";

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-semibold text-rose-900">{app.company}</p>
                <p className="text-xs text-rose-700">{positionLabel}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
                <ApplicationStatusBadge status={app.status} />

                {hasAppliedAt && (
                    <span className="text-xs text-rose-600">지원일 {appliedAtText}</span>
                )}

                {hasAnySchedule && (
                    <div className="mt-0.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[11px] text-rose-700">
                        {docDate && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5">
                <span className="text-rose-600">서류</span>
                <span className="text-rose-900">{deadlineLabel}</span>
                                {docDday && (
                                    <span className="ml-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-semibold text-rose-500">
                    {docDday}
                  </span>
                                )}
              </span>
                        )}

                        {interviewDate && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5">
                <span className="text-rose-600">면접</span>
                <span className="text-rose-900">{interviewLabel}</span>
                                {interviewDday && (
                                    <span className="ml-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-semibold text-rose-500">
                    {interviewDday}
                  </span>
                                )}
              </span>
                        )}

                        {finalDate && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5">
                <span className="text-rose-600">최종</span>
                <span className="text-rose-900">{finalLabel}</span>
                                {finalDday && (
                                    <span className="ml-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-semibold text-rose-500">
                    {finalDday}
                  </span>
                                )}
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
                <div className="py-6 text-sm text-rose-600">
                    지원 내역을 불러오는 중입니다…
                </div>
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
                <p className="text-xs text-rose-600">
                    총 {applications.length}건의 지원 내역
                </p>
            </div>

            <div className="divide-y divide-rose-100">
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