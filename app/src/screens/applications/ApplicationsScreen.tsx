// app/screens/ApplicationsScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { ApplicationList } from "../../components/applications/ApplicationList";
import { ApplicationSummary } from "../../components/applications/ApplicationSummary";
import { ApplicationCreateForm } from "../../components/applications/ApplicationCreateForm";
import { ApplicationEditModal } from "../../components/applications/ApplicationEditModal";
import { useApplicationsPageController } from "../../features/applications/useApplicationsPageController";

import { colors, space, radius, font } from "../../styles/theme";

type CreateApplicationSheetProps = {
    open: boolean;
    nonce: number;
    saving: boolean;
    error: string | null;

    company: string;
    position: string;
    status: any; // (기존 타입 유지. 여기 타입 명확하면 교체 가능)
    appliedAt: any;
    docDeadline: any;
    interviewAt: any;
    finalResultAt: any;

    onClose: () => void;
    onSubmit: () => void;

    onCompanyChange: (v: string) => void;
    onPositionChange: (v: string) => void;
    onStatusChange: (v: any) => void;
    onAppliedAtChange: (v: any) => void;
    onDocDeadlineChange: (v: any) => void;
    onInterviewAtChange: (v: any) => void;
    onFinalResultAtChange: (v: any) => void;
};

