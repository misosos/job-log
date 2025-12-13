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
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
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
        fontWeight: "800",
        color: "#881337", // rose-900 (필요할 때만 진하게)
    },

    loadingText: {
        marginTop: 4,
        fontSize: 12,
        color: "#be123c", // rose-700
        fontWeight: "700",
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
        backgroundColor: "#ffe4e6", // rose-100
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        alignItems: "center",
    },

    // ✅ 강조 카드(진행중 등): rose-500 포인트
    statBoxHighlight: {
        backgroundColor: "rgba(244, 63, 94, 0.10)", // rose-500 10%
        borderColor: "#fb7185", // rose-400
        marginLeft: 8,
    },

    statLabel: {
        fontSize: 11,
        color: "#fb7185", // rose-400 (포인트)
        marginBottom: 2,
        fontWeight: "800",
    },

    statValue: {
        fontSize: 20,
        fontWeight: "900",
        color: "#9f1239", // rose-800
    },

    statSub: {
        marginTop: 2,
        fontSize: 10,
        color: "#be123c", // rose-700
        fontWeight: "700",
        opacity: 0.85,
    },

    // ✅ 진행중 강조 텍스트도 로즈로 통일
    inProgressLabel: {
        color: "#f43f5e", // rose-500
        fontWeight: "900",
    },
    inProgressValue: {
        color: "#e11d48", // rose-600
        fontWeight: "900",
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
        backgroundColor: "#ffe4e6", // rose-100
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        alignItems: "center",
        minWidth: 72,
    },

    statBoxSmallMl: {
        marginLeft: 8,
    },

    smallLabel: {
        fontSize: 11,
        color: "#fb7185", // rose-400
        marginBottom: 2,
        fontWeight: "800",
    },

    // ✅ 원래 노랑 포인트였던 값도 로즈 포인트로
    smallValue: {
        fontSize: 18,
        fontWeight: "900",
        color: "#f43f5e", // rose-500
    },

    smallSub: {
        marginTop: 2,
        fontSize: 10,
        color: "#be123c", // rose-700
        fontWeight: "700",
        opacity: 0.85,
    },
});