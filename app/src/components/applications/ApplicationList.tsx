// app/src/components/applications/ApplicationList.tsx
import React, { memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

// ✅ 같은 폴더에 있다면 이게 가장 안전
import { ApplicationStatusBadge } from "../../components/common/ApplicationStatusBadge";

import type { ApplicationRow } from "../../../../shared/features/applications/types";

export type ApplicationListProps = {
    loading: boolean;
    applications: ApplicationRow[];
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

// -----------------------------
// date utils (Timestamp/Date/string 모두 지원)
// -----------------------------
type DateLike = unknown;
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

    if (value instanceof Date) return value;
    if (isTimestampLike(value)) return value.toDate();

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

/** "12.13 지원" -> "12.13" */
function normalizeAppliedLabel(label?: string): string {
    const v = (label ?? "").trim();
    if (!v) return "";
    return v.replace(/\s*지원\s*$/, "").trim();
}

/** ✅ 앱/웹 혼합 필드 안전 접근용 */
type ApplicationRowExtended = ApplicationRow & {
    position?: string;
    role?: string;

    appliedAt?: unknown;
    appliedAtLabel?: string;

    docDeadline?: unknown;
    interviewAt?: unknown;
    finalResultAt?: unknown;

    // 레거시
    deadline?: unknown;

    // label
    docDeadlineLabel?: string;
    interviewAtLabel?: string;
    finalResultAtLabel?: string;
};

type RowProps = {
    app: ApplicationRow;
    isLast: boolean;
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

const ApplicationRowItem = memo(function ApplicationRowItem({
                                                                app,
                                                                isLast,
                                                                onEdit,
                                                                onDelete,
                                                            }: RowProps) {
    const ext = app as ApplicationRowExtended;

    const positionLabel =
        (ext.position ?? "").trim() || (ext.role ?? "").trim() || "";

    // ✅ 일정 3종 + 레거시 deadline(서류마감으로 취급)
    const docDeadline = ext.docDeadline ?? ext.deadline ?? null;
    const interviewAt = ext.interviewAt ?? null;
    const finalResultAt = ext.finalResultAt ?? null;

    const hasAnySchedule = Boolean(
        toDate(docDeadline) || toDate(interviewAt) || toDate(finalResultAt),
    );

    // ✅ 지원일: 1) appliedAtLabel 우선  2) appliedAt 값 있으면 MM.DD 생성
    const appliedFromLabel = normalizeAppliedLabel(ext.appliedAtLabel);
    const appliedFromValue = ext.appliedAt ? formatMd(ext.appliedAt) : "";
    const appliedAtText = appliedFromLabel || appliedFromValue || "-";

    const docLabel = ext.docDeadlineLabel?.trim()
        ? ext.docDeadlineLabel.replace(/\s*서류마감\s*$/, "").trim()
        : formatMd(docDeadline);

    const interviewLabel = ext.interviewAtLabel?.trim()
        ? ext.interviewAtLabel.replace(/\s*면접\s*$/, "").trim()
        : formatMd(interviewAt);

    const finalLabel = ext.finalResultAtLabel?.trim()
        ? ext.finalResultAtLabel.replace(/\s*최종발표\s*$/, "").trim()
        : formatMd(finalResultAt);

    const dday = formatDday(docDeadline);

    return (
        <View style={[styles.row, !isLast && styles.rowDivider]}>
            {/* 회사 / 직무 */}
            <View style={styles.infoLeft}>
                <Text style={styles.companyText} numberOfLines={1}>
                    {app.company}
                </Text>
                <Text style={styles.roleText} numberOfLines={1}>
                    {positionLabel}
                </Text>
            </View>

            {/* 상태 / 날짜 / 액션 */}
            <View style={styles.infoRight}>
                {/* ✅ 만약 Badge 컴포넌트 타입이 shared status랑 다르면,
            Badge쪽을 shared 타입으로 바꾸는 게 정답이야. */}
                <ApplicationStatusBadge status={app.status as any} />

                <Text style={styles.appliedText}>지원일 {appliedAtText}</Text>

                {hasAnySchedule && (
                    <View style={styles.scheduleWrap}>
                        {toDate(docDeadline) && (
                            <View style={styles.pill}>
                                <Text style={styles.pillKey}>서류</Text>
                                <Text style={styles.pillVal}>{docLabel}</Text>

                                {!!dday && (
                                    <View style={styles.ddayBadge}>
                                        <Text style={styles.ddayText}>{dday}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {toDate(interviewAt) && (
                            <View style={styles.pill}>
                                <Text style={styles.pillKey}>면접</Text>
                                <Text style={styles.pillVal}>{interviewLabel}</Text>
                            </View>
                        )}

                        {toDate(finalResultAt) && (
                            <View style={styles.pill}>
                                <Text style={styles.pillKey}>최종</Text>
                                <Text style={styles.pillVal}>{finalLabel}</Text>
                            </View>
                        )}
                    </View>
                )}

                {(onEdit || onDelete) && (
                    <View style={styles.actionsRow}>
                        {onEdit && (
                            <TouchableOpacity onPress={() => onEdit(app)} hitSlop={8}>
                                <Text style={styles.actionText}>수정</Text>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity onPress={() => onDelete(app.id)} hitSlop={8}>
                                <Text style={styles.actionText}>삭제</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
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
            <View style={styles.card}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#22c55e" />
                    <Text style={styles.loadingText}>지원 내역을 불러오는 중입니다…</Text>
                </View>
            </View>
        );
    }

    if (applications.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.emptyText}>
                    아직 등록된 지원 내역이 없어요. 첫 번째 지원을 기록해보세요!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.countText}>총 {applications.length}건의 지원 내역</Text>
            </View>

            <View style={styles.listContent}>
                {applications.map((item, index) => (
                    <ApplicationRowItem
                        key={item.id}
                        app={item}
                        isLast={index === applications.length - 1}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    listContent: {
        paddingTop: 4,
    },

    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        justifyContent: "center",
    },

    loadingText: {
        marginLeft: 8,
        fontSize: 13,
        color: "#be123c", // rose-700
        fontWeight: "700",
    },

    emptyText: {
        paddingVertical: 16,
        fontSize: 13,
        color: "#be123c", // rose-700
        fontWeight: "700",
    },

    headerRow: {
        marginBottom: 4,
    },

    countText: {
        fontSize: 11,
        color: "#fb7185", // rose-400 (포인트)
        fontWeight: "800",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },

    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#fecdd3", // rose-200
    },

    infoLeft: {
        flex: 1,
        paddingRight: 8,
    },

    companyText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#881337", // rose-900 (필요할 때만 진하게)
    },

    roleText: {
        marginTop: 2,
        fontSize: 13,
        color: "#9f1239", // rose-800
        fontWeight: "700",
    },

    infoRight: {
        alignItems: "flex-end",
        marginLeft: 8,
    },

    appliedText: {
        marginTop: 4,
        fontSize: 11,
        color: "#be123c", // rose-700
        fontWeight: "700",
    },

    // ✅ 일정 pill UI
    scheduleWrap: {
        marginTop: 6,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },

    pill: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#ffe4e6", // rose-100
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 6,
        marginTop: 6,
    },

    pillKey: {
        fontSize: 11,
        color: "#fb7185", // rose-400
        fontWeight: "800",
    },

    pillVal: {
        fontSize: 11,
        color: "#9f1239", // rose-800
        fontWeight: "800",
        marginLeft: 6,
    },

    ddayBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: "rgba(244, 63, 94, 0.12)", // rose-500 12%
        marginLeft: 6,
    },

    ddayText: {
        fontSize: 11,
        fontWeight: "900",
        color: "#f43f5e", // rose-500
    },

    actionsRow: {
        marginTop: 8,
        flexDirection: "row",
    },

    actionText: {
        fontSize: 11,
        color: "#f43f5e", // rose-500
        marginLeft: 8,
        fontWeight: "800",
    },
});