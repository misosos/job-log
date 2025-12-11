import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";

import { SectionCard } from "../common/SectionCard";
import { auth, db } from "../../libs/firebase";
import type { PlannerTask } from "../../features/planner/types";

// Firestore에 저장된 플래너 태스크 원본 타입
type PlannerTaskDoc = {
  title?: string;
  ddayLabel?: string;
  done?: boolean;
  scope?: "today" | "week";
};

export function DashboardTodayTasksSection() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayTasks = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setTasks([]);
          return;
        }

        const colRef = collection(db, "users", user.uid, "tasks");
        const snap = await getDocs(colRef);

        const all: PlannerTask[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as PlannerTaskDoc;
          return {
            id: docSnap.id,
            title: data.title ?? "",
            ddayLabel: data.ddayLabel ?? "",
            done: data.done ?? false,
            scope: data.scope ?? "today",
          };
        });

        // 오늘(scope === "today")인 태스크만, 최대 3개 정도만 보여주기
        const todayTasks = all.filter((task) => task.scope === "today");
        setTasks(todayTasks.slice(0, 3));
      } catch (error) {
        console.error("대시보드 오늘 할 일 불러오기 실패:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTodayTasks();
  }, []);

  return (
    <SectionCard title="오늘 할 일">
      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonItem} />
          ))}
        </View>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>
          오늘은 아직 등록된 할 일이 없어요. 플래너에서 할 일을 추가해 보세요.
        </Text>
      ) : (
        <View style={styles.list}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <Text style={task.done ? styles.taskTextDone : styles.taskText}>
                {task.title}
              </Text>
              {!!task.ddayLabel && (
                <Text style={styles.ddayText}>{task.ddayLabel}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    gap: 6,
  },
  skeletonItem: {
    height: 36,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "rgba(30,41,59,0.6)", // slate-800/60 느낌
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af", // slate-400
  },
  list: {
    gap: 8,
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