import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { SectionCard } from "../common/SectionCard.tsx";
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
            <div
              key={task.id}
              className="flex items-center justify-between rounded-md bg-slate-900/60 px-3 py-2"
            >
              <span
                className={
                  task.done
                    ? "text-sm text-slate-400 line-through"
                    : "text-sm text-slate-100"
                }
              >
                {task.title}
              </span>
              {task.ddayLabel && (
                <span className="text-xs text-slate-400">
                  {task.ddayLabel}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}