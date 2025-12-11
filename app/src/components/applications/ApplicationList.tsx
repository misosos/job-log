// app/src/components/applications/ApplicationList.tsx
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import type { Timestamp } from "firebase/firestore";

// 👉 앱용 ApplicationStatusBadge 가 이미 있다면 이 경로에 맞춰서 import 해줘
import {
    ApplicationStatusBadge,
    type ApplicationStatus,
} from "../common/ApplicationStatusBadge";

export type ApplicationRow = {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAtLabel: string;
    deadline: Timestamp | null;
};

type Props = {
    loading: boolean;
    applications: ApplicationRow[];
    onEdit?: (row: ApplicationRow) => void;
    onDelete?: (id: string) => void;
};

function formatDeadline(deadline: Timestamp | null): string {
    if (!deadline) return "-";
    const d = deadline.toDate();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

function formatDday(deadline: Timestamp | null): string {
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

export function ApplicationList({
                                    loading,
                                    applications,
                                    onEdit,
                                    onDelete,
                                }: Props) {
    if (loading) {
        return (
            <View style={styles.card}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#22c55e" />
                    <Text style={styles.loadingText}>지원 내역을 불러오는 중입니다…</Text>
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

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.countText}>
                    총 {applications.length}건의 지원 내역
                </Text>
            </View>

            <ScrollView>
                {applications.map((app, index) => {
                    const deadlineLabel = formatDeadline(app.deadline);
                    const dday = formatDday(app.deadline);
                    const isLast = index === applications.length - 1;

                    return (
                        <View
                            key={app.id}
                            style={[styles.row, !isLast && styles.rowDivider]}
                        >
                            {/* 회사 / 직무 */}
                            <View style={styles.infoLeft}>
                                <Text style={styles.companyText}>{app.company}</Text>
                                <Text style={styles.roleText}>{app.role}</Text>
                            </View>

                            {/* 상태 / 날짜 / 액션 */}
                            <View style={styles.infoRight}>
                                <ApplicationStatusBadge status={app.status} />
                                <Text style={styles.appliedText}>
                                    {app.appliedAtLabel || "-"}
                                </Text>

                                {app.deadline && (
                                    <View style={styles.deadlineRow}>
                                        <Text style={styles.deadlineText}>
                                            마감 {deadlineLabel}
                                        </Text>
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
                })}
            </ScrollView>
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
        marginBottom: 8,
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
        flexShrink: 1,
        paddingRight: 8,
    },
    companyText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    roleText: {
        marginTop: 2,
        fontSize: 12,
        color: "#e5e7eb", // slate-200
    },
    infoRight: {
        alignItems: "flex-end",
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
        backgroundColor: "rgba(244, 63, 94, 0.1)", // rose-500/10
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