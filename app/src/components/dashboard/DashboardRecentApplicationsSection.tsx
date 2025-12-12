// app/src/components/dashboard/DashboardRecentApplicationsSection.tsx
import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Pressable,
} from "react-native";
import type { Timestamp } from "firebase/firestore";

import { SectionCard } from "../common/SectionCard";
import { useApplications } from "../../features/applications/useApplications";
import type {
    ApplicationRow,
    ApplicationStatus,
} from "../../../../shared/features/applications/types";

// 마감일 라벨 포맷
function formatDeadlineLabel(deadline?: Timestamp | null): string {
    if (!deadline) return "마감일 없음";
    const date = deadline.toDate();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day} 마감`;
}

// 상태별 색상
function getStatusColor(status: ApplicationStatus): string {
    switch (status) {
        case "지원 예정":
            return "#9ca3af";
        case "서류 제출":
            return "#38bdf8";
        case "서류 통과":
            return "#a855f7";
        case "면접 진행":
            return "#f97316";
        case "최종 합격":
            return "#22c55e";
        case "불합격":
            return "#f87171";
        default:
            return "#9ca3af";
    }
}

export function DashboardRecentApplicationsSection() {
    // ✅ 훅이 0인자라서 인자 없이 호출
    const { applications, loading } = useApplications();

    const items: ApplicationRow[] = useMemo(
        () => applications.slice(0, 5),
        [applications],
    );

    return (
        <SectionCard title="최근 지원 내역">
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#10b981" />
                </View>
            ) : items.length === 0 ? (
                <Text style={styles.emptyText}>
                    아직 최근 지원 내역이 없어요. 첫 지원을 기록해 보세요.
                </Text>
            ) : (
                <View style={styles.listContainer}>
                    {items.map((item) => {
                        const deadlineTs =
                            (item.deadline as Timestamp | null | undefined) ?? null;
                        const deadlineLabel = formatDeadlineLabel(deadlineTs);

                        return (
                            <Pressable
                                key={item.id}
                                style={({ pressed }) => [
                                    styles.itemRow,
                                    pressed && styles.itemRowPressed,
                                ]}
                            >
                                <View style={styles.itemMain}>
                                    <Text style={styles.companyText} numberOfLines={1}>
                                        {item.company || "회사명 미입력"}
                                    </Text>
                                    <Text style={styles.roleText} numberOfLines={1}>
                                        {item.role || "직무 미입력"}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(item.status) },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.status}
                                    </Text>
                                </View>
                                <View style={styles.deadlineBox}>
                                    <Text style={styles.deadlineText} numberOfLines={1}>
                                        {deadlineLabel}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: { fontSize: 13, color: "#9ca3af" },
    listContainer: { marginTop: 4 },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "rgba(15,23,42,0.92)",
        marginBottom: 8,
    },
    itemRowPressed: { opacity: 0.8 },
    itemMain: { flexShrink: 1, paddingRight: 8 },
    companyText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
    roleText: { marginTop: 2, fontSize: 12, color: "#e5e7eb" },
    statusText: { marginTop: 4, fontSize: 11, fontWeight: "500" },
    deadlineBox: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(15,23,42,0.9)",
        borderWidth: 1,
        borderColor: "#4b5563",
        maxWidth: 90,
    },
    deadlineText: { fontSize: 11, color: "#e5e7eb", textAlign: "right" },
});