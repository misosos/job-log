// app/screens/interviews/InterviewsScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useAuth } from "../../libs/auth-context";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

export function InterviewsScreen() {
    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    const {
        upcoming,
        past,
        loading,
        listError,
        saving,
        formError,
        handleCreate,
    } = useInterviewPageController(userId);

    // ✅ Create Modal
    const [createOpen, setCreateOpen] = useState(false);
    const didSubmitRef = useRef(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleCreateFromModal = useCallback(
        (payload: any) => {
            didSubmitRef.current = true;
            void handleCreate(payload);
        },
        [handleCreate],
    );
    // ✅ 저장 성공 시에만 모달 자동 닫기
    useEffect(() => {
        if (!didSubmitRef.current) return;
        if (saving) return;

        // 저장 끝났고 에러 없으면 닫기
        if (!formError) {
            setCreateOpen(false);
        }
        didSubmitRef.current = false;
    }, [saving, formError]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* header */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.title}>면접</Text>

                    {/* ✅ 추가 버튼 */}
                    <Pressable
                        onPress={openCreate}
                        style={({ pressed }) => [
                            styles.addBtn,
                            pressed && styles.addBtnPressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="면접 기록 추가"
                    >
                        <Text style={styles.addBtnText}>+ 추가</Text>
                    </Pressable>
                </View>

                <Text style={styles.subtitle}>
                    다가올 면접과 지난 면접을 정리하고, 회고를 쌓아봐요.
                </Text>
            </View>

            {/* 목록 에러 */}
            {listError ? <Text style={styles.errorText}>{listError}</Text> : null}

            {/* 다가올 면접 */}
            <View style={styles.section}>
                <UpcomingInterviewsSection items={upcoming} loading={loading} />
            </View>

            {/* 지난 면접 / 리뷰 */}
            <View style={styles.section}>
                <InterviewReviewSection items={past} loading={loading} />
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
                            <Text style={styles.modalTitle}>새 면접 기록 추가</Text>
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
                        >
                            {/* ✅ 기존 폼 그대로 재사용 */}
                            <SectionCard title="면접 정보 입력">
                                <InterviewCreateForm
                                    saving={saving}
                                    error={formError}
                                    onSubmit={handleCreateFromModal}
                                />
                            </SectionCard>

                            {/* 폼 에러(이미 Form 내부에서 보여주면 중복될 수 있어 선택) */}
                            {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
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
        marginBottom: 16,
    },

    errorText: {
        fontSize: 12,
        color: "#fecaca",
        marginBottom: 8,
    },
    formErrorText: {
        marginTop: 10,
        fontSize: 12,
        color: "#fecaca",
    },

    // ✅ bottom sheet modal styles (ApplicationsScreen과 동일 패턴)
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
    modalTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#e5e7eb",
    },
    modalClose: {
        fontSize: 18,
        color: "#9ca3af",
    },
    modalBody: {
        flex: 1,
    },
    modalBodyContent: {
        paddingBottom: 60,
    },
});