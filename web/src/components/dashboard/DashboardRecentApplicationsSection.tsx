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
import { auth, db } from "../../libs/firebase";
import {
  ApplicationList,
  type ApplicationRow,
} from "../applications/ApplicationList";
import type { ApplicationStatus } from "../../features/applications/types.ts";

type ApplicationDoc = {
  company?: string;
  position?: string;
  role?: string;
  status?: ApplicationStatus;
  appliedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  deadline?: Timestamp | null;
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
  const [items, setItems] = useState<ApplicationRow[]>([]);
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

        const rows: ApplicationRow[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as ApplicationDoc;
          return {
            id: docSnap.id,
            company: data.company ?? "",
            role: data.position ?? data.role ?? "",
            status: (data.status ?? "지원 예정") as ApplicationStatus,
            appliedAtLabel: formatDeadlineLabel(data.deadline ?? null),
            deadline: data.deadline ?? null,
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
      <ApplicationList loading={loading} applications={items} />
    </SectionCard>
  );
}