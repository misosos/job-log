// app/screens/planner/PlannerScreen.tsx

import React, { useMemo, useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";

import { PlannerNewTaskForm } from "../../components/planner/PlannerNewTaskForm";
import { PlannerTaskSection } from "../../components/planner/PlannerTaskSection";

import type { PlannerScope, PlannerTask } from "../../../../shared/features/planner/types";
import { usePlanner } from "../../features/planner/usePlanner";

import { useApplications } from "../../features/applications/useApplications";
import type { ApplicationRow } from "../../../../shared/features/applications/types";
import type { PlannerTaskWithLabel } from "../../components/planner/PlannerTaskItem";

// ✅ deadline 파싱 (YYYY-MM-DD -> ms)
function parseDeadlineMs(deadline?: string | null): number | null {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d).getTime();
}

// ✅ 오늘 00:00(ms)
function getStartOfTodayMs(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

type PlannerTaskMaybeDeadline = PlannerTask & { deadline?: string | null };
type ApplicationRowMaybePosition = ApplicationRow & { position?: string };

export function PlannerScreen() {
    // 폼 입력용 로컬 상태
    const [newTitle, setNewTitle] = useState("");
    const [newScope, setNewScope] = useState<PlannerScope>("today");

    // ✅ 신규: 마감일(YYYY-MM-DD). null이면 마감일 없음
    const [newDeadline, setNewDeadline] = useState<string | null>(null);

    // 공고 선택: "" = 선택 안 함
    const [newApplicationId, setNewApplicationId] = useState<string>("");

    // ✅ Create Modal
    const [createOpen, setCreateOpen] = useState(false);

    const openCreate = useCallback(() => setCreateOpen(true), []);
    const closeCreate = useCallback(() => setCreateOpen(false), []);

    // 플래너 비즈니스 로직
    const {
        todayTasks,
        weekTasks,
        loading,
        saving,
        createTask,
        toggleTask,
        deleteTaskById,
    } = usePlanner();

    // 지원 내역 공통 훅
    const { applications } = useApplications();

    // 공고 id → "회사 · 직무" 라벨 맵
    const applicationLabelMap = useMemo<Record<string, string>>(() => {
        const map: Record<string, string> = {};

        (applications ?? []).forEach((raw) => {
            const app = raw as ApplicationRowMaybePosition;
            const company = app.company ?? "";
            const position = app.position ?? app.role ?? "";
            map[app.id] = position ? `${company} · ${position}` : company;
        });

        return map;
    }, [applications]);

    // 셀렉트용 옵션
    const applicationOptions = useMemo(
        () =>
            (applications ?? []).map((raw) => {
                const app = raw as ApplicationRowMaybePosition;
                const position = app.position ?? app.role ?? "";
                return {
                    value: app.id,
                    label:
                        applicationLabelMap[app.id] ??
                        (position ? `${app.company} · ${position}` : app.company) ??
                        "",
                };
            }),
        [applications, applicationLabelMap],
    );

    /**
     * ✅ 화면 표시용 버킷 재분류
     * - deadline이 있으면: 미래(>오늘 00:00)면 앞으로의 계획, 아니면 오늘 할 일
     * - deadline이 없으면: 기존 scope로 판단 (week=앞으로, today=오늘)
     */
    const { todayTasksWithLabel, futureTasksWithLabel } = useMemo(() => {
        const all: PlannerTaskMaybeDeadline[] = [
            ...(todayTasks ?? []),
            ...(weekTasks ?? []),
        ] as PlannerTaskMaybeDeadline[];

        const startOfTodayMs = getStartOfTodayMs();

        const todayBucket: PlannerTaskWithLabel[] = [];
        const futureBucket: PlannerTaskWithLabel[] = [];

        for (const t of all) {
            const deadline = t.deadline ?? null;
            const dueMs = parseDeadlineMs(deadline);

            const applicationLabel = t.applicationId
                ? applicationLabelMap[t.applicationId] ?? null
                : null;

            const withLabel: PlannerTaskWithLabel = {
                ...(t as PlannerTask),
                ...(deadline !== null ? { deadline } : { deadline: null }),
                applicationLabel,
            } as PlannerTaskWithLabel;

            if (dueMs !== null) {
                if (dueMs > startOfTodayMs) futureBucket.push(withLabel);
                else todayBucket.push(withLabel);
            } else {
                if (t.scope === "week") futureBucket.push(withLabel);
                else todayBucket.push(withLabel);
            }
        }

        return {
            todayTasksWithLabel: todayBucket,
            futureTasksWithLabel: futureBucket,
        };
    }, [todayTasks, weekTasks, applicationLabelMap]);

    // 추가
    const handleAddTask = useCallback(async (): Promise<void> => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        await createTask({
            title: trimmed,
            scope: newScope,
            deadline: newDeadline,
            applicationId: newApplicationId || undefined,
        });

        setNewTitle("");
        setNewScope("today");
        setNewDeadline(null);
        setNewApplicationId("");
    }, [newTitle, newScope, newDeadline, newApplicationId, createTask]);

    // ✅ 모달에서 저장 → 성공하면 닫기
    const handleAddTaskFromModal = useCallback(async () => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        try {
            await handleAddTask();
            setCreateOpen(false);
        } catch (e) {
            console.error(e);
            Alert.alert("저장 실패", "할 일을 저장하는 중 문제가 발생했습니다.");
        }
    }, [handleAddTask, newTitle]);

    const handleToggleTask = async (id: string): Promise<void> => {
        await toggleTask(id);
    };

    const handleDeleteTask = async (id: string): Promise<void> => {
        await deleteTaskById(id);
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

                <Text style={styles.subtitle}>
                    오늘 할 일과 앞으로의 계획을 마감일 기준으로 정리해요.
                </Text>
            </View>

            {/* 오늘 */}
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

            {/* 앞으로 */}
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
                            <Text style={styles.modalTitle}>새 할 일 추가</Text>
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
                            <PlannerNewTaskForm
                                title={newTitle}
                                scope={newScope}
                                deadline={newDeadline}
                                applicationId={newApplicationId}
                                applicationOptions={applicationOptions}
                                saving={saving}
                                onTitleChange={setNewTitle}
                                onScopeChange={setNewScope}
                                onDeadlineChange={setNewDeadline}
                                onApplicationChange={(id) => setNewApplicationId(id ?? "")} // ✅ null 방어
                                onSubmit={handleAddTaskFromModal}
                            />
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
    },
    section: {
        marginBottom: 16,
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

    // modal
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
});