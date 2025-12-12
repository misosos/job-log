// app/src/components/applications/ApplicationList.tsx
import React, { memo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    ListRenderItem,
} from "react-native";
import type { Timestamp } from "firebase/firestore";

import { ApplicationStatusBadge } from "../common/ApplicationStatusBadge";

// 타입은 features 쪽에서 가져오기
import type {ApplicationRow} from "../../../../shared/features/applications/types";

export type ApplicationListProps = {
    loading: boolean;
    applications: ApplicationRow[];
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

// deadline이 undefined일 수도 있으니까 | undefined까지 허용
function formatDeadline(deadline: Timestamp | null | undefined): string {
    if (!deadline) return "-";
    const d = deadline.toDate();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatDday(deadline: Timestamp | null | undefined): string {
    if (!deadline) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = deadline.toDate();
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return "D-DAY";
    return `D+${Math.abs(diffDays)}`;
}

type RowProps = {
    app: ApplicationRow;
    isLast: boolean;
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

const ApplicationRowItem = memo(function ApplicationRowItem({
                                                                app,
                                                                isLast,
                                                                onEdit,
                                                                onDelete,
                                                            }: RowProps) {
    const deadlineLabel = formatDeadline(app.deadline as Timestamp | null | undefined);
    const dday = formatDday(app.deadline as Timestamp | null | undefined);

    return (
        <View style={[styles.row, !isLast && styles.rowDivider]}>
            {/* 회사 / 직무 */}
            <View style={styles.infoLeft}>
                <Text style={styles.companyText} numberOfLines={1}>
                    {app.company}
                </Text>
                <Text style={styles.roleText} numberOfLines={1}>
                    {app.role}
                </Text>
            </View>

            {/* 상태 / 날짜 / 액션 */}
            <View style={styles.infoRight}>
                <ApplicationStatusBadge status={app.status} />

                <Text style={styles.appliedText}>
                    {app.appliedAtLabel || "-"}
                </Text>

                {app.deadline && (
                    <View style={styles.deadlineRow}>
                        <Text style={styles.deadlineText}>마감 {deadlineLabel}</Text>
                        {!!dday && (
                            <View style={styles.ddayBadge}>
                                <Text style={styles.ddayText}>{dday}</Text>
                            </View>
                        )}
                    </View>
                )}

                {(onEdit || onDelete) && (
                    <View style={styles.actionsRow}>
                        {onEdit && (
                            <TouchableOpacity
                                onPress={() => onEdit(app)}
                                hitSlop={8}
                            >
                                <Text style={styles.actionText}>수정</Text>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity
                                onPress={() => onDelete(app.id)}
                                hitSlop={8}
                            >
                                <Text style={styles.actionText}>삭제</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
});

// ✅ 여기서 Props → ApplicationListProps 로 변경
export function ApplicationList({
                                    loading,
                                    applications,
                                    onEdit,
                                    onDelete,
                                }: ApplicationListProps) {
    if (loading) {
        return (
            <View style={styles.card}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#22c55e" />
                    <Text style={styles.loadingText}>
                        지원 내역을 불러오는 중입니다…
                    </Text>
                </View>
            </View>
        );
    }

    if (applications.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.emptyText}>
                    아직 등록된 지원 내역이 없어요. 첫 번째 지원을 기록해보세요!
                </Text>
            </View>
        );
    }

    const renderItem: ListRenderItem<ApplicationRow> = useCallback(
        ({ item, index }) => (
            <ApplicationRowItem
                app={item}
                isLast={index === applications.length - 1}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ),
        [applications.length, onEdit, onDelete],
    );

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.countText}>
                    총 {applications.length}건의 지원 내역
                </Text>
            </View>

            <FlatList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={applications.length > 4}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
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
    },
    listContent: {
        paddingTop: 4,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        justifyContent: "center",
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 13,
        color: "#9ca3af", // slate-400
    },
    emptyText: {
        paddingVertical: 16,
        fontSize: 13,
        color: "#9ca3af", // slate-400
    },
    headerRow: {
        marginBottom: 4,
    },
    countText: {
        fontSize: 11,
        color: "#9ca3af", // slate-400
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#1f2937", // slate-800
    },
    infoLeft: {
        flex: 1,
        paddingRight: 8,
    },
    companyText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    roleText: {
        marginTop: 2,
        fontSize: 13,
        color: "#e5e7eb", // slate-200
    },
    infoRight: {
        alignItems: "flex-end",
        marginLeft: 8,
    },
    appliedText: {
        marginTop: 4,
        fontSize: 11,
        color: "#9ca3af", // slate-400
    },
    deadlineRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    deadlineText: {
        fontSize: 11,
        color: "#9ca3af",
        marginRight: 6,
    },
    ddayBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: "rgba(244, 63, 94, 0.12)", // rose-500/12
    },
    ddayText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#fb7185", // rose-400
    },
    actionsRow: {
        marginTop: 6,
        flexDirection: "row",
    },
    actionText: {
        fontSize: 11,
        color: "#fda4af", // rose-300-ish
        marginLeft: 8,
    },
});