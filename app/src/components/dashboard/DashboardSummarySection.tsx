// app/src/components/dashboard/DashboardSummarySection.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
} from "firebase/firestore";

import { auth, db } from "../../libs/firebase";
import { SectionCard } from "../common/SectionCard";

type SummaryCounts = {
    totalApplications: number;
    inProgressApplications: number;
    todayTasks: number;
    upcomingInterviews: number;
};

type ApplicationDoc = {
    status?: string | null;
};

type TaskDoc = {
    done?: boolean;
    scope?: string | null;
    ddayLabel?: string | null;
};

type InterviewDoc = {
    scheduledAt?: Timestamp | null;
};

export function DashboardSummarySection() {
    const [counts, setCounts] = useState<SummaryCounts>({
        totalApplications: 0,
        inProgressApplications: 0,
        todayTasks: 0,
        upcomingInterviews: 0,
    });
    const [loading, setLoading] = useState(true);

    const loadSummary = async () => {
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                setCounts({
                    totalApplications: 0,
                    inProgressApplications: 0,
                    todayTasks: 0,
                    upcomingInterviews: 0,
                });
                return;
            }

            const uid = user.uid;
            const now = new Date();

            // 1) 지원 현황 요약
            const applicationsCol = collection(db, "users", uid, "applications");
            const applicationsSnap = await getDocs(applicationsCol);

            let totalApplications = 0;
            let inProgressApplications = 0;

            applicationsSnap.forEach((docSnap) => {
                totalApplications += 1;
                const data = docSnap.data() as ApplicationDoc;
                const status = data.status ?? "";

                if (status !== "최종 합격" && status !== "불합격") {
                    inProgressApplications += 1;
                }
            });

            // 2) 오늘 할 일 개수 (플래너 today 범위 + 미완료)
            const tasksCol = collection(db, "users", uid, "tasks");
            const tasksSnap = await getDocs(tasksCol);

            let todayTasks = 0;

            tasksSnap.forEach((docSnap) => {
                const data = docSnap.data() as TaskDoc;
                const done = data.done ?? false;
                const scope = data.scope ?? "today";

                if (!done && scope === "today") {
                    todayTasks += 1;
                }
            });

            // 3) 앞으로 다가오는 면접 개수 (현재 시각 이후)
            const interviewsCol = collection(db, "users", uid, "interviews");
            const nowTs = Timestamp.fromDate(now);
            const interviewsQuery = query(
                interviewsCol,
                where("scheduledAt", ">=", nowTs),
            );
            const interviewsSnap = await getDocs(interviewsQuery);

            let upcomingInterviews = 0;
            interviewsSnap.forEach((docSnap) => {
                const data = docSnap.data() as InterviewDoc;
                if (data.scheduledAt) {
                    upcomingInterviews += 1;
                }
            });

            setCounts({
                totalApplications,
                inProgressApplications,
                todayTasks,
                upcomingInterviews,
            });
        } catch (error) {
            console.error("대시보드 요약 정보 불러오기 실패:", error);
            setCounts({
                totalApplications: 0,
                inProgressApplications: 0,
                todayTasks: 0,
                upcomingInterviews: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSummary();
    }, []);

    return (
        <SectionCard title="오늘의 취준 요약">
            {loading ? (
                <View style={styles.grid}>
                    {[0, 1, 2, 3].map((i) => (
                        <View key={i} style={[styles.card, styles.loadingCard]} />
                    ))}
                </View>
            ) : (
                <View style={styles.grid}>
                    <View style={styles.card}>
                        <Text style={styles.label}>전체 지원</Text>
                        <Text style={styles.value}>{counts.totalApplications}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.label}>진행 중 공고</Text>
                        <Text style={styles.value}>{counts.inProgressApplications}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.label}>오늘 할 일</Text>
                        <Text style={styles.value}>{counts.todayTasks}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.label}>다가오는 면접</Text>
                        <Text style={styles.value}>{counts.upcomingInterviews}</Text>
                    </View>
                </View>
            )}
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%", // 2열
        marginBottom: 8,
        borderRadius: 12,
        padding: 12,
        backgroundColor: "rgba(15,23,42,0.8)", // slate-900/60 느낌
    },
    loadingCard: {
        backgroundColor: "rgba(30,64,175,0.25)", // 살짝 펄스 느낌 색
    },
    label: {
        fontSize: 11,
        fontWeight: "500",
        color: "#94a3b8", // slate-400
    },
    value: {
        marginTop: 4,
        fontSize: 22,
        fontWeight: "700",
        color: "#ffffff",
    },
});