// app/components/interviews/InterviewReviewSection.tsx (예시 경로)

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { InterviewItem } from "../../features/interviews/interviews";

// Firestore Timestamp-like & Date를 모두 처리하기 위한 타입
type SchedLike = Date | { toDate: () => Date } | null | undefined;

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

function getDateFromScheduledAt(scheduledAt: SchedLike): Date | null {
    if (!scheduledAt) return null;

    if (scheduledAt instanceof Date) {
        return scheduledAt;
    }
    if ("toDate" in scheduledAt && typeof scheduledAt.toDate === "function") {
        return scheduledAt.toDate();
    }
    return null;
}

export function InterviewReviewSection({ items, loading }: Props) {
    const now = new Date();

    // 이미 지난 면접만 회고 대상으로 필터링
    const completedItems = items.filter((item) => {
        const date = getDateFromScheduledAt(
            (item as { scheduledAt?: SchedLike }).scheduledAt,
        );
        if (!date) return false;
        return date < now;
    });

    return (
        <View style={styles.card}>
            <Text style={styles.title}>면접 회고</Text>

            {loading ? (
                <View style={styles.skeletonContainer}>
                    {[1, 2].map((i) => (
                        <View key={i} style={styles.skeleton} />
                    ))}
                </View>
            ) : completedItems.length === 0 ? (
                <Text style={styles.emptyText}>
                    아직 회고를 남긴 완료된 면접이 없어요.{"\n"}
                    면접이 끝난 뒤 느낀 점과 개선점을 간단히 기록해보세요.
                </Text>
            ) : (
                <ScrollView style={styles.list} nestedScrollEnabled>
                    {completedItems.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <View style={styles.itemTitleBox}>
                                    <Text style={styles.companyRoleText}>
                                        {item.company} · {item.role}
                                    </Text>
                                    <Text style={styles.metaText}>
                                        진행일: {item.scheduledAtLabel}
                                        {item.type ? ` · ${item.type}` : ""}
                                    </Text>
                                </View>

                                {/* 완료 뱃지 */}
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>완료</Text>
                                </View>
                            </View>

                            {item.note ? (
                                <Text style={styles.noteText}>{item.note}</Text>
                            ) : null}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617", // slate-950
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#111827", // slate-900
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
        marginBottom: 8,
    },
    skeletonContainer: {
        gap: 8,
    },
    skeleton: {
        height: 80,
        borderRadius: 8,
        backgroundColor: "#1f2937", // slate-800
        opacity: 0.6,
    },
    emptyText: {
        fontSize: 13,
        color: "#d1d5db", // slate-300
        lineHeight: 18,
    },
    list: {
        marginTop: 4,
    },
    itemCard: {
        backgroundColor: "#020617", // slate-950
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#1f2937", // slate-800
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    itemTitleBox: {
        flex: 1,
    },
    companyRoleText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#f9fafb", // slate-50
    },
    metaText: {
        marginTop: 2,
        fontSize: 11,
        color: "#9ca3af", // slate-400
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: "#22c55e", // emerald-500
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#022c22", // dark text
    },
    noteText: {
        marginTop: 4,
        fontSize: 12,
        color: "#e5e7eb", // slate-200
    },
});