// app/screens/planner/PlannerScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
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

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";

import type { PlannerScope, PlannerTask } from "../../../../shared/features/planner/types";
import { usePlanner } from "../../features/planner/usePlanner";

import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
import type { PlannerTaskWithLabel } from "../../components/planner/PlannerTaskItem";

// ✅ 테마 토큰 import (경로만 맞춰줘)
import { colors, space, radius, font } from "../../styles/theme";

type PlannerTaskMaybeDeadline = PlannerTask & { deadline?: string | null };
type ApplicationRowMaybePosition = ApplicationRow & { position?: string };

function parseDeadlineMs(deadline?: string | null): number | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function getStartOfTodayMs(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
}

function buildApplicationLabelMap(applications?: ApplicationRow[]): Record<string, string> {
    const map: Record<string, string> = {};
    (applications ?? []).forEach((raw) => {
        const app = raw as ApplicationRowMaybePosition;
        const company = app.company ?? "";
        const position = app.position ?? app.role ?? "";
        map[app.id] = position ? `${company} · ${position}` : company;
    });
    return map;
}

function buildApplicationOptions(applications: ApplicationRow[] | undefined, labelMap: Record<string, string>) {
    return (applications ?? []).map((raw) => {
        const app = raw as ApplicationRowMaybePosition;
        const position = app.position ?? app.role ?? "";
        return {
            value: app.id,
            label: labelMap[app.id] ?? (position ? `${app.company} · ${position}` : app.company) ?? "",
        };
    });
}

function bucketTasksByDeadlineOrScope(params: {
    todayTasks?: PlannerTask[];
    weekTasks?: PlannerTask[];
    labelMap: Record<string, string>;
}) {
    const { todayTasks, weekTasks, labelMap } = params;

    const all: PlannerTaskMaybeDeadline[] = [...(todayTasks ?? []), ...(weekTasks ?? [])] as PlannerTaskMaybeDeadline[];

    const startOfTodayMs = getStartOfTodayMs();

    const todayBucket: PlannerTaskWithLabel[] = [];
    const futureBucket: PlannerTaskWithLabel[] = [];

    for (const t of all) {
        const deadline = t.deadline ?? null;
        const dueMs = parseDeadlineMs(deadline);

        const applicationLabel = t.applicationId ? labelMap[t.applicationId] ?? null : null;

        const withLabel: PlannerTaskWithLabel = {
            ...(t as PlannerTask),
            deadline,
            applicationLabel,
        };

        if (dueMs !== null) {
            if (dueMs > startOfTodayMs) futureBucket.push(withLabel);
            else todayBucket.push(withLabel);
        } else {
            if (t.scope === "week") futureBucket.push(withLabel);
            else todayBucket.push(withLabel);
        }
    }

    return { todayTasksWithLabel: todayBucket, futureTasksWithLabel: futureBucket };
}

type CreateTaskSheetProps = {
    open: boolean;
    saving: boolean;
    onClose: () => void;
    onSubmit: () => void;

    title: string;
    scope: PlannerScope;
    deadline: string | null;
    applicationId: string;
    applicationOptions: { value: string; label: string }[];

    onTitleChange: (v: string) => void;
    onScopeChange: (v: PlannerScope) => void;
    onDeadlineChange: (v: string | null) => void;
    onApplicationChange: (id: string) => void;
};

