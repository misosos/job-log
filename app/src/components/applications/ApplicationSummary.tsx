import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

type Props = {
    loading: boolean;
    total: number;
    inProgress: number;

    /** ✅ 7일 이내 (서류/면접/최종) */
    docDueSoon?: number;
    interviewSoon?: number;
    finalSoon?: number;

    /** ⚠️ 레거시 호환: 예전 요약값(=서류 D-7로 취급) */
    dueThisWeek?: number;
};

export function ApplicationSummary({
                                       loading,
                                       total,
                                       inProgress,
                                       docDueSoon,
                                       interviewSoon,
                                       finalSoon,
                                       dueThisWeek,
                                   }: Props) {
    // ✅ 레거시 fallback
    const doc = (docDueSoon ?? dueThisWeek ?? 0) | 0;
    const interview = (interviewSoon ?? 0) | 0;
    const final = (finalSoon ?? 0) | 0;

    return (
        <View style={styles.card} accessibilityRole="summary">
            <View style={styles.headerRow}>
                <Text style={styles.title}>지원 현황 요약</Text>
                {loading && <ActivityIndicator size="small" color="#22c55e" />}
            </View>

            {loading ? (
                <Text style={styles.loadingText}>불러오는 중...</Text>
            ) : (
                <>
                    {/* 1) 상단 2개: 전체 / 진행중 */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>전체</Text>
                            <Text style={styles.statValue}>{total}</Text>
                            <Text style={styles.statSub}>지원</Text>
                        </View>

                        <View style={[styles.statBox, styles.statBoxHighlight]}>
                            <Text style={[styles.statLabel, styles.inProgressLabel]}>진행 중</Text>
                            <Text style={[styles.statValue, styles.inProgressValue]}>{inProgress}</Text>
                            <Text style={styles.statSub}>검토·진행 상태</Text>
                        </View>
                    </View>

                    {/* 2) 하단 3개: 서류/면접/최종 7일 */}
                    <View style={styles.statsRow3}>
                        <View style={styles.statBoxSmall}>
                            <Text style={styles.smallLabel}>서류</Text>
                            <Text style={styles.smallValue}>{doc}</Text>
                            <Text style={styles.smallSub}>D-7</Text>
                        </View>

                        <View style={[styles.statBoxSmall, styles.statBoxSmallMl]}>
                            <Text style={styles.smallLabel}>면접</Text>
                            <Text style={styles.smallValue}>{interview}</Text>
                            <Text style={styles.smallSub}>D-7</Text>
                        </View>

                        <View style={[styles.statBoxSmall, styles.statBoxSmallMl]}>
                            <Text style={styles.smallLabel}>최종</Text>
                            <Text style={styles.smallValue}>{final}</Text>
                            <Text style={styles.smallSub}>D-7</Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#1f2937",
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e5e7eb",
    },
    loadingText: {
        marginTop: 4,
        fontSize: 12,
        color: "#9ca3af",
    },

    // ✅ RN 호환: gap 대신 margin으로 처리
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statBox: {
        flex: 1,
        minWidth: 80,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: "#020617",
        borderWidth: 1,
        borderColor: "#1f2937",
        alignItems: "center",
    },
    statBoxHighlight: {
        backgroundColor: "#022c22",
        borderColor: "#10b981",
        marginLeft: 8, // ✅ 간격 고정
    },
    statLabel: {
        fontSize: 11,
        color: "#9ca3af",
        marginBottom: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#e5e7eb",
    },
    statSub: {
        marginTop: 2,
        fontSize: 10,
        color: "#6b7280",
    },
    inProgressLabel: {
        color: "#6ee7b7",
    },
    inProgressValue: {
        color: "#bbf7d0",
    },

    // ✅ 3개짜리 줄
    statsRow3: {
        marginTop: 10,
        flexDirection: "row",
    },
    statBoxSmall: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: "#020617",
        borderWidth: 1,
        borderColor: "#1f2937",
        alignItems: "center",
        minWidth: 72,
    },
    statBoxSmallMl: {
        marginLeft: 8, // ✅ 2,3번째만 간격
    },
    smallLabel: {
        fontSize: 11,
        color: "#9ca3af",
        marginBottom: 2,
    },
    smallValue: {
        fontSize: 18,
        fontWeight: "800",
        color: "#facc15",
    },
    smallSub: {
        marginTop: 2,
        fontSize: 10,
        color: "#6b7280",
    },
});