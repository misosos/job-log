// app/screens/ApplicationsScreen.tsx (예시 경로)

import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Alert } from "react-native";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";

import { auth, db } from "../../libs/firebase";
import {
    ApplicationList,
    type ApplicationRow,
} from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import {
    createApplication,
    updateApplication,
    deleteApplication,
} from "../../features/applications/api";
import type { ApplicationStatus } from "../../components/common/ApplicationStatusBadge";

// Firestore 문서 원본 타입
type ApplicationDoc = {
    company?: string;
    position?: string;
    role?: string;
    status?: ApplicationStatus;
    appliedAt?: Timestamp | null;
    deadline?: Timestamp | null;
};

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

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

export function ApplicationsScreen() {
    const [applications, setApplications] = useState<ApplicationRow[]>([]);
    const [loading, setLoading] = useState(true);

    // 새 지원 추가용 상태
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] =
        useState<ApplicationStatus>(DEFAULT_STATUS);
    const [newDeadline, setNewDeadline] = useState(""); // YYYY-MM-DD 문자열
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // 수정/삭제용 상태
    const [editingTarget, setEditingTarget] = useState<ApplicationRow | null>(
        null,
    );
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

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
                const status: ApplicationStatus = data.status ?? DEFAULT_STATUS;

                return {
                    id: docSnap.id,
                    company: data.company ?? "",
                    role: data.position ?? data.role ?? "",
                    status,
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

    // 새 지원 기록 추가 (React Native라 FormEvent 안 씀)
    const handleCreate = async () => {
        if (!newCompany.trim() || !newRole.trim()) {
            return;
        }

        setSaving(true);
        setSaveError(null);

        try {
            // YYYY-MM-DD 문자열을 Firestore Timestamp로 변환
            let deadlineTimestamp: Timestamp | null = null;
            if (newDeadline.trim()) {
                const [year, month, day] = newDeadline.split("-").map(Number);
                const date = new Date(year, month - 1, day);
                deadlineTimestamp = Timestamp.fromDate(date);
            }

            await createApplication({
                company: newCompany.trim(),
                position: newRole.trim(),
                status: newStatus,
                deadline: deadlineTimestamp ?? undefined,
            });

            setNewCompany("");
            setNewRole("");
            setNewStatus(DEFAULT_STATUS);
            setNewDeadline("");

            await load(); // 저장 후 리스트 새로고침
        } catch (error) {
            console.error("지원 내역 저장 실패:", error);
            setSaveError("지원 내역을 저장하는 중 문제가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    // 수정 모달 열기/닫기
    const handleOpenEdit = (row: ApplicationRow) => {
        setEditingTarget(row);
        setEditError(null);
    };

    const handleCloseEdit = () => {
        setEditingTarget(null);
    };

    // 상태 수정 저장
    const handleSaveEdit = async (id: string, status: ApplicationStatus) => {
        setEditSaving(true);
        setEditError(null);
        try {
            await updateApplication(id, { status });
            setEditingTarget(null);
            await load();
        } catch (error) {
            console.error("지원 내역 수정 실패:", error);
            setEditError("지원 내역을 수정하는 중 문제가 발생했습니다.");
        } finally {
            setEditSaving(false);
        }
    };

    // 삭제 처리 – window.confirm 대신 Alert 사용
    const handleDelete = (id: string) => {
        Alert.alert(
            "지원 내역 삭제",
            "이 지원 내역을 삭제할까요?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteApplication(id);
                            await load();
                        } catch (error) {
                            console.error("지원 내역 삭제 실패:", error);
                        }
                    },
                },
            ],
            { cancelable: true },
        );
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
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <ApplicationCreateForm
                    company={newCompany}
                    role={newRole}
                    status={newStatus}
                    deadline={newDeadline}
                    saving={saving}
                    error={saveError}
                    onCompanyChange={setNewCompany}
                    onRoleChange={setNewRole}
                    onStatusChange={setNewStatus}
                    onDeadlineChange={setNewDeadline}
                    onSubmit={handleCreate}
                />
            </View>

            <View style={styles.section}>
                <ApplicationSummary
                    loading={loading}
                    total={totalCount}
                    inProgress={inProgressCount}
                    dueThisWeek={dueThisWeekCount}
                />
            </View>

            <View style={styles.section}>
                <ApplicationList
                    loading={loading}
                    applications={applications}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                />
            </View>

            <ApplicationEditModal
                open={!!editingTarget}
                target={editingTarget}
                saving={editSaving}
                error={editError}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
});