// app/screens/ApplicationsScreen.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet, Alert } from "react-native";

import { ApplicationList } from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";

import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

export function ApplicationsScreen() {
    const {
        newCompany,
        newRole,
        newStatus,
        newAppliedAt,
        newDocumentDeadline,
        newInterviewAt,
        newFinalResultAt,
        setNewCompany,
        setNewRole,
        setNewStatus,
        setNewAppliedAt,
        setNewDocumentDeadline,
        setNewInterviewAt,
        setNewFinalResultAt,

        saving,
        saveError,
        handleCreate,

        applications,
        loading,
        totalCount,
        inProgressCount,

        docDueSoonCount,
        interviewSoonCount,
        finalSoonCount,

        editingTarget,
        editSaving,
        editError,
        handleOpenEdit,
        handleSaveEdit,
        handleCloseEdit,
        handleDelete,
    } = useApplicationsPageController();

    // RN confirm
    const handleDeleteWithConfirm = (id: string) => {
        Alert.alert(
            "지원 내역 삭제",
            "이 지원 내역을 삭제할까요?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => void handleDelete(id),
                },
            ],
            { cancelable: true },
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* header */}
            <View style={styles.header}>
                <Text style={styles.title}>지원 현황</Text>
                <Text style={styles.subtitle}>
                    지원한 공고를 한눈에 정리하고, 마감 일정 위주로 관리해요.
                </Text>
            </View>

            {/* form */}
            <View style={styles.section}>
                <ApplicationCreateForm
                    company={newCompany}
                    position={newRole}
                    status={newStatus}
                    appliedAt={newAppliedAt}
                    onAppliedAtChange={setNewAppliedAt}
                    docDeadline={newDocumentDeadline}
                    interviewAt={newInterviewAt}
                    finalResultAt={newFinalResultAt}
                    saving={saving}
                    error={saveError}
                    onCompanyChange={setNewCompany}
                    onPositionChange={setNewRole}
                    onStatusChange={setNewStatus}
                    onDocDeadlineChange={setNewDocumentDeadline}
                    onInterviewAtChange={setNewInterviewAt}
                    onFinalResultAtChange={setNewFinalResultAt}
                    onSubmit={() => void handleCreate()}
                />
            </View>

            {/* summary */}
            <View style={styles.section}>
                <ApplicationSummary
                    loading={loading}
                    total={totalCount}
                    inProgress={inProgressCount}
                    docDueSoon={docDueSoonCount}
                    interviewSoon={interviewSoonCount}
                    finalSoon={finalSoonCount}
                />
            </View>

            {/* list header */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>지원 목록</Text>
                <Text style={styles.listCount}>총 {totalCount}건</Text>
            </View>

            {/* list */}
            <View style={styles.section}>
                <ApplicationList
                    loading={loading}
                    applications={applications}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteWithConfirm}
                />
            </View>

            {/* edit modal */}
            <ApplicationEditModal
                open={!!editingTarget}
                target={editingTarget ?? null}
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
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#e5e7eb",
    },
    subtitle: {
        marginTop: 6, // ✅ gap 대체
        fontSize: 13,
        color: "#9ca3af",
    },
    section: {
        marginBottom: 18,
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#e5e7eb",
    },
    listCount: {
        fontSize: 12,
        color: "#9ca3af",
    },
});