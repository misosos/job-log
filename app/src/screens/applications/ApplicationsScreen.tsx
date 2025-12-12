// app/screens/ApplicationsScreen.tsx

import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Alert } from "react-native";

import {ApplicationList,} from "../../components/applications/ApplicationList";
import {ApplicationRow} from "../../features/applications/types";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";

import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationStatus } from "../../components/common/ApplicationStatusBadge";

const DEFAULT_STATUS: ApplicationStatus = "지원 예정";

export function ApplicationsScreen() {
    const {
        applications,
        loading,
        // 생성
        create,
        saving,
        saveError,
        // 수정
        editingTarget,
        openEdit,
        closeEdit,
        saveEdit,
        editSaving,
        editError,
        // 삭제
        remove,
        // 요약
        totalCount,
        inProgressCount,
        dueThisWeekCount,
    } = useApplications();

    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] =
        useState<ApplicationStatus>(DEFAULT_STATUS);
    const [newDeadline, setNewDeadline] = useState(""); // YYYY-MM-DD

    const handleCreate = async () => {
        // 검증은 훅 안에서 해도 되지만, 여기서 한 번 걸러줘도 됨
        if (!newCompany.trim() || !newRole.trim()) return;

        await create({
            company: newCompany,
            role: newRole,
            status: newStatus,
            deadline: newDeadline,
        });

        // 성공/실패 여부까지 관리하고 싶으면
        // create가 boolean을 리턴하도록 바꿔도 됨.
        setNewCompany("");
        setNewRole("");
        setNewStatus(DEFAULT_STATUS);
        setNewDeadline("");
    };

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
                            await remove(id);
                        } catch (e) {
                            console.error("지원 내역 삭제 실패:", e);
                        }
                    },
                },
            ],
            { cancelable: true },
        );
    };

    const handleOpenEdit = (row: ApplicationRow) => {
        openEdit(row);
    };

    const handleSaveEdit = async (id: string, status: ApplicationStatus) => {
        await saveEdit(id, status);
    };

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
                onClose={closeEdit}
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