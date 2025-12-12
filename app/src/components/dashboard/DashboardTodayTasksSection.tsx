import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { SectionCard } from "../common/SectionCard";
import { usePlanner } from "../../../../shared/features/planner/usePlanner";

export function DashboardTodayTasksSection() {
  const { todayTasks, loading } = usePlanner();

  const tasks = useMemo(
    () => todayTasks.slice(0, 3),
    [todayTasks],
  );

  return (
    <SectionCard title="오늘 할 일">
      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i, index) => (
            <View
              key={i}
              style={[
                styles.skeletonItem,
                index > 0 && styles.skeletonItemSpacing,
              ]}
            />
          ))}
        </View>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>
          오늘은 아직 등록된 할 일이 없어요. 플래너에서 할 일을 추가해 보세요.
        </Text>
      ) : (
        <View style={styles.list}>
          {tasks.map((task, index) => {
            const isLast = index === tasks.length - 1;
            return (
              <View
                key={task.id}
                style={[styles.taskRow, !isLast && styles.taskRowSpacing]}
              >
                <Text style={task.done ? styles.taskTextDone : styles.taskText}>
                  {task.title}
                </Text>
                {!!task.ddayLabel && (
                  <Text style={styles.ddayText}>{task.ddayLabel}</Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    width: "100%",
  },
  skeletonItem: {
    height: 36,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "rgba(30,41,59,0.6)", // slate-800/60 느낌
  },
  skeletonItemSpacing: {
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af", // slate-400
  },
  list: {
    width: "100%",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(15,23,42,0.6)", // slate-900/60
  },
  taskRowSpacing: {
    marginBottom: 8,
  },
  taskText: {
    fontSize: 14,
    color: "#f9fafb", // slate-100
  },
  taskTextDone: {
    fontSize: 14,
    color: "#9ca3af", // slate-400
    textDecorationLine: "line-through",
  },
  ddayText: {
    fontSize: 12,
    color: "#9ca3af", // slate-400
  },
});