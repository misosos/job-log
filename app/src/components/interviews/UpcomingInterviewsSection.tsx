// app/components/interviews/UpcomingInterviewsSection.tsx (예시 경로)

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { InterviewItem } from "../../features/interviews/interviews";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

export function UpcomingInterviewsSection({ items, loading }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>다가오는 면접</Text>

            {loading ? (
                <View style={styles.skeletonContainer}>
                    {[1, 2].map((i) => (
                        <View key={i} style={styles.skeleton} />
                    ))}
                </View>
            ) : items.length === 0 ? (
                <Text style={styles.emptyText}>
                    아직 예정된 면접이 없어요. 새 면접을 추가해보세요.
                </Text>
            ) : (
                <ScrollView style={styles.list} nestedScrollEnabled>
                    {items.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemTextBox}>
                                <Text style={styles.companyRoleText}>
                                    {item.company} · {item.role}
                                </Text>
                                <Text style={styles.metaText}>
                                    일정: {item.scheduledAtLabel}
                                    {item.type ? ` · ${item.type}` : ""}
                                </Text>
                                {item.note ? (
                                    <Text
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                        style={styles.noteText}
                                    >
                                        {item.note}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>예정</Text>
                            </View>
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
        height: 64,
        width: "100%",
        borderRadius: 8,
        backgroundColor: "#1f2937", // slate-800
        opacity: 0.6,
    },
    emptyText: {
        fontSize: 13,
        color: "#d1d5db", // slate-300
    },
    list: {
        marginTop: 4,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundColor: "#020617", // slate-950
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#1f2937", // slate-800
    },
    itemTextBox: {
        flex: 1,
        marginRight: 8,
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
    noteText: {
        marginTop: 4,
        fontSize: 12,
        color: "#e5e7eb", // slate-200
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: "#f59e0b", // amber-500 비슷 (warning 느낌)
        alignSelf: "flex-start",
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#111827", // slate-900
    },
});