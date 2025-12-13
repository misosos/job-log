import React, { memo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";
import { useAuth } from "../../libs/auth-context";
import { SectionCard } from "../common/SectionCard";
import { colors, font, radius } from "../../styles/theme";

const MAX_ITEMS = 3;

const LoadingRow = memo(function LoadingRow() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>면접 일정을 불러오는 중...</Text>
        </View>
    );
});

const EmptyState = memo(function EmptyState() {
    return (
        <Text style={styles.emptyText}>
            앞으로 예정된 면접이 없어요.{"\n"}인터뷰 페이지에서 새로운 면접 일정을 추가해보세요.
        </Text>
    );
});

const InterviewRow = memo(function InterviewRow({ item }: { item: InterviewItem }) {
    const timeLabel = item.scheduledAtLabel ?? "일정 미정";
    const title = item.company || "회사 미입력";
    const role = item.role ? ` · ${item.role}` : "";
    const sub = item.type ? `${item.type} 면접` : "면접 유형 미입력";

    return (
        <View style={styles.itemRow}>
            <View style={styles.iconWrapper}>
                <MaterialIcons name="event" size={18} color={colors.accent} />
            </View>

            <View style={styles.itemContent}>
                <Text style={styles.timeText} numberOfLines={1}>
                    {timeLabel}
                </Text>

                <Text style={styles.titleText} numberOfLines={1}>
                    {title}
                    {role}
                </Text>

                <Text style={styles.subText} numberOfLines={1}>
                    {sub}
                </Text>
            </View>
        </View>
    );
});

export function DashboardUpcomingSection() {
    const { user } = useAuth();
    const userId = user?.uid ?? "web";

    const { upcoming, loading, listError } = useInterviewPageController(userId);

    const items = upcoming.slice(0, MAX_ITEMS);

    return (
        <SectionCard title="다가오는 면접">
            {!!listError && <Text style={styles.errorText}>{listError}</Text>}

            {loading ? (
                <LoadingRow />
            ) : items.length === 0 ? (
                <EmptyState />
            ) : (
                <View style={styles.list}>
                    {items.map((item, idx) => (
                        <View key={item.id} style={[idx !== 0 && styles.rowGap]}>
                            <InterviewRow item={item} />
                        </View>
                    ))}
                </View>
            )}
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    list: { width: "100%" },
    rowGap: { marginTop: 10 },

    errorText: {
        fontSize: font.small,
        color: "#e11d48", // (에러 컬러 토큰 따로 없어서 유지)
        marginBottom: 6,
        fontWeight: "800",
    },

    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
    },

    loadingText: {
        fontSize: 12,
        color: colors.placeholder,
        marginLeft: 8,
        fontWeight: "700",
    },

    emptyText: {
        fontSize: 12,
        color: colors.placeholder,
        lineHeight: 18,
        fontWeight: "700",
    },

    itemRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    iconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "rgba(244, 63, 94, 0.10)", // ✅ colors.accentSoft는 0.12라서 기존 0.10 유지(원하면 colors.accentSoft로 교체)
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 2,
    },

    itemContent: { flex: 1 },

    timeText: {
        fontSize: 11,
        color: colors.placeholder,
        marginBottom: 2,
        fontWeight: "800",
    },

    titleText: {
        fontSize: font.body,
        fontWeight: "800",
        color: colors.textStrong,
    },

    subText: {
        fontSize: 11,
        color: colors.text,
        marginTop: 2,
        opacity: 0.85,
        fontWeight: "700",
    },
});