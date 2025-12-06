import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

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
  completed?: boolean;
  dueDate?: Timestamp | null;
};

type InterviewDoc = {
  scheduledAt?: Timestamp | null;
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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

      // 2) 오늘 할 일 개수 (미완료 + 오늘 마감)
      const tasksCol = collection(db, "users", uid, "tasks");
      const tasksSnap = await getDocs(tasksCol);

      let todayTasks = 0;

      tasksSnap.forEach((docSnap) => {
        const data = docSnap.data() as TaskDoc;
        if (data.completed) return;

        if (data.dueDate) {
          const due = data.dueDate.toDate();
          if (isSameDay(due, now)) {
            todayTasks += 1;
          }
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="h-20 animate-pulse rounded-lg bg-slate-800/60" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-800/60" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-800/60" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-800/60" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-900/60 p-4">
            <p className="text-xs font-medium text-slate-400">전체 지원</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {counts.totalApplications}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-4">
            <p className="text-xs font-medium text-slate-400">진행 중 공고</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {counts.inProgressApplications}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-4">
            <p className="text-xs font-medium text-slate-400">오늘 할 일</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {counts.todayTasks}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-4">
            <p className="text-xs font-medium text-slate-400">
              다가오는 면접
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {counts.upcomingInterviews}
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
