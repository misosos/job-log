import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

export function UpcomingInterviewsSection({ items, loading }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>다가오는 면접</Text>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#22c55e" />
                    <Text style={styles.loadingText}>면접 일정을 불러오는 중이에요…</Text>
                </View>
            ) : items.length === 0 ? (
                <Text style={styles.emptyText}>
                    아직 예정된 면접이 없어요. 새 면접을 추가해보세요.
                </Text>
            ) : (
                <View style={styles.list}>
                    {items.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemTextBox}>
                                <Text style={styles.companyRoleText} numberOfLines={1} ellipsizeMode="tail">
                                    {item.company} · {item.role}
                                </Text>
                                <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
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
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617", // slate-950
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#111827", // slate-900
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
        marginBottom: 10,
    },
    loadingBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    } as any,
    loadingText: {
        fontSize: 13,
        color: "#d1d5db",
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
        alignItems: "center",
        backgroundColor: "#020617", // slate-950
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#1f2937", // slate-800
    },
    itemTextBox: {
        flex: 1,
        marginRight: 10,
    },
    companyRoleText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#f9fafb", // slate-50
    },
    metaText: {
        marginTop: 2,
        fontSize: 12,
        color: "#9ca3af", // slate-400
    },
    noteText: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 17,
        color: "#e5e7eb", // slate-200
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#f59e0b", // 예정 뱃지 색
        alignSelf: "flex-start",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#111827",
    },
});