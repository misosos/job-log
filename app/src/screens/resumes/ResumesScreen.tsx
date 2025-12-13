// app/screens/resumes/ResumesScreen.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    View,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import { useResumesController } from "../../features/resumes/useResumesController";
import { useAuth } from "../../libs/auth-context";

export function ResumesScreen() {
    // 🔹 폼 입력용 로컬 상태
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");

    const isValid = title.trim().length > 0 && target.trim().length > 0;

    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    // 🔹 데이터 로딩/저장/에러는 전부 훅에서 관리
    const {
        resumes,
        loading,
        saving,
        error,
        createResumeVersion,
        setDefaultResumeVersion,
    } = useResumesController(userId);

    // ✅ Create Modal
    const [createOpen, setCreateOpen] = useState(false);
    const didSubmitRef = useRef(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const handleCreate = useCallback(async () => {
        if (!isValid || saving) return;

        didSubmitRef.current = true;

        await createResumeVersion({
            title,
            target,
            note,
            link,
        });

        // 입력은 일단 초기화(성공/실패는 error로 보임)
        setTitle("");
        setTarget("");
        setNote("");
        setLink("");
    }, [isValid, saving, createResumeVersion, title, target, note, link]);

    // ✅ 저장 성공 시(=saving 종료 && error 없음)에만 모달 닫기
    useEffect(() => {
        if (!didSubmitRef.current) return;
        if (saving) return;

        if (!error) {
            setCreateOpen(false);
        }
        didSubmitRef.current = false;
    }, [saving, error]);

    const handleSetDefault = async (resumeId: string) => {
        if (saving) return;
        await setDefaultResumeVersion(resumeId);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            scrollEnabled={!createOpen} // ✅ 모달 열리면 배경 스크롤 차단
        >
            {/* header */}
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

            {/* list */}
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
                    {/* backdrop */}
                    <Pressable style={styles.sheetBackdrop} onPress={closeCreate} />

                    {/* bottom sheet */}
                    <View style={styles.modalCard}>
                        <View style={styles.sheetHandle} />

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>새 이력서 버전 추가</Text>
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
                            <ResumeForm
                                title={title}
                                target={target}
                                link={link}
                                note={note}
                                isValid={isValid && !saving}
                                onSubmit={handleCreate}
                                onChangeTitle={setTitle}
                                onChangeTarget={setTarget}
                                onChangeLink={setLink}
                                onChangeNote={setNote}
                            />

                            {/* 모달 내부에서도 에러 보여주기 */}
                            {error ? <Text style={styles.errorInModal}>{error}</Text> : null}
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
        backgroundColor: "#020617", // slate-900 느낌
    },
    content: {
        padding: 16,
        paddingBottom: 24,
    },

    header: {
        marginBottom: 14,
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
    description: {
        marginTop: 6,
        fontSize: 13,
        color: "#CBD5F5", // text-slate-300 느낌
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

    error: {
        marginBottom: 8,
        fontSize: 11,
        color: "#FCA5A5",
    },
    listWrapper: {
        marginTop: 4,
    },

    // ✅ modal styles
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
        height: "80%",
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
    errorInModal: {
        marginTop: 8,
        fontSize: 11,
        color: "#FCA5A5",
    },
});