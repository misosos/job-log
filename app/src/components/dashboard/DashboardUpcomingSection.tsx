// app/components/dashboard/DashboardUpcomingSection.tsx

import React, { useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import type { InterviewItem } from "../../../../shared/features/interviews/interviews";
import { useInterviewPageController } from "../../../../shared/features/interviews/useInterviewPageController";

export function DashboardUpcomingSection() {
    // ✅ 공용 컨트롤러 훅 사용 (이미 Firestore + API 재활용 중)
    const { upcoming, loading, listError } = useInterviewPageController();

    // 대시보드에서는 상위 3개까지만 보여주기
    const items: InterviewItem[] = useMemo(
        () => upcoming.slice(0, 3),
        [upcoming],
    );

    const renderItem = ({ item }: { item: InterviewItem }) => (
        <View style={styles.itemRow}>
            <View style={styles.iconWrapper}>
                <MaterialIcons name="event" size={18} color="#22c55e" />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.timeText} numberOfLines={1}>
                    {item.scheduledAtLabel ?? "일정 미정"}
                </Text>
                <Text style={styles.titleText} numberOfLines={1}>
                    {item.company || "회사 미입력"}
                    {item.role ? ` · ${item.role}` : ""}
                </Text>
                <Text style={styles.subText} numberOfLines={1}>
                    {item.type ? `${item.type} 면접` : "면접 유형 미입력"}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>다가오는 면접</Text>

            {/* 에러가 있다면 한 줄 표시 (선택사항) */}
            {listError ? (
                <Text style={styles.errorText}>{listError}</Text>
            ) : null}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#22c55e" />
                    <Text style={styles.loadingText}>면접 일정을 불러오는 중...</Text>
                </View>
            ) : items.length === 0 ? (
                <Text style={styles.emptyText}>
                    앞으로 예정된 면접이 없어요.
                    {"\n"}
                    인터뷰 페이지에서 새로운 면접 일정을 추가해보세요.
                </Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#020617", // slate-950 느낌
        borderWidth: 1,
        borderColor: "#1e293b", // slate-800
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
        marginBottom: 10,
    },
    errorText: {
        fontSize: 11,
        color: "#fecaca",
        marginBottom: 4,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
    },
    loadingText: {
        fontSize: 12,
        color: "#9ca3af", // slate-400
        marginLeft: 8,
    },
    emptyText: {
        fontSize: 12,
        color: "#9ca3af",
        lineHeight: 18,
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
        borderColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        marginTop: 2,
    },
    itemContent: {
        flex: 1,
    },
    timeText: {
        fontSize: 11,
        color: "#9ca3af",
        marginBottom: 2,
    },
    titleText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#e5e7eb",
    },
    subText: {
        fontSize: 11,
        color: "#9ca3af",
        marginTop: 2,
    },
    separator: {
        height: 10,
    },
});