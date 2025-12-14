import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";

import { ApplicationStatusBadge } from "../common/ApplicationStatusBadge";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
import { colors, space, radius, font } from "../../styles/theme";

// -----------------------------
// types
// -----------------------------
export type ApplicationListProps = {
    loading: boolean;
    applications: ApplicationRow[];
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

/** 앱/웹 혼합 필드 안전 접근용 */
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

// -----------------------------
// date utils (Timestamp/Date/string 모두 지원)
// -----------------------------
type DateLike = unknown;
type TimestampLike = { toDate: () => Date };

function isTimestampLike(v: unknown): v is TimestampLike {
    return typeof v === "object" && v !== null && "toDate" in v && typeof (v as any).toDate === "function";
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

function stripSuffix(label: string | undefined, suffixRegex: RegExp, fallback: string) {
    const v = (label ?? "").trim();
    if (!v) return fallback;
    return v.replace(suffixRegex, "").trim();
}

// -----------------------------
// UI parts
// -----------------------------
function SchedulePills({
                           docDeadline,
                           interviewAt,
                           finalResultAt,
                           docLabel,
                           interviewLabel,
                           finalLabel,
                           docDday,
                           interviewDday,
                           finalDday,
                       }: {
    docDeadline: DateLike;
    interviewAt: DateLike;
    finalResultAt: DateLike;
    docLabel: string;
    interviewLabel: string;
    finalLabel: string;
    docDday: string;
    interviewDday: string;
    finalDday: string;
}) {
    const hasDoc = Boolean(toDate(docDeadline));
    const hasInterview = Boolean(toDate(interviewAt));
    const hasFinal = Boolean(toDate(finalResultAt));

    if (!hasDoc && !hasInterview && !hasFinal) return null;

    return (
        <View style={styles.scheduleWrap}>
            {hasDoc && (
                <View style={styles.pill}>
                    <Text style={styles.pillKey}>서류</Text>
                    <Text style={styles.pillVal}>{docLabel}</Text>

                    {!!docDday && (
                        <View style={styles.ddayBadge}>
                            <Text style={styles.ddayText}>{docDday}</Text>
                        </View>
                    )}
                </View>
            )}

            {hasInterview && (
                <View style={styles.pill}>
                    <Text style={styles.pillKey}>면접</Text>
                    <Text style={styles.pillVal}>{interviewLabel}</Text>

                    {!!interviewDday && (
                        <View style={styles.ddayBadge}>
                            <Text style={styles.ddayText}>{interviewDday}</Text>
                        </View>
                    )}
                </View>
            )}

            {hasFinal && (
                <View style={styles.pill}>
                    <Text style={styles.pillKey}>최종</Text>
                    <Text style={styles.pillVal}>{finalLabel}</Text>

                    {!!finalDday && (
                        <View style={styles.ddayBadge}>
                            <Text style={styles.ddayText}>{finalDday}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

// -----------------------------
// Row
// -----------------------------
type RowProps = {
    app: ApplicationRow;
    isLast: boolean;
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

const ApplicationRowItem = memo(function ApplicationRowItem({ app, isLast, onEdit, onDelete }: RowProps) {
    const ext = app as ApplicationRowExtended;

    const vm = useMemo(() => {
        const positionLabel = (ext.position ?? "").trim() || (ext.role ?? "").trim() || "";

        // 일정 3종 + 레거시 deadline(서류마감으로 취급)
        const docDeadline = ext.docDeadline ?? ext.deadline ?? null;
        const interviewAt = ext.interviewAt ?? null;
        const finalResultAt = ext.finalResultAt ?? null;

        const appliedFromLabel = normalizeAppliedLabel(ext.appliedAtLabel);
        const appliedFromValue = ext.appliedAt ? formatMd(ext.appliedAt) : "";
        const appliedAtText = appliedFromLabel || appliedFromValue || "-";

        const docLabel = stripSuffix(ext.docDeadlineLabel, /\s*서류마감\s*$/, formatMd(docDeadline));
        const interviewLabel = stripSuffix(ext.interviewAtLabel, /\s*면접\s*$/, formatMd(interviewAt));
        const finalLabel = stripSuffix(ext.finalResultAtLabel, /\s*최종발표\s*$/, formatMd(finalResultAt));

        // 각각 D-day 계산
        const docDday = formatDday(docDeadline);
        const interviewDday = formatDday(interviewAt);
        const finalDday = formatDday(finalResultAt);

        const hasActions = Boolean(onEdit || onDelete);

        return {
            positionLabel,
            appliedAtText,
            docDeadline,
            interviewAt,
            finalResultAt,
            docLabel,
            interviewLabel,
            finalLabel,
            docDday,
            interviewDday,
            finalDday,
            hasActions,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        ext.position,
        ext.role,
        ext.docDeadline,
        ext.deadline,
        ext.interviewAt,
        ext.finalResultAt,
        ext.appliedAtLabel,
        ext.appliedAt,
        ext.docDeadlineLabel,
        ext.interviewAtLabel,
        ext.finalResultAtLabel,
        onEdit,
        onDelete,
    ]);

    return (
        <View style={[styles.row, !isLast && styles.rowDivider]}>
            {/* 회사 / 직무 */}
            <View style={styles.infoLeft}>
                <Text style={styles.companyText} numberOfLines={1}>
                    {app.company}
                </Text>
                <Text style={styles.roleText} numberOfLines={1}>
                    {vm.positionLabel}
                </Text>
            </View>

            {/* 우측 영역 */}
            <View style={styles.infoRight}>
                {/* Badge: 우측 최상단 */}
                <View style={styles.rightTop}>
                    <ApplicationStatusBadge status={app.status as any} />
                </View>

                {/* 지원일 + 일정 */}
                <View style={styles.rightMid}>
                    <Text style={styles.appliedText}>지원일 {vm.appliedAtText}</Text>

                    <SchedulePills
                        docDeadline={vm.docDeadline}
                        interviewAt={vm.interviewAt}
                        finalResultAt={vm.finalResultAt}
                        docLabel={vm.docLabel}
                        interviewLabel={vm.interviewLabel}
                        finalLabel={vm.finalLabel}
                        docDday={vm.docDday}
                        interviewDday={vm.interviewDday}
                        finalDday={vm.finalDday}
                    />
                </View>

                {/* 액션 */}
                {vm.hasActions && (
                    <View style={styles.rightBottom}>
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

// -----------------------------
// List
// -----------------------------
export function ApplicationList({ loading, applications, onEdit, onDelete }: ApplicationListProps) {
    if (loading) {
        return (
            <View style={styles.card}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.accent} />
                    <Text style={styles.loadingText}>지원 내역을 불러오는 중입니다…</Text>
                </View>
            </View>
        );
    }

    if (applications.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.emptyText}>아직 등록된 지원 내역이 없어요. 첫 번째 지원을 기록해보세요!</Text>
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

// -----------------------------
// styles (theme tokens)
// -----------------------------
const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.lg,
        paddingHorizontal: space.lg,
        paddingVertical: space.lg - 2,
        borderWidth: 1,
        borderColor: colors.border,
    },

    listContent: { paddingTop: space.xs },

    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: space.lg,
        justifyContent: "center",
    },

    loadingText: {
        marginLeft: space.sm,
        fontSize: font.body,
        color: colors.textSub,
        fontWeight: "700",
    },

    emptyText: {
        paddingVertical: space.lg,
        fontSize: font.body,
        color: colors.textSub,
        fontWeight: "700",
    },

    headerRow: { marginBottom: space.xs },

    countText: {
        fontSize: font.small,
        color: colors.placeholder,
        fontWeight: "800",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: space.md - 2,
    },

    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },

    infoLeft: {
        flex: 1,
        paddingRight: space.md - 2,
        minWidth: 0,
    },

    companyText: {
        fontSize: font.h2,
        fontWeight: "800",
        color: colors.textStrong,
    },

    roleText: {
        marginTop: space.xs / 2,
        fontSize: font.body,
        color: colors.text,
        fontWeight: "700",
    },

    infoRight: {
        alignItems: "flex-end",
        marginLeft: space.sm,
        flexShrink: 1,
        maxWidth: "58%",
    },

    rightTop: {
        alignSelf: "stretch",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    rightMid: {
        alignSelf: "stretch",
        alignItems: "flex-end",
    },
    rightBottom: {
        marginTop: space.sm,
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    appliedText: {
        marginTop: space.xs,
        fontSize: font.small,
        color: colors.textSub,
        fontWeight: "700",
    },

    scheduleWrap: {
        marginTop: space.sm - 2,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        maxWidth: "100%",
    },

    pill: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.section,
        borderRadius: radius.pill,
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        marginLeft: space.sm - 2,
        marginTop: space.sm - 2,
        maxWidth: "100%",
    },

    pillKey: {
        fontSize: font.small,
        color: colors.placeholder,
        fontWeight: "800",
    },

    pillVal: {
        fontSize: font.small,
        color: colors.text,
        fontWeight: "800",
        marginLeft: space.sm - 2,
        flexShrink: 1,
    },

    ddayBadge: {
        paddingHorizontal: space.sm - 2,
        paddingVertical: space.xs / 2,
        borderRadius: radius.pill,
        backgroundColor: colors.accentSoft,
        marginLeft: space.sm - 2,
    },

    ddayText: {
        fontSize: font.small,
        fontWeight: "900",
        color: colors.accent,
    },

    actionText: {
        fontSize: font.small,
        color: colors.accent,
        marginLeft: space.sm,
        fontWeight: "800",
    },
});