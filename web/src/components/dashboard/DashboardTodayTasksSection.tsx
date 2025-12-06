import { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

import { SectionCard } from "../common/SectionCard.tsx";
import { auth, db } from "../../libs/firebase";
import { PlannerTaskItem } from "../planner/PlannerTaskItem.tsx";
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

  // 오늘 할 일 토글 (완료/미완료)
  const handleToggle = async (taskId: string, currentDone: boolean) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const taskRef = doc(db, "users", user.uid, "tasks", taskId);
      await updateDoc(taskRef, { done: !currentDone });

      // 로컬 상태도 함께 갱신
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, done: !currentDone } : t,
        ),
      );
    } catch (error) {
      console.error("대시보드 오늘 할 일 토글 실패:", error);
    }
  };

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
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-full rounded-md bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-slate-400">
          오늘은 아직 등록된 할 일이 없어요. 플래너에서 할 일을 추가해 보세요.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <PlannerTaskItem
              key={task.id}
              task={task}
              onToggle={() => {
                void handleToggle(task.id, task.done);
              }}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}