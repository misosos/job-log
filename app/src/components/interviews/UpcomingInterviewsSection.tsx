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
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#9f1239", // rose-800
        marginBottom: 10,
    },

    loadingBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    } as any,

    loadingText: {
        fontSize: 13,
        color: "#fb7185", // rose-400
    },

    emptyText: {
        fontSize: 13,
        color: "#fb7185", // rose-400
    },

    list: {
        marginTop: 4,
    },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    itemTextBox: {
        flex: 1,
        marginRight: 10,
    },

    companyRoleText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#881337", // rose-900
    },

    metaText: {
        marginTop: 2,
        fontSize: 12,
        color: "#fb7185", // rose-400
    },

    noteText: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 17,
        color: "#9f1239", // rose-800 (필요할 때만 진하게)
    },

    // ✅ 예정 뱃지 → 로즈 포인트
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(244, 63, 94, 0.12)", // rose-500 12%
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "rgba(244, 63, 94, 0.25)",
    },

    badgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#f43f5e", // rose-500
    },
});