function CreateTaskSheet({
                             open,
                             saving,
                             onClose,
                             onSubmit,

                             title,
                             scope,
                             deadline,
                             applicationId,
                             applicationOptions,

                             onTitleChange,
                             onScopeChange,
                             onDeadlineChange,
                             onApplicationChange,
                         }: CreateTaskSheetProps) {
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            >
                <Pressable style={styles.sheetBackdrop} onPress={onClose} />

                <View style={styles.modalCard}>
                    <View style={styles.sheetHandle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>새 할 일 추가</Text>
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
                        automaticallyAdjustKeyboardInsets
                    >
                        <PlannerNewTaskForm
                            title={title}
                            scope={scope}
                            deadline={deadline}
                            saving={saving}
                            applicationId={applicationId}
                            applicationOptions={applicationOptions}
                            onTitleChange={onTitleChange}
                            onScopeChange={onScopeChange}
                            onDeadlineChange={onDeadlineChange}
                            onApplicationChange={onApplicationChange}
                            onSubmit={onSubmit}
                        />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export function PlannerScreen() {
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");
    const [newDeadline, setNewDeadline] = useState<string | null>(null);
    const [newApplicationId, setNewApplicationId] = useState<string>("");

    const [createOpen, setCreateOpen] = useState(false);
    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    const { todayTasks, weekTasks, loading, saving, createTask, toggleTask, deleteTaskById } = usePlanner();
    const { applications } = useApplications();

    const applicationLabelMap = useMemo(() => buildApplicationLabelMap(applications), [applications]);

    const applicationOptions = useMemo(
        () => buildApplicationOptions(applications, applicationLabelMap),
        [applications, applicationLabelMap],
    );

    const { todayTasksWithLabel, futureTasksWithLabel } = useMemo(() => {
        return bucketTasksByDeadlineOrScope({
            todayTasks,
            weekTasks,
            labelMap: applicationLabelMap,
        });
    }, [todayTasks, weekTasks, applicationLabelMap]);

    const resetForm = useCallback(() => {
        setNewTitle("");
        setNewScope("today");
        setNewDeadline(null);
        setNewApplicationId("");
    }, []);

    const canSubmit = useMemo(() => newTitle.trim().length > 0, [newTitle]);

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) return;

        try {
            await createTask({
                title: newTitle.trim(),
                scope: newScope,
                deadline: newDeadline,
                applicationId: newApplicationId || undefined,
            });

            resetForm();
            setCreateOpen(false);
        } catch (e) {
            console.error(e);
            Alert.alert("저장 실패", "할 일을 저장하는 중 문제가 발생했습니다.");
        }
    }, [canSubmit, createTask, newTitle, newScope, newDeadline, newApplicationId, resetForm]);

    const handleToggleTask = useCallback(async (id: string) => {
        await toggleTask(id);
    }, [toggleTask]);

    const handleDeleteTask = useCallback(async (id: string) => {
        await deleteTaskById(id);
    }, [deleteTaskById]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            scrollEnabled={!createOpen}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <Text style={styles.title}>플래너</Text>

                    <Pressable
                        onPress={openCreate}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel="할 일 추가"
                    >
                        <Text style={styles.addBtnText}>+ 추가</Text>
                    </Pressable>
                </View>

                <Text style={styles.subtitle}>오늘 할 일과 앞으로의 계획을 마감일 기준으로 정리해요.</Text>
            </View>

            <View style={styles.section}>
                <PlannerTaskSection
                    title="오늘 할 일"
                    loading={loading}
                    tasks={todayTasksWithLabel}
                    emptyMessage="오늘은 아직 등록된 할 일이 없어요."
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                />
            </View>

            <View style={styles.section}>
                <PlannerTaskSection
                    title="앞으로의 계획"
                    loading={loading}
                    tasks={futureTasksWithLabel}
                    emptyMessage="앞으로 할 공부/지원 계획을 여기에 정리할 수 있어요."
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                />
            </View>

            <CreateTaskSheet
                open={createOpen}
                saving={saving}
                onClose={closeCreate}
                onSubmit={handleSubmit}
                title={newTitle}
                scope={newScope}
                deadline={newDeadline}
                applicationId={newApplicationId}
                applicationOptions={applicationOptions}
                onTitleChange={setNewTitle}
                onScopeChange={setNewScope}
                onDeadlineChange={setNewDeadline}
                onApplicationChange={(id) => setNewApplicationId(id ?? "")}
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
    },
    section: {
        marginBottom: space.lg,
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
    addBtnPressed: { backgroundColor: colors.placeholder },
    addBtnText: {
        fontSize: font.small + 1,
        fontWeight: "900",
        color: colors.bg,
    },

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
    modalBodyContent: { paddingBottom: space.lg * 3 + 12 },
});