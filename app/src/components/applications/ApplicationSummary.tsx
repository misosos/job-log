// app/src/components/applications/ApplicationSummary.tsx
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

type Props = {
    loading: boolean;
    total: number;
    inProgress: number;
    dueThisWeek: number;
};

export function ApplicationSummary({
                                       loading,
                                       total,
                                       inProgress,
                                       dueThisWeek,
                                   }: Props) {
    return (
        <View style={styles.card}>
            {/* 제목 */}
            <Text style={styles.title}>지원 현황 요약</Text>

            {loading ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#22c55e" />
                    <Text style={styles.loadingText}>불러오는 중...</Text>
                </View>
            ) : (
                <View style={styles.summaryRow}>
                    <Text style={styles.text}>전체 {total}건</Text>
                    <Text style={[styles.text, styles.inProgress]}>
                        진행 중 {inProgress}건
                    </Text>
                    <Text style={[styles.text, styles.dueThisWeek]}>
                        이번 주 마감 {dueThisWeek}건
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617", // slate-950
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#1f2937", // slate-800
        marginBottom: 12,
    },
    title: {
        fontSize: 13,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
        marginBottom: 8,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 13,
        color: "#9ca3af", // slate-400
    },
    summaryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: 12,
        rowGap: 4,
    },
    text: {
        fontSize: 13,
        color: "#e5e7eb", // slate-200
    },
    inProgress: {
        color: "#6ee7b7", // emerald-300
    },
    dueThisWeek: {
        color: "#9ca3af", // slate-400
    },
});