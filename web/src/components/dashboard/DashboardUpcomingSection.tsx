import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import {
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from "flowbite-react";
import { HiCalendar } from "react-icons/hi";

import { auth, db } from "../../libs/firebase";
// import { UpcomingInterviewsSection } from "../interviews/UpcomingInterviewsSection";
import { SectionCard } from "../common/SectionCard";
import type { InterviewItem } from "../../features/interviews/interviews";

// Firestore 인터뷰 문서 타입
type InterviewDoc = {
  company?: string;
  role?: string;
  type?: string;
  scheduledAt?: Timestamp | null;
};

export function DashboardUpcomingSection() {
  const [items, setItems] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUpcomingInterviews = async () => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setItems([]);
        return;
      }

      const now = new Date();
      const nowTs = Timestamp.fromDate(now);

      // users/{uid}/interviews 컬렉션에서
      // 현재 시각 이후(scheduledAt >= now) 면접만 가져오기 (가장 가까운 3개)
      const colRef = collection(db, "users", user.uid, "interviews");
      const q = query(
        colRef,
        where("scheduledAt", ">=", nowTs),
        orderBy("scheduledAt", "asc"),
        limit(3),
      );

      const snap = await getDocs(q);

      const mapped: InterviewItem[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as InterviewDoc;
        const ts = data.scheduledAt ?? null;
        const date = ts ? ts.toDate() : null;

        const month = date ? String(date.getMonth() + 1).padStart(2, "0") : "";
        const day = date ? String(date.getDate()).padStart(2, "0") : "";
        const hours = date ? String(date.getHours()).padStart(2, "0") : "";
        const minutes = date ? String(date.getMinutes()).padStart(2, "0") : "";

        const scheduledAtLabel = date
          ? `${month}.${day} ${hours}:${minutes}`
          : "일정 미정";

        return {
          id: docSnap.id,
          company: data.company ?? "",
          role: data.role ?? "",
          type: data.type,
          scheduledAt: ts,
          scheduledAtLabel,
          status: "예정",
          note: "",
        };
      });

      // 쿼리에서 이미 가장 가까운 3개만 가져옴
      setItems(mapped);
    } catch (error) {
      console.error("다가오는 면접 불러오기 실패:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUpcomingInterviews();
  }, []);

  return (
    <SectionCard title="다가오는 면접">
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-700" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-700" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-300">
          앞으로 예정된 면접이 없어요. 인터뷰 페이지에서 새로운 면접 일정을 추가해보세요.
        </p>
      ) : (
        <Timeline>
          {items.map((item) => (
            <TimelineItem key={item.id}>
              <TimelinePoint icon={HiCalendar} />
              <TimelineContent>
                <TimelineTime>{item.scheduledAtLabel}</TimelineTime>
                <TimelineTitle>
                  {item.company || "회사 미입력"}
                  {item.role && ` · ${item.role}`}
                </TimelineTitle>
                <TimelineBody>
                  {item.type ? `${item.type} 면접` : "면접 유형 미입력"}
                </TimelineBody>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </SectionCard>
  );
}
