import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { SectionCard } from "../common/SectionCard";
import { useApplications } from "../../features/applications/useApplications";
import { ApplicationStatusBadge } from "../common/ApplicationStatusBadge";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
import { colors, font, radius } from "../../styles/theme";

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
    if (!d) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}.${dd}`;
}

// -----------------------------
// row helpers
// -----------------------------
type ApplicationRowExtended = ApplicationRow & {
    position?: string;
    role?: string;

    docDeadline?: unknown; // 신규
    interviewAt?: unknown; // 신규
    finalResultAt?: unknown; // 신규

    deadline?: unknown; // 레거시(=서류마감 취급)
};

type ScheduleKind = "서류" | "면접" | "최종";

function pickMainSchedule(ext: ApplicationRowExtended): { kind: ScheduleKind; date: DateLike } | null {
    const doc = ext.docDeadline ?? ext.deadline ?? null;
    const interview = ext.interviewAt ?? null;
    const finalR = ext.finalResultAt ?? null;

    if (toDate(doc)) return { kind: "서류", date: doc };
    if (toDate(interview)) return { kind: "면접", date: interview };
    if (toDate(finalR)) return { kind: "최종", date: finalR };
    return null;
}

function getPositionLabel(ext: ApplicationRowExtended): string {
    return (ext.position ?? "").trim() || (ext.role ?? "").trim() || "직무 미입력";
}

function getCompanyLabel(company?: string): string {
    return (company ?? "").trim() || "회사명 미입력";
}

export function DashboardRecentApplicationsSection() {
    const { applications, loading } = useApplications();

    const items = useMemo(() => applications.slice(0, 5), [applications]);

    return (
        <SectionCard title="최근 지원 내역">
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.accent} />
                </View>
            ) : items.length === 0 ? (
                <Text style={styles.emptyText}>아직 최근 지원 내역이 없어요. 첫 지원을 기록해 보세요.</Text>
            ) : (
                <View style={styles.listContainer}>
                    {items.map((row) => {
                        const ext = row as ApplicationRowExtended;

                        const mainSchedule = pickMainSchedule(ext);
                        const dateText = mainSchedule ? formatMd(mainSchedule.date) : "";
                        const scheduleLabel = mainSchedule ? `${mainSchedule.kind} ${dateText}` : "일정 없음";

                        return (
                            <Pressable
                                key={row.id}
                                style={({ pressed }) => [styles.itemRow, pressed && styles.itemRowPressed]}
                            >
                                <View style={styles.itemMain}>
                                    <Text style={styles.companyText} numberOfLines={1}>
                                        {getCompanyLabel(row.company)}
                                    </Text>

                                    <Text style={styles.roleText} numberOfLines={1}>
                                        {getPositionLabel(ext)}
                                    </Text>

                                    <View style={styles.badgeRow}>
                                        <ApplicationStatusBadge status={row.status as any} />
                                    </View>
                                </View>

                                <View style={styles.deadlineBox}>
                                    <Text style={styles.deadlineText} numberOfLines={1}>
                                        {scheduleLabel}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyText: {
        fontSize: font.body,
        color: colors.placeholder,
    },

    listContainer: { marginTop: 4 },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: radius.md,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
    },

    itemRowPressed: { opacity: 0.85 },

    itemMain: { flexShrink: 1, paddingRight: 8 },

    companyText: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.text,
    },

    roleText: {
        marginTop: 2,
        fontSize: 12,
        color: colors.textSub,
        fontWeight: "700",
    },

    badgeRow: {
        marginTop: 6,
        flexDirection: "row",
    },

    deadlineBox: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
        maxWidth: 110,
    },

    deadlineText: {
        fontSize: font.small,
        color: colors.accent,
        textAlign: "right",
        fontWeight: "800",
    },
});