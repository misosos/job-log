// src/pages/planner/PlannerPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { SectionCard } from "../../components/common/SectionCard";
import { auth, db } from "../../libs/firebase";
import type { PlannerScope, PlannerTask } from "../../features/planner/types";
import { PlannerTaskItem } from "../../components/planner/PlannerTaskItem";

// Firestore에 저장된 문서 타입
type PlannerTaskDoc = {
  title?: string;
  ddayLabel?: string;
  done?: boolean;
  scope?: PlannerScope;
  createdAt?: unknown;
};

export function PlannerPage() {
  const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
  const [weekTasks, setWeekTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 새 할 일 추가용 상태
  const [newTitle, setNewTitle] = useState("");
  const [newScope, setNewScope] = useState<PlannerScope>("today");
  const [newDdayLabel, setNewDdayLabel] = useState("오늘");
  const [saving, setSaving] = useState(false);

  //  Firestore에서 할 일 불러오기
  const loadTasks = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setTodayTasks([]);
        setWeekTasks([]);
        return;
      }

      const colRef = collection(db, "users", user.uid, "tasks");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

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

      setTodayTasks(all.filter((t) => t.scope === "today"));
      setWeekTasks(all.filter((t) => t.scope === "week"));
    } catch (error) {
      console.error("플래너 태스크 불러오기 실패:", error);
      setTodayTasks([]);
      setWeekTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  //  새 할 일 추가 → Firestore + 로컬 상태 반영
  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const user = auth.currentUser;
    if (!user) {
      console.warn("로그인이 필요합니다.");
      return;
    }

    setSaving(true);
    try {
      const colRef = collection(db, "users", user.uid, "tasks");

      const payload = {
        title: trimmedTitle,
        ddayLabel: newDdayLabel.trim() || "오늘",
        done: false,
        scope: newScope,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(colRef, payload);

      const newTask: PlannerTask = {
        id: docRef.id,
        title: payload.title,
        ddayLabel: payload.ddayLabel,
        done: false,
        scope: newScope,
      };

      if (newScope === "today") {
        setTodayTasks((prev) => [newTask, ...prev]);
      } else {
        setWeekTasks((prev) => [newTask, ...prev]);
      }

      setNewTitle("");
      // scope/ddayLabel은 유지
    } catch (error) {
      console.error("할 일 추가 실패:", error);
    } finally {
      setSaving(false);
    }
  };

  //  완료 토글 → Firestore + 로컬 상태 동기화
  const toggleTask =
    (group: PlannerScope) =>
    async (id: string): Promise<void> => {
      const user = auth.currentUser;
      if (!user) return;

      let newDone: boolean | undefined;

      if (group === "today") {
        setTodayTasks((prev) =>
          prev.map((task) => {
            if (task.id === id) {
              const updated = { ...task, done: !task.done };
              newDone = updated.done;
              return updated;
            }
            return task;
          }),
        );
      } else {
        setWeekTasks((prev) =>
          prev.map((task) => {
            if (task.id === id) {
              const updated = { ...task, done: !task.done };
              newDone = updated.done;
              return updated;
            }
            return task;
          }),
        );
      }

      if (typeof newDone === "undefined") return;

      try {
        const taskRef = doc(db, "users", user.uid, "tasks", id);
        await updateDoc(taskRef, { done: newDone });
      } catch (error) {
        console.error("할 일 완료 상태 변경 실패:", error);
      }
    };

  return (
    <div className="space-y-6">
      {/* 새 할 일 추가 섹션 */}
      <SectionCard title="새 할 일 추가">
        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="예: 카카오페이 공고 JD 분석"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">범위</span>
              <select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as PlannerScope)}
                className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="today">오늘 할 일</option>
                <option value="week">이번 주 계획</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">D-Day 라벨</span>
              <input
                type="text"
                value={newDdayLabel}
                onChange={(e) => setNewDdayLabel(e.target.value)}
                className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="D-3, 오늘"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="ml-auto rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-900 disabled:opacity-60 hover:bg-emerald-400"
            >
              {saving ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="오늘 할 일">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-md bg-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <p className="text-sm text-slate-400">
            오늘은 아직 등록된 할 일이 없어요.
          </p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <PlannerTaskItem
                key={task.id}
                task={task}
                onToggle={() => {
                  void toggleTask("today")(task.id);
                }}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="이번 주 계획">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-md bg-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : weekTasks.length === 0 ? (
          <p className="text-sm text-slate-400">
            한 주 단위의 공부/지원 계획을 여기에 정리할 수 있어요.
          </p>
        ) : (
          <div className="space-y-2">
            {weekTasks.map((task) => (
              <PlannerTaskItem
                key={task.id}
                task={task}
                onToggle={() => {
                  void toggleTask("week")(task.id);
                }}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}