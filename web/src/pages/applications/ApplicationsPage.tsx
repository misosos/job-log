// src/pages/applications/ApplicationsPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";

import { auth, db } from "../../libs/firebase";
import type { ApplicationStatus } from "../../components/common/ApplicationStatusBadge";
import {
  ApplicationList,
  type ApplicationRow,
} from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { createApplication } from "../../features/applications/api";

// Firestore 문서 원본 타입
type ApplicationDoc = {
  company?: string;
  position?: string;
  role?: string;
  status?: ApplicationStatus;
  appliedAt?: Timestamp | null;
  deadline?: Timestamp | null;
};

function formatAppliedLabel(appliedAt?: Timestamp | null): string {
  if (!appliedAt) return "";
  const date = appliedAt.toDate();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day} 지원`;
}

function isWithinNext7Days(deadline?: Timestamp | null): boolean {
  if (!deadline) return false;
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  const target = deadline.toDate();
  return target >= now && target <= end;
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 새 지원 추가용 상태
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Firestore에서 지원 리스트 로드
  const load = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn("로그인이 필요합니다.");
        setApplications([]);
        return;
      }

      const colRef = collection(db, "users", user.uid, "applications");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const rows: ApplicationRow[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as ApplicationDoc;
        return {
          id: docSnap.id,
          company: data.company ?? "",
          role: data.position ?? data.role ?? "",
          status: (data.status ?? "지원 예정") as ApplicationStatus,
          appliedAtLabel: formatAppliedLabel(data.appliedAt ?? null),
          deadline: data.deadline ?? null,
        };
      });

      setApplications(rows);
    } catch (error) {
      console.error("지원 내역 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // 새 지원 기록 추가
  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newCompany.trim() || !newRole.trim()) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await createApplication({
        company: newCompany.trim(),
        position: newRole.trim(),
      });

      setNewCompany("");
      setNewRole("");

      await load(); // 저장 후 리스트 새로고침
    } catch (error) {
      console.error("지원 내역 저장 실패:", error);
      setSaveError("지원 내역을 저장하는 중 문제가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const totalCount = applications.length;
  // 최종 합격/불합격이 아닌 건 다 '진행 중'으로 카운트
  const inProgressCount = applications.filter(
    (app) => app.status !== "최종 합격" && app.status !== "불합격",
  ).length;
  const dueThisWeekCount = applications.filter((app) =>
    isWithinNext7Days(app.deadline),
  ).length;

  return (
    <div className="space-y-6">
      <ApplicationCreateForm
        company={newCompany}
        role={newRole}
        saving={saving}
        error={saveError}
        onCompanyChange={setNewCompany}
        onRoleChange={setNewRole}
        onSubmit={handleCreate}
      />

      <ApplicationSummary
        loading={loading}
        total={totalCount}
        inProgress={inProgressCount}
        dueThisWeek={dueThisWeekCount}
      />

      <ApplicationList loading={loading} applications={applications} />
    </div>
  );
}