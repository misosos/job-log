// app/screens/interviews/InterviewsScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useAuth } from "../../libs/auth-context";
import {
    useInterviewPageController,
    type CreateInterviewFormValues,
} from "../../features/interviews/useInterviewPageController";

// ✅ 테마 토큰 import (경로만 맞춰줘)
import { colors, space, radius, font } from "../../styles/theme";

type CreateInterviewSheetProps = {
    open: boolean;
    nonce: number;
    saving: boolean;
    error?: string | null;
    onClose: () => void;
    onSubmit: (payload: CreateInterviewFormValues) => void;
};

function CreateInterviewSheet({
                                  open,
                                  nonce,
                                  saving,
                                  error,
                                  onClose,
                                  onSubmit,
                              }: CreateInterviewSheetProps) {
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
                <Pressable
                    style={styles.sheetBackdrop}
                    onPress={onClose}
                    pointerEvents="box-only"
                />

                <View
                    style={styles.modalCard}
                    pointerEvents="auto"
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.sheetHandle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>새 면접 기록 추가</Text>
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
                    >
                        <SectionCard title="면접 정보 입력">
                            <InterviewCreateForm
                                key={`create-${nonce}`}
                                saving={saving}
                                error={error ?? null}
                                onSubmit={onSubmit}
                            />
                        </SectionCard>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export function InterviewsScreen() {
    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    const { upcoming, past, loading, listError, saving, formError, handleCreate } =
        useInterviewPageController(userId);

    const [createOpen, setCreateOpen] = useState(false);
    const [createNonce, setCreateNonce] = useState(0);
    const didSubmitRef = useRef(false);

    const isOverlayOpen = useMemo(() => createOpen, [createOpen]);

    const openCreate = useCallback(() => {
        setCreateNonce((n) => n + 1);
        setCreateOpen(true);
    }, []);

    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleCreateFromModal = useCallback(
        (payload: CreateInterviewFormValues) => {
            didSubmitRef.current = true;
            void handleCreate(payload);
        },
        [handleCreate],
    );

    useEffect(() => {
        if (!didSubmitRef.current) return;
        if (saving) return;

        if (!formError) setCreateOpen(false);
        didSubmitRef.current = false;
    }, [saving, formError]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            scrollEnabled={!isOverlayOpen}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.title}>면접</Text>

                    <Pressable
                        onPress={openCreate}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
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

            {listError ? <Text style={styles.errorText}>{listError}</Text> : null}

            <View style={styles.section}>
                <UpcomingInterviewsSection items={upcoming} loading={loading} />
            </View>

            <View style={styles.section}>
                <InterviewReviewSection items={past} loading={loading} />
            </View>

            <CreateInterviewSheet
                open={createOpen}
                nonce={createNonce}
                saving={saving}
                error={formError ?? null}
                onClose={closeCreate}
                onSubmit={handleCreateFromModal}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        paddingHorizontal: space.lg,
        paddingVertical: space.lg,
        paddingBottom: space.lg * 2,
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

    addBtn: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.accent,
        paddingHorizontal: space.lg,
        paddingVertical: space.md - 4, // 기존 8 느낌 유지
        borderRadius: radius.pill,
    },
    addBtnPressed: {
        backgroundColor: colors.placeholder, // rose-400 역할
    },
    addBtnText: {
        fontSize: font.small + 1, // 기존 12 느낌
        fontWeight: "900",
        color: colors.bg,
    },

    section: { marginBottom: space.lg },

    errorText: {
        fontSize: font.small + 1,
        color: "#e11d48", // 에러 토큰 없으면 유지 or colors.danger 만들기
        marginBottom: space.sm,
        fontWeight: "700",
    },

    sheetRoot: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: colors.overlay,
    },
    sheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
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
        elevation: 20,
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
    modalBodyContent: { paddingBottom: space.lg * 3 + 12 },
});