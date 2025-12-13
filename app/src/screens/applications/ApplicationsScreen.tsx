// app/screens/ApplicationsScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Alert,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

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

    // ✅ Create Modal
    const [createOpen, setCreateOpen] = useState(false);
    const didSubmitRef = useRef(false);

    // ✅ 모달 열 때마다 폼 상태(step/접기 등) 초기화하려고 key remount
    const [createNonce, setCreateNonce] = useState(0);

    const openCreate = useCallback(() => {
        setCreateNonce((n) => n + 1);
        setCreateOpen(true);
    }, []);

    const closeCreate = useCallback(() => {
        setCreateOpen(false);
    }, []);

    // ✅ RN confirm delete
    const handleDeleteWithConfirm = (id: string) => {
        Alert.alert("지원 내역 삭제", "이 지원 내역을 삭제할까요?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: () => void handleDelete(id) },
        ]);
    };

    // ✅ Create submit (모달 내)
    const handleCreateFromModal = useCallback(() => {
        // 필수값 없으면 닫지 않음 (원래 로직 유지)
        if (!newCompany.trim() || !newRole.trim()) return;

        didSubmitRef.current = true;
        void handleCreate();
    }, [handleCreate, newCompany, newRole]);

    // ✅ 저장 성공 시에만 모달 자동 닫기
    useEffect(() => {
        if (!didSubmitRef.current) return;
        if (saving) return;

        if (!saveError) setCreateOpen(false);
        didSubmitRef.current = false;
    }, [saving, saveError]);

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            // ✅ 모달/편집 모달 열린 동안 배경 스크롤 방지
            scrollEnabled={!createOpen && !editingTarget}
        >
            {/* header */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.title}>지원 현황</Text>

                    {/* ✅ 추가 버튼 */}
                    <Pressable
                        onPress={openCreate}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel="지원 기록 추가"
                    >
                        <Text style={styles.addBtnText}>+ 추가</Text>
                    </Pressable>
                </View>

                <Text style={styles.subtitle}>지원한 공고를 한눈에 정리하고, 마감 일정 위주로 관리해요.</Text>
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

            {/* ✅ create modal */}
            <Modal
                visible={createOpen}
                transparent
                animationType="slide"
                presentationStyle="overFullScreen"
                statusBarTranslucent
                onRequestClose={closeCreate}
            >
                <KeyboardAvoidingView
                    style={styles.sheetRoot}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
                >
                    {/* ✅ backdrop: 모달 열린 동안 배경 터치/스크롤 완전 차단 */}
                    <Pressable style={styles.sheetBackdrop} onPress={closeCreate} />

                    {/* ✅ bottom sheet */}
                    <View style={styles.modalCard}>
                        {/* ✅ 손잡이 */}
                        <View style={styles.sheetHandle} />

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>새 지원 기록 추가</Text>
                            <Pressable onPress={closeCreate} hitSlop={10}>
                                <Text style={styles.modalClose}>✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.modalBody}
                            contentContainerStyle={styles.modalBodyContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                            // ✅ 안드 nested scroll 안정화
                            nestedScrollEnabled
                            // ✅ iOS 키보드 인셋 자동 보정
                            automaticallyAdjustKeyboardInsets
                        >
                            <ApplicationCreateForm
                                key={`create-${createNonce}`}
                                variant="twoStep"
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
                                onSubmit={handleCreateFromModal}
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* edit modal (그대로) */}
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
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#e5e7eb",
    },
    subtitle: {
        marginTop: 6,
        fontSize: 13,
        color: "#9ca3af",
    },

    addBtn: {
        borderWidth: 1,
        borderColor: "#1f2937",
        backgroundColor: "rgba(15,23,42,0.55)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    addBtnPressed: {
        backgroundColor: "rgba(15,23,42,0.8)",
    },
    addBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#e5e7eb",
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

    sheetRoot: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(15, 23, 42, 0.7)",
    },
    sheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },

    sheetHandle: {
        alignSelf: "center",
        width: 44,
        height: 4,
        borderRadius: 999,
        backgroundColor: "#334155",
        marginBottom: 10,
    },

    modalCard: {
        width: "100%",
        height: "85%",
        maxHeight: "92%",
        backgroundColor: "#020617",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderWidth: 1,
        borderColor: "#1f2937",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -6 },
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    modalBody: {
        flex: 1,
    },
    modalBodyContent: {
        paddingBottom: 60,
    },
    modalTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#e5e7eb",
    },
    modalClose: {
        fontSize: 18,
        color: "#9ca3af",
    },
});