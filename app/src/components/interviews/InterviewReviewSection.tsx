// app/components/interviews/InterviewReviewSection.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { InterviewItem } from "../../features/interviews/interviews";

type Props = {
    /** 이미 '지난 면접'만 들어온다고 가정 (useInterviewPageController의 past) */
    items: InterviewItem[];
    loading: boolean;
};

export function InterviewReviewSection({ items, loading }: Props) {
    if (loading) {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>면접 회고</Text>
                <View style={styles.skeletonContainer}>
                    {[1, 2].map((i) => (
                        <View key={i} style={styles.skeleton} />
                    ))}
                </View>
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>면접 회고</Text>
                <Text style={styles.emptyText}>
                    아직 회고를 남긴 완료된 면접이 없어요.{"\n"}
                    면접이 끝난 뒤 느낀 점과 개선점을 간단히 기록해보세요.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>면접 회고</Text>
            <View style={styles.list}>
                {items.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <View style={styles.itemTitleBox}>
                                <Text
                                    style={styles.companyRoleText}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.company} · {item.role}
                                </Text>
                                <Text style={styles.metaText} numberOfLines={1}>
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
                            <Text
                                style={styles.noteText}
                                numberOfLines={3}
                                ellipsizeMode="tail"
                            >
                                {item.note}
                            </Text>
                        ) : null}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617", // slate-950
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#111827", // slate-900
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
        marginBottom: 10,
    },
    skeletonContainer: {
        gap: 8,
    } as const,
    skeleton: {
        height: 72,
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
        paddingHorizontal: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#1f2937", // slate-800
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemTitleBox: {
        flex: 1,
        paddingRight: 8,
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
        marginTop: 6,
        fontSize: 12,
        lineHeight: 17,
        color: "#e5e7eb", // slate-200
    },
});