function CreateApplicationSheet({
                                    open,
                                    nonce,
                                    saving,
                                    error,

                                    company,
                                    position,
                                    status,
                                    appliedAt,
                                    docDeadline,
                                    interviewAt,
                                    finalResultAt,

                                    onClose,
                                    onSubmit,

                                    onCompanyChange,
                                    onPositionChange,
                                    onStatusChange,
                                    onAppliedAtChange,
                                    onDocDeadlineChange,
                                    onInterviewAtChange,
                                    onFinalResultAtChange,
                                }: CreateApplicationSheetProps) {
    return (
        <Modal
            visible={open}
            transparent
            animationType="slide"
            presentationStyle="overFullScreen"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.sheetRoot}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            >
                <Pressable style={styles.sheetBackdrop} onPress={onClose} pointerEvents="box-only" />

                <View style={styles.modalCard} pointerEvents="auto">
                    <View style={styles.sheetHandle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>새 지원 기록 추가</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <Text style={styles.modalClose}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.modalBody}
                        contentContainerStyle={styles.modalBodyContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
                        nestedScrollEnabled
                        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
                    >
                        <ApplicationCreateForm
                            key={`create-${nonce}`}
                            variant="twoStep"
                            company={company}
                            position={position}
                            status={status}
                            appliedAt={appliedAt}
                            docDeadline={docDeadline}
                            interviewAt={interviewAt}
                            finalResultAt={finalResultAt}
                            saving={saving}
                            error={error}
                            onCompanyChange={onCompanyChange}
                            onPositionChange={onPositionChange}
                            onStatusChange={onStatusChange}
                            onAppliedAtChange={onAppliedAtChange}
                            onDocDeadlineChange={onDocDeadlineChange}
                            onInterviewAtChange={onInterviewAtChange}
                            onFinalResultAtChange={onFinalResultAtChange}
                            onSubmit={onSubmit}
                        />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

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

    const [createOpen, setCreateOpen] = useState(false);
    const [createNonce, setCreateNonce] = useState(0);
    const didSubmitRef = useRef(false);

    const isOverlayOpen = !!editingTarget || createOpen;

    const openCreate = useCallback(() => {
        setCreateNonce((n) => n + 1);
        setCreateOpen(true);
    }, []);

    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleDeleteWithConfirm = useCallback(
        (id: string) => {
            Alert.alert("지원 내역 삭제", "이 지원 내역을 삭제할까요?", [
                { text: "취소", style: "cancel" },
                { text: "삭제", style: "destructive", onPress: () => void handleDelete(id) },
            ]);
        },
        [handleDelete],
    );

    const canSubmitCreate = useMemo(
        () => newCompany.trim().length > 0 && newRole.trim().length > 0,
        [newCompany, newRole],
    );

    const handleCreateFromModal = useCallback(() => {
        if (!canSubmitCreate) return;
        didSubmitRef.current = true;
        void handleCreate();
    }, [canSubmitCreate, handleCreate]);

    useEffect(() => {
        if (!didSubmitRef.current) return;
        if (saving) return;

        if (!saveError) setCreateOpen(false);
        didSubmitRef.current = false;
    }, [saving, saveError]);

    return (
        <ScrollView contentContainerStyle={styles.container} scrollEnabled={!isOverlayOpen}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.title}>지원 현황</Text>

                    <Pressable
                        onPress={openCreate}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel="지원 기록 추가"
                    >
                        <Text style={styles.addBtnText}>+ 추가</Text>
                    </Pressable>
                </View>

                <Text style={styles.subtitle}>
                    지원한 공고를 한눈에 정리하고, 마감 일정 위주로 관리해요.
                </Text>
            </View>

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

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>지원 목록</Text>
                <Text style={styles.listCount}>총 {totalCount}건</Text>
            </View>

            <View style={styles.section}>
                <ApplicationList
                    loading={loading}
                    applications={applications}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteWithConfirm}
                />
            </View>

            <CreateApplicationSheet
                open={createOpen}
                nonce={createNonce}
                saving={saving}
                error={saveError ?? null}
                company={newCompany}
                position={newRole}
                status={newStatus}
                appliedAt={newAppliedAt}
                docDeadline={newDocumentDeadline}
                interviewAt={newInterviewAt}
                finalResultAt={newFinalResultAt}
                onClose={closeCreate}
                onSubmit={handleCreateFromModal}
                onCompanyChange={setNewCompany}
                onPositionChange={setNewRole}
                onStatusChange={setNewStatus}
                onAppliedAtChange={setNewAppliedAt}
                onDocDeadlineChange={setNewDocumentDeadline}
                onInterviewAtChange={setNewInterviewAt}
                onFinalResultAtChange={setNewFinalResultAt}
            />

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
        padding: space.lg,
        paddingBottom: space.lg * 2, // 기존 32 느낌
        backgroundColor: colors.bg,
    },

    header: { marginBottom: space.lg },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: font.h1,
        fontWeight: "800",
        color: colors.text,
    },
    subtitle: {
        marginTop: space.sm,
        fontSize: font.body,
        color: colors.text,
        opacity: 0.65,
    },

    // ✅ 여기 화면은 outline 버튼 느낌이라 section/border/accent 조합 유지
    addBtn: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.section,
        paddingHorizontal: space.lg,
        paddingVertical: space.md - 4, // 8 느낌
        borderRadius: radius.pill,
    },
    addBtnPressed: { backgroundColor: colors.border },
    addBtnText: {
        fontSize: font.small + 1, // 12 느낌
        fontWeight: "800",
        color: colors.accent,
    },

    section: { marginBottom: space.lg + 2 }, // 기존 18 근사

    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: space.md - 2, // 기존 10 근사
    },
    listTitle: {
        fontSize: font.body,
        fontWeight: "800",
        color: colors.text,
    },
    listCount: {
        fontSize: font.small + 1, // 12 느낌
        color: colors.text,
        opacity: 0.55,
    },

    // ✅ sheet styles
    sheetRoot: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: colors.overlay,
    },
    sheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        elevation: 1,
    },

    sheetHandle: {
        alignSelf: "center",
        width: 44,
        height: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.border,
        marginBottom: space.md,
    },

    modalCard: {
        zIndex: 2,
        width: "100%",
        height: "85%",
        maxHeight: "92%",
        backgroundColor: colors.bg,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: space.lg,
        paddingTop: space.md,
        paddingBottom: space.md,

        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -6 },
        elevation: 10,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: space.md,
    },
    modalTitle: {
        fontSize: font.h2,
        fontWeight: "900",
        color: colors.text,
    },
    modalClose: {
        fontSize: 18,
        color: colors.placeholder,
        fontWeight: "900",
    },
    modalBody: { flex: 1 },
    modalBodyContent: { paddingBottom: space.lg * 3 + 12 }, // 기존 60 근사
});