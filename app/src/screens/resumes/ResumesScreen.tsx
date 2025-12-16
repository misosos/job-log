// app/screens/resumes/ResumesScreen.tsx

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
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import { useResumesController } from "../../features/resumes/useResumesController";
import { useAuth } from "../../libs/auth-context";

// ✅ 테마 토큰 import (경로만 맞춰줘)
import { colors, space, radius, font } from "../../styles/theme";

type CreateResumeSheetProps = {
    open: boolean;
    saving: boolean;
    error: string | null;

    title: string;
    target: string;
    link: string;
    note: string;
    isValid: boolean;

    onClose: () => void;
    onSubmit: () => void | Promise<void>;

    onChangeTitle: (v: string) => void;
    onChangeTarget: (v: string) => void;
    onChangeLink: (v: string) => void;
    onChangeNote: (v: string) => void;
};

function CreateResumeSheet({
                               open,
                               saving,
                               error,

                               title,
                               target,
                               link,
                               note,
                               isValid,

                               onClose,
                               onSubmit,

                               onChangeTitle,
                               onChangeTarget,
                               onChangeLink,
                               onChangeNote,
                           }: CreateResumeSheetProps) {
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
                <Pressable pointerEvents="box-only" style={styles.sheetBackdrop} onPress={onClose} />

                <View style={styles.modalCard}>
                    <View style={styles.sheetHandle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>새 이력서 버전 추가</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <Text style={styles.modalClose}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.modalBody}
                        contentContainerStyle={styles.modalBodyContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                        nestedScrollEnabled
                        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
                    >
                        <ResumeForm
                            title={title}
                            target={target}
                            link={link}
                            note={note}
                            isValid={isValid && !saving}
                            onSubmit={onSubmit}
                            onChangeTitle={onChangeTitle}
                            onChangeTarget={onChangeTarget}
                            onChangeLink={onChangeLink}
                            onChangeNote={onChangeNote}
                        />

                        {error ? <Text style={styles.errorInModal}>{error}</Text> : null}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export function ResumesScreen() {
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");

    const canSubmit = useMemo(
        () => title.trim().length > 0 && target.trim().length > 0,
        [title, target],
    );

    const resetForm = useCallback(() => {
        setTitle("");
        setTarget("");
        setNote("");
        setLink("");
    }, []);

    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    const { resumes, loading, saving, error, createResumeVersion, setDefaultResumeVersion } =
        useResumesController(userId);

    const [createOpen, setCreateOpen] = useState(false);
    const didSubmitRef = useRef(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleCreate = useCallback(async () => {
        if (!canSubmit || saving) return;

        didSubmitRef.current = true;
        await createResumeVersion({ title, target, note, link });

        // 입력 초기화는 기존 정책 유지(성공/실패는 error로 보임)
        resetForm();
    }, [canSubmit, saving, createResumeVersion, title, target, note, link, resetForm]);

    useEffect(() => {
        if (!didSubmitRef.current) return;
        if (saving) return;

        if (!error) setCreateOpen(false);
        didSubmitRef.current = false;
    }, [saving, error]);

    const handleSetDefault = useCallback(
        async (resumeId: string) => {
            if (saving) return;
            await setDefaultResumeVersion(resumeId);
        },
        [saving, setDefaultResumeVersion],
    );

    const isOverlayOpen = createOpen;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            scrollEnabled={!isOverlayOpen}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.title}>이력서</Text>

                    <Pressable
                        onPress={openCreate}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel="이력서 버전 추가"
                    >
                        <Text style={styles.addBtnText}>+ 추가</Text>
                    </Pressable>
                </View>

                <Text style={styles.description}>
                    회사/직무별로 다른 이력서 버전을 만들고, 공고에 맞게 골라 쓸 수 있어요.
                </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <SectionCard title="이력서 버전 목록">
                <View style={styles.listWrapper}>
                    <ResumeList
                        resumes={resumes}
                        loading={loading || saving}
                        onSetDefault={handleSetDefault}
                    />
                </View>
            </SectionCard>

            <CreateResumeSheet
                open={createOpen}
                saving={saving}
                error={error ?? null}
                title={title}
                target={target}
                link={link}
                note={note}
                isValid={canSubmit}
                onClose={closeCreate}
                onSubmit={handleCreate}
                onChangeTitle={setTitle}
                onChangeTarget={setTarget}
                onChangeLink={setLink}
                onChangeNote={setNote}
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
        padding: space.lg,
        paddingBottom: space.lg + space.md, // 기존 24 느낌
    },

    header: { marginBottom: space.md + 2 }, // 기존 14 느낌
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
    description: {
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
        paddingVertical: space.md - 4, // 기존 8 느낌
        borderRadius: radius.pill,
    },
    addBtnPressed: { backgroundColor: colors.placeholder },
    addBtnText: {
        fontSize: font.small + 1, // 기존 12 느낌
        fontWeight: "900",
        color: colors.bg,
    },

    error: {
        marginBottom: space.sm,
        fontSize: font.small,
        color: "#e11d48", // (토큰에 error가 없어서 유지) 원하면 colors.error로 확장 가능
        fontWeight: "700",
    },

    listWrapper: { marginTop: space.xs },

    sheetRoot: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: colors.overlay,
    },
    sheetBackdrop: { ...StyleSheet.absoluteFillObject },

    sheetHandle: {
        alignSelf: "center",
        width: 44,
        height: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.border,
        marginBottom: space.md,
    },

    modalCard: {
        width: "100%",
        height: "80%",
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
    modalBodyContent: { paddingBottom: space.lg * 3 + 12 }, // 기존 60 근사치

    errorInModal: {
        marginTop: space.sm,
        fontSize: font.small,
        color: "#e11d48",
        fontWeight: "700",
    },
});