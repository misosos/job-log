import React, { memo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SectionCard } from "../common/SectionCard";
import { useApplications } from "../../features/applications/useApplications";
import { usePlanner } from "../../features/planner/usePlanner";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";
import { useAuth } from "../../libs/auth-context";

import { colors, font, radius } from "../../styles/theme";

type SummaryTileProps = {
    label: string;
    value?: number;
    loading?: boolean;
};

const SummaryTile = memo(function SummaryTile({
                                                  label,
                                                  value = 0,
                                                  loading = false,
                                              }: SummaryTileProps) {
    return (
        <View style={styles.tileWrap}>
            <View style={styles.tile}>
                {loading ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                    <>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.value}>{value}</Text>
                    </>
                )}
            </View>
        </View>
    );
});

export function DashboardSummarySection() {
    const { user } = useAuth();

    const { loading: applicationsLoading, totalCount, inProgressCount } = useApplications();
    const { todayTasks, loading: plannerLoading } = usePlanner();
    const { upcoming, loading: interviewsLoading } = useInterviewPageController(user?.uid ?? null);

    const loading = applicationsLoading || plannerLoading || interviewsLoading;

    return (
        <SectionCard title="오늘의 취준 요약">
            <View style={styles.grid}>
                <SummaryTile label="전체 지원" value={totalCount} loading={loading} />
                <SummaryTile label="진행 중 공고" value={inProgressCount} loading={loading} />
                <SummaryTile label="오늘 할 일" value={todayTasks.length} loading={loading} />
                <SummaryTile label="다가오는 면접" value={upcoming.length} loading={loading} />
            </View>
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -4,
    },

    tileWrap: {
        width: "50%",
        paddingHorizontal: 4,
        marginBottom: 8,
    },

    tile: {
        height: 80,
        borderRadius: radius.md,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: "center",
    },

    label: {
        fontSize: font.small,
        color: colors.placeholder,
        fontWeight: "700",
    },

    value: {
        marginTop: 4,
        fontSize: 22,
        fontWeight: "900",
        color: colors.text,
    },
});