// src/pages/planner/PlannerPage.tsx
import { useState } from "react";
import { SectionCard } from "../../components/common/SectionCard";

type PlannerTask = {
  id: string;
  title: string;
  ddayLabel: string; // 예: "D-3", "오늘", "이번 주"
  done: boolean;
};

export function PlannerPage() {
  const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
  const [weekTasks, setWeekTasks] = useState<PlannerTask[]>([]);

  const toggleTask =
    (group: "today" | "week") =>
    (id: string): void => {
      if (group === "today") {
        setTodayTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task,
          ),
        );
      } else {
        setWeekTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task,
          ),
        );
      }
    };

  const renderTask = (
    task: PlannerTask,
    group: "today" | "week",
  ) => {
    return (
      <button
        key={task.id}
        type="button"
        onClick={() => toggleTask(group)(task.id)}
        className="flex w-full items-center justify-between rounded-md bg-slate-800/60 px-3 py-2 text-left transition hover:bg-slate-700/70"
      >
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex h-4 w-4 items-center justify-center rounded-full border",
              task.done
                ? "border-emerald-400 bg-emerald-400"
                : "border-slate-500",
            ].join(" ")}
          >
            {task.done && (
              <span className="h-2 w-2 rounded-full bg-slate-900" />
            )}
          </span>
          <p
            className={[
              "text-sm",
              task.done ? "text-slate-400 line-through" : "text-slate-200",
            ].join(" ")}
          >
            {task.title}
          </p>
        </div>
        <span className="text-xs text-emerald-300">{task.ddayLabel}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title="오늘 할 일">
        {todayTasks.length === 0 ? (
          <p className="text-sm text-slate-400">
            오늘은 아직 등록된 할 일이 없어요. 대시보드나 다른 페이지에서
            가져오는 플로우도 나중에 붙일 수 있어요.
          </p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => renderTask(task, "today"))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="이번 주 계획">
        {weekTasks.length === 0 ? (
          <p className="text-sm text-slate-400">
            한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요.
          </p>
        ) : (
          <div className="space-y-2">
            {weekTasks.map((task) => renderTask(task, "week"))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}