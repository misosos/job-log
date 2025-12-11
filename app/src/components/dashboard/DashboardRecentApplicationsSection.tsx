// app/src/components/dashboard/DashboardRecentApplicationsSection.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
} from "firebase/firestore";

import { SectionCard } from "../common/SectionCard";
import { auth, db } from "../../libs/firebase";
import type { ApplicationStatus } from "../../features/applications/types";

type ApplicationDoc = {
    company?: string;
    position?: string;
    role?: string;
    status?: ApplicationStatus;
    appliedAt?: Timestamp | null;
    createdAt?: Timestamp | null;
    deadline?: Timestamp | null;
};

type ApplicationRow = {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAtLabel: string;
    deadline: Timestamp | null;
};

function formatDeadlineLabel(deadline?: Timestamp | null): string {
    if (!deadline) {
        return "마감일 없음";
    }
    const date = deadline.toDate();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day} 마감`;
}

function getStatusColor(status: ApplicationStatus): string {
    switch (status) {
        case "지원 예정":
            return "#9ca3af"; // slate-400
        case "서류 제출":
            return "#38bdf8"; // sky-400
        case "서류 통과":
            return "#a855f7"; // purple-500
        case "면접 진행":
            return "#f97316"; // orange-500
        case "최종 합격":
            return "#22c55e"; // green-500
        case "불합격":
            return "#f87171"; // red-400
        default:
            return "#9ca3af";
    }
}

export function DashboardRecentApplicationsSection() {
    const [items, setItems] = useState<ApplicationRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) {
                    setItems([]);
                    return;
                }

                const colRef = collection(db, "users", user.uid, "applications");
                const q = query(colRef, orderBy("createdAt", "desc"), limit(5));
                const snap = await getDocs(q);

                const rows: ApplicationRow[] = snap.docs.map((docSnap) => {
                    const data = docSnap.data() as ApplicationDoc;
                    const status = (data.status ?? "지원 예정") as ApplicationStatus;

                    return {
                        id: docSnap.id,
                        company: data.company ?? "",
                        role: data.position ?? data.role ?? "",
                        status,
                        appliedAtLabel: formatDeadlineLabel(data.deadline ?? null),
                        deadline: data.deadline ?? null,
                    };
                });

                setItems(rows);
            } catch (error) {
                console.error("대시보드 최근 지원 내역 로드 실패:", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

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
                <ScrollView
                    style={styles.listContainer}
                    contentContainerStyle={styles.listContent}
                >
                    {items.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemMain}>
                                <Text style={styles.companyText}>{item.company}</Text>
                                <Text style={styles.roleText}>{item.role}</Text>
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(item.status) },
                                    ]}
                                >
                                    {item.status}
                                </Text>
                            </View>
                            <View style={styles.deadlineBox}>
                                <Text style={styles.deadlineText}>{item.appliedAtLabel}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
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
    emptyText: {
        fontSize: 13,
        color: "#9ca3af", // slate-400
    },
    listContainer: {
        maxHeight: 260,
    },
    listContent: {
        gap: 8,
        paddingTop: 4,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "rgba(15,23,42,0.8)", // slate-900/80 느낌
    },
    itemMain: {
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
    statusText: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "500",
    },
    deadlineBox: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(15,23,42,0.9)",
        borderWidth: 1,
        borderColor: "#4b5563", // slate-600
    },
    deadlineText: {
        fontSize: 11,
        color: "#e5e7eb",
    },
});