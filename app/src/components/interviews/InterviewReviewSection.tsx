// app/components/interviews/InterviewReviewSection.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

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
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#9f1239", // rose-800
        marginBottom: 10,
    },

    skeletonContainer: {
        gap: 8,
    } as const,

    skeleton: {
        height: 72,
        borderRadius: 8,
        backgroundColor: "#ffe4e6", // rose-100
        opacity: 0.8,
    },

    emptyText: {
        fontSize: 13,
        color: "#9f1239", // rose-800 (필요할 때만 진하게)
        lineHeight: 18,
    },

    list: {
        marginTop: 4,
    },

    itemCard: {
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
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
        fontWeight: "700",
        color: "#881337", // rose-900
    },

    metaText: {
        marginTop: 2,
        fontSize: 11,
        color: "#fb7185", // rose-400
    },

    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: "#f43f5e", // rose-500
    },

    badgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#fff1f2", // rose-50
    },

    noteText: {
        marginTop: 6,
        fontSize: 12,
        lineHeight: 17,
        color: "#9f1239", // rose-800
    },
});