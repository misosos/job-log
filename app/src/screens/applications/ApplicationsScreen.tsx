// app/screens/ApplicationsScreen.tsx

import React from "react";
import { ScrollView, View, StyleSheet, Alert } from "react-native";

import { ApplicationList } from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";

import type { ApplicationStatus } from "../../components/common/ApplicationStatusBadge";
import type { ApplicationRow } from "../../features/applications/types";
import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

export function ApplicationsScreen() {
    const {
        // 폼 상태
        newCompany,
        newRole,
        newStatus,
        newDeadline,
        setNewCompany,
        setNewRole,
        setNewStatus,
        setNewDeadline,

        // 생성
        saving,
        saveError,
        handleCreate,

        // 목록/요약
        applications,
        loading,
        totalCount,
        inProgressCount,
        dueThisWeekCount,

        // 수정
        editingTarget,
        editSaving,
        editError,
        handleOpenEdit,
        handleSaveEdit,
        handleCloseEdit,

        // 삭제
        handleDelete,
    } = useApplicationsPageController();

    // RN 폼 onSubmit은 이벤트가 없으니까 그냥 래핑
    const handleCreatePress = () => {
        void handleCreate();
    };

    const handleDeleteWithConfirm = (id: string) => {
        Alert.alert(
            "지원 내역 삭제",
            "이 지원 내역을 삭제할까요?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => {
                        void handleDelete(id);
                    },
                },
            ],
            { cancelable: true },
        );
    };

    const handleOpenEditRow = (row: ApplicationRow) => {
        handleOpenEdit(row);
    };

    const handleSaveEditStatus = async (id: string, status: ApplicationStatus) => {
        await handleSaveEdit(id, status);
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
                    onSubmit={handleCreatePress}
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
                    onEdit={handleOpenEditRow}
                    onDelete={handleDeleteWithConfirm}
                />
            </View>

            <ApplicationEditModal
                open={!!editingTarget}
                target={editingTarget}
                saving={editSaving}
                error={editError}
                onClose={handleCloseEdit}
                onSave={handleSaveEditStatus}
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