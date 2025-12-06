import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { SectionCard } from "../common/SectionCard";
import { DashboardApplicationItem } from "./DashboardApplicationItem";
import { auth, db } from "../../libs/firebase";
import type { ApplicationStatus } from "../applications/types";

type ApplicationDoc = {
  company?: string;
  position?: string;
  role?: string;
  status?: ApplicationStatus;
  appliedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  deadline?: Timestamp | null;
};

type RecentApplicationItem = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  dateLabel: string;
};

function formatDeadlineLabel(deadline?: Timestamp | null): string {
  if (!deadline) {
    return "마감일 없음";
  }
  const date = deadline.toDate();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day} 마감`;
}

export function DashboardRecentApplicationsSection() {
  const [items, setItems] = useState<RecentApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setItems([]);
          return;
        }

        const colRef = collection(db, "users", user.uid, "applications");
        const q = query(colRef, orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);

        const rows: RecentApplicationItem[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as ApplicationDoc;
          return {
            id: docSnap.id,
            company: data.company ?? "",
            role: data.position ?? data.role ?? "",
            status: (data.status ?? "지원 예정") as ApplicationStatus,
            dateLabel: formatDeadlineLabel(data.deadline ?? null),
          };
        });

        setItems(rows);
      } catch (error) {
        console.error("대시보드 최근 지원 내역 로드 실패:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <SectionCard title="최근 지원 내역">
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-md bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400">
          아직 기록한 지원 내역이 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((app) => (
            <DashboardApplicationItem key={app.id} {...app} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}