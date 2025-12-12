import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

import { SectionCard } from "../common/SectionCard";
import { useApplications } from "../../features/applications/useApplications";
import { usePlanner } from "../../features/planner/usePlanner";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";
import { useAuth } from "../../libs/auth-context";

export function DashboardSummarySection() {
  const { user } = useAuth();
  // 지원 현황: 공통 useApplications 훅 재사용
  const {
    loading: applicationsLoading,
    totalCount,
    inProgressCount,
  } = useApplications();

  // 플래너: 오늘 할 일 / 이번 주 계획 훅 재사용
  const {
    todayTasks,
    loading: plannerLoading,
  } = usePlanner();

  // 면접: 다가오는 면접 목록 훅 재사용
  const {
    upcoming,
    loading: interviewsLoading,
  } = useInterviewPageController(user ? user.uid : null);

  // 로딩 상태 통합
  const loading = applicationsLoading || plannerLoading || interviewsLoading;

  // 요약 데이터 메모이즈
  const summary = useMemo(
    () => ({
      totalApplications: totalCount,
      inProgressApplications: inProgressCount,
      todayTasks: todayTasks.length,
      upcomingInterviews: upcoming.length,
    }),
    [totalCount, inProgressCount, todayTasks.length, upcoming.length],
  );

  return (
    <SectionCard title="오늘의 취준 요약">
      {loading ? (
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <ActivityIndicator size="small" color="#64748b" />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>전체 지원</Text>
            <Text style={styles.value}>{summary.totalApplications}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>진행 중 공고</Text>
            <Text style={styles.value}>{summary.inProgressApplications}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>오늘 할 일</Text>
            <Text style={styles.value}>{summary.todayTasks}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>다가오는 면접</Text>
            <Text style={styles.value}>{summary.upcomingInterviews}</Text>
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
    marginHorizontal: -4,
  },
  skeletonCard: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
    height: 80,
    borderRadius: 12,
    backgroundColor: "rgba(15,23,42,0.8)", // slate-900/80
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: "#94a3b8", // text-slate-400
  },
  value: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "700",
    color: "#f9fafb", // text-slate-50
  },
});