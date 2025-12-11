// app/src/components/applications/ApplicationSummary.tsx
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

type Props = {
  loading: boolean;
  total: number;
  inProgress: number;
  dueThisWeek: number;
};

export function ApplicationSummary({
  loading,
  total,
  inProgress,
  dueThisWeek,
}: Props) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.headerRow}>
        <Text style={styles.title}>지원 현황 요약</Text>
        {loading && (
          <ActivityIndicator size="small" color="#22c55e" />
        )}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>불러오는 중...</Text>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>전체</Text>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statSub}>지원</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxHighlight]}>
            <Text style={[styles.statLabel, styles.inProgressLabel]}>
              진행 중
            </Text>
            <Text style={[styles.statValue, styles.inProgressValue]}>
              {inProgress}
            </Text>
            <Text style={styles.statSub}>검토·진행 상태</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statLabel, styles.dueThisWeekLabel]}>
              이번 주 마감
            </Text>
            <Text style={[styles.statValue, styles.dueThisWeekValue]}>
              {dueThisWeek}
            </Text>
            <Text style={styles.statSub}>D-7 내 마감</Text>
          </View>
        </View>
      )}
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
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb", // slate-200
  },
  loadingText: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af", // slate-400
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  } as any, // gap 지원 안 되는 환경 대비, 필요시 margin으로 조정
  statBox: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#020617", // card와 통일감
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
  },
  statBoxHighlight: {
    backgroundColor: "#022c22", // emerald-900 느낌
    borderColor: "#10b981", // emerald-500
  },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  statSub: {
    marginTop: 2,
    fontSize: 10,
    color: "#6b7280",
  },
  inProgressLabel: {
    color: "#6ee7b7",
  },
  inProgressValue: {
    color: "#bbf7d0",
  },
  dueThisWeekLabel: {
    color: "#e5e7eb",
  },
  dueThisWeekValue: {
    color: "#facc15", // amber-400
  },
});