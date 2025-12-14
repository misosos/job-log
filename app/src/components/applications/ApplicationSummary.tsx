import React, { memo, useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

import { colors, space, radius, font } from "../../styles/theme";

type Props = {
    loading: boolean;
    total: number;
    inProgress: number;

    /** 7일 이내 (서류/면접/최종) */
    docDueSoon?: number;
    interviewSoon?: number;
    finalSoon?: number;

    /** 레거시 호환: 예전 요약값(=서류 D-7로 취급) */
    dueThisWeek?: number;
};

type StatBoxProps = {
    label: string;
    value: number;
    sub: string;
    variant?: "default" | "highlight";
};

const StatBox = memo(function StatBox({ label, value, sub, variant = "default" }: StatBoxProps) {
    const isHighlight = variant === "highlight";
    return (
        <View style={[styles.statBox, isHighlight && styles.statBoxHighlight]}>
            <Text style={[styles.statLabel, isHighlight && styles.inProgressLabel]}>{label}</Text>
            <Text style={[styles.statValue, isHighlight && styles.inProgressValue]}>{value}</Text>
            <Text style={styles.statSub}>{sub}</Text>
        </View>
    );
});

type MiniBoxProps = {
    label: string;
    value: number;
    suffix?: string;
    style?: object;
};

const MiniBox = memo(function MiniBox({ label, value, suffix = "D-7", style }: MiniBoxProps) {
    return (
        <View style={[styles.statBoxSmall, style]}>
            <Text style={styles.smallLabel}>{label}</Text>
            <Text style={styles.smallValue}>{value}</Text>
            <Text style={styles.smallSub}>{suffix}</Text>
        </View>
    );
});

const toInt = (v: unknown) => ((Number(v) || 0) | 0);

export function ApplicationSummary({
                                       loading,
                                       total,
                                       inProgress,
                                       docDueSoon,
                                       interviewSoon,
                                       finalSoon,
                                       dueThisWeek,
                                   }: Props) {
    const counts = useMemo(() => {
        // 레거시 fallback
        const doc = toInt(docDueSoon ?? dueThisWeek ?? 0);
        const interview = toInt(interviewSoon ?? 0);
        const final = toInt(finalSoon ?? 0);

        return {
            total: toInt(total),
            inProgress: toInt(inProgress),
            doc,
            interview,
            final,
        };
    }, [total, inProgress, docDueSoon, interviewSoon, finalSoon, dueThisWeek]);

    return (
        <View style={styles.card} accessibilityRole="summary">
            <View style={styles.headerRow}>
                <Text style={styles.title}>지원 현황 요약</Text>
                {loading && <ActivityIndicator size="small" color={colors.accent} />}
            </View>

            {loading ? (
                <Text style={styles.loadingText}>불러오는 중...</Text>
            ) : (
                <>
                    {/* 1) 상단 2개: 전체 / 진행중 */}
                    <View style={styles.statsRow}>
                        <StatBox label="전체" value={counts.total} sub="지원" />
                        <View style={styles.gap8} />
                        <StatBox label="진행 중" value={counts.inProgress} sub="검토·진행 상태" variant="highlight" />
                    </View>

                    {/* 2) 하단 3개: 서류/면접/최종 7일 */}
                    <View style={styles.statsRow3}>
                        <MiniBox label="서류" value={counts.doc} />
                        <MiniBox label="면접" value={counts.interview} style={styles.ml8} />
                        <MiniBox label="최종" value={counts.final} style={styles.ml8} />
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.lg, // 16
        paddingHorizontal: space.lg, // 16
        paddingVertical: space.lg - 2, // 14
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: space.md, // 12
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.sm + 2, // 10
    },

    title: {
        fontSize: font.body + 1, // 14 느낌
        fontWeight: "800",
        color: colors.textStrong,
    },

    loadingText: {
        marginTop: space.xs,
        fontSize: font.small + 1, // 12
        color: colors.textSub,
        fontWeight: "700",
    },

    // ✅ RN 호환: gap 대신 spacer View로 처리
    gap8: { width: space.sm }, // 8
    ml8: { marginLeft: space.sm }, // 8

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    statBox: {
        flex: 1,
        minWidth: 80,
        paddingVertical: space.sm + 2, // 10
        paddingHorizontal: space.sm, // 8
        borderRadius: radius.md, // 12
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },

    statBoxHighlight: {
        backgroundColor: colors.accentSoft, // rgba(244,63,94,0.12)
        borderColor: colors.placeholder, // rose-400-ish
    },

    statLabel: {
        fontSize: font.small, // 11
        color: colors.placeholder,
        marginBottom: space.xs / 2, // 2
        fontWeight: "800",
    },

    statValue: {
        fontSize: font.h1, // 20
        fontWeight: "900",
        color: colors.text,
    },

    statSub: {
        marginTop: space.xs / 2, // 2
        fontSize: 10,
        color: colors.textSub,
        fontWeight: "700",
        opacity: 0.85,
    },

    inProgressLabel: {
        color: colors.accent,
        fontWeight: "900",
    },
    inProgressValue: {
        // rose-600을 따로 토큰에 없어서 accent로 맞춤(일관성)
        color: colors.accent,
        fontWeight: "900",
    },

    statsRow3: {
        marginTop: space.sm + 2, // 10
        flexDirection: "row",
    },

    statBoxSmall: {
        flex: 1,
        paddingVertical: space.sm + 2, // 10
        paddingHorizontal: space.sm, // 8
        borderRadius: radius.md, // 12
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        minWidth: 72,
    },

    smallLabel: {
        fontSize: font.small,
        color: colors.placeholder,
        marginBottom: space.xs / 2,
        fontWeight: "800",
    },

    smallValue: {
        fontSize: font.h1 - 2, // 18
        fontWeight: "900",
        color: colors.accent,
    },

    smallSub: {
        marginTop: space.xs / 2,
        fontSize: 10,
        color: colors.textSub,
        fontWeight: "700",
        opacity: 0.85,
    },
});