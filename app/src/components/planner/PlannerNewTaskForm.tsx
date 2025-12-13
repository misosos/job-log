import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Modal,
    Pressable,
} from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type { PlannerScope } from "../../../../shared/features/planner/types";

// 🔹 PlannerScreen 쪽과 맞추기: { value, label }
type ApplicationOption = {
    value: string;
    label: string;
};

type PlannerNewTaskFormProps = {
    title: string;
    scope: PlannerScope;
    deadline: string | null;
    saving: boolean;
    applicationId: string; // "" = 연결 안 함
    applicationOptions: ApplicationOption[];
    onTitleChange: (value: string) => void;
    onScopeChange: (value: PlannerScope) => void;
    onDeadlineChange: (value: string | null) => void;
    onApplicationChange: (id: string) => void; // "" 허용
    onSubmit: () => void;
};

function toYmd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function inferScopeFromDeadline(deadline: string): PlannerScope {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return "today";
    const [y, m, d] = deadline.split("-").map((v) => Number(v));
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const due = new Date(y, m - 1, d).getTime();
    return due <= startOfToday ? "today" : "week";
}

function ymdToDate(ymd?: string | null): Date {
    if (!ymd) return new Date();
    const [y, m, d] = ymd.split("-").map((v) => Number(v));
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
}

export function PlannerNewTaskForm({
                                       title,
                                       scope,
                                       deadline,
                                       saving,
                                       applicationId,
                                       applicationOptions,
                                       onTitleChange,
                                       onScopeChange,
                                       onDeadlineChange,
                                       onApplicationChange,
                                       onSubmit,
                                   }: PlannerNewTaskFormProps) {
    const isSubmitDisabled = saving || title.trim().length === 0;
    const [showPicker, setShowPicker] = useState(false);

    const handlePickDate = (_e: DateTimePickerEvent, selected?: Date) => {
        // Android는 선택/취소 모두 이벤트가 오므로 일단 닫기
        if (Platform.OS === "android") setShowPicker(false);
        if (!selected) return; // 취소

        const value = toYmd(selected);
        onDeadlineChange(value);
        onScopeChange(inferScopeFromDeadline(value)); // ✅ 마감일 기준 자동 분류
    };

    const handlePressSubmit = () => {
        if (isSubmitDisabled) return;
        onSubmit();
    };

    const isToday = scope === "today";

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>새 할 일 추가</Text>

            {/* 제목 입력 */}
            <View style={styles.titleRow}>
                <TextInput
                    placeholder="예: 카카오페이 공고 JD 분석"
                    placeholderTextColor="#6b7280"
                    value={title}
                    onChangeText={onTitleChange}
                    style={styles.titleInput}
                    returnKeyType="done"
                    onSubmitEditing={handlePressSubmit}
                />
            </View>

            <View style={styles.bottomColumn}>
                {/* 범위: 마감일이 있으면 자동 분류(토글 잠금) */}
                <View style={styles.scopeGroupRow}>
                    <Text style={styles.scopeLabel}>범위</Text>

                    {deadline ? (
                        <View style={styles.scopeBadge}>
                            <Text style={styles.scopeBadgeText}>
                                {scope === "today" ? "오늘 할 일" : "앞으로의 계획"}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.scopeToggle}>
                            <TouchableOpacity
                                style={[styles.scopeButton, isToday && styles.scopeButtonActive]}
                                onPress={() => onScopeChange("today")}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.scopeButtonText, isToday && styles.scopeButtonTextActive]}>
                                    오늘 할 일
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.scopeButton, !isToday && styles.scopeButtonActive]}
                                onPress={() => onScopeChange("week")}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.scopeButtonText, !isToday && styles.scopeButtonTextActive]}>
                                    앞으로의 계획
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ✅ 마감일(YYYY-MM-DD) */}
                <View style={styles.ddayGroupRow}>
                    <Text style={styles.ddayLabelText}>마감일</Text>

                    <View style={styles.deadlineWrap}>
                        <TouchableOpacity
                            style={styles.deadlineButton}
                            activeOpacity={0.85}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text
                                style={deadline ? styles.deadlineButtonText : styles.deadlineButtonPlaceholder}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {deadline ? deadline : "날짜 선택"}
                            </Text>

                            <View style={styles.deadlineIcon} accessibilityLabel="캘린더 아이콘" accessible>
                                <View style={styles.calTop} />
                                <View style={styles.calRingsRow}>
                                    <View style={styles.calRing} />
                                    <View style={styles.calRing} />
                                </View>
                                <View style={styles.calBody}>
                                    <View style={styles.calRow}>
                                        <View style={styles.calDot} />
                                        <View style={styles.calDot} />
                                        <View style={styles.calDot} />
                                    </View>
                                    <View style={styles.calRow}>
                                        <View style={styles.calDot} />
                                        <View style={styles.calDot} />
                                        <View style={styles.calDot} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {Platform.OS === "ios" ? (
                            <Modal
                                transparent
                                visible={showPicker}
                                animationType="fade"
                                onRequestClose={() => setShowPicker(false)}
                            >
                                <Pressable
                                    style={styles.modalBackdrop}
                                    onPress={() => setShowPicker(false)}
                                >
                                    <Pressable style={styles.modalCard} onPress={() => {}}>
                                        <DateTimePicker
                                            value={ymdToDate(deadline)}
                                            mode="date"
                                            display="spinner"
                                            // ✅ iOS 다크모드에서도 글씨가 안 날아가도록 라이트 테마 강제
                                            themeVariant="light"
                                            // ✅ iOS 휠(스피너) 글씨/포인트 컬러 강제 (버전별 타입 미노출 대비)
                                            // @ts-expect-error iOS 전용(버전별) 옵션
                                            textColor="#881337" // rose-900
                                            // @ts-expect-error iOS 전용(버전별) 옵션
                                            accentColor="#f43f5e" // rose-500
                                            // ✅ 배경도 카드와 톤 맞추기
                                            style={{ backgroundColor: "#fff1f2" }}
                                            onChange={handlePickDate}
                                        />

                                        <TouchableOpacity
                                            style={styles.modalCloseBtn}
                                            activeOpacity={0.9}
                                            onPress={() => setShowPicker(false)}
                                        >
                                            <Text style={styles.modalCloseText}>닫기</Text>
                                        </TouchableOpacity>
                                    </Pressable>
                                </Pressable>
                            </Modal>
                        ) : (
                            showPicker && (
                                <View style={styles.pickerWrap}>
                                    <DateTimePicker
                                        value={ymdToDate(deadline)}
                                        mode="date"
                                        display="default"
                                        onChange={handlePickDate}
                                    />
                                </View>
                            )
                        )}

                        <View style={styles.quickRow}>
                            <TouchableOpacity
                                style={styles.quickBtn}
                                activeOpacity={0.9}
                                onPress={() => {
                                    const value = toYmd(new Date());
                                    onDeadlineChange(value);
                                    onScopeChange("today");
                                }}
                            >
                                <Text style={styles.quickBtnText}>오늘</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickBtn}
                                activeOpacity={0.9}
                                onPress={() => {
                                    const now = new Date();
                                    const plus7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
                                    const value = toYmd(plus7);
                                    onDeadlineChange(value);
                                    onScopeChange("week");
                                }}
                            >
                                <Text style={styles.quickBtnText}>+7일</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickBtnGhost}
                                activeOpacity={0.9}
                                onPress={() => {
                                    // ✅ 마감일 해제 + scope 기본값으로(꼬임 방지)
                                    onDeadlineChange(null);
                                    onScopeChange("today");
                                    setShowPicker(false);
                                }}
                            >
                                <Text style={styles.quickBtnGhostText}>지우기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 관련 공고 선택 */}
                <View style={styles.appGroupRow}>
                    <Text style={styles.appLabelText}>관련 공고 (선택)</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.appChipsRow}
                    >
                        {/* ✅ 연결 안 함 칩 */}
                        <TouchableOpacity
                            key="none"
                            style={[styles.appChip, applicationId === "" && styles.appChipActive]}
                            onPress={() => onApplicationChange("")}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.appChipText, applicationId === "" && styles.appChipTextActive]}>
                                연결 안 함
                            </Text>
                        </TouchableOpacity>

                        {applicationOptions.map((opt) => {
                            const selected = opt.value === applicationId;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[styles.appChip, selected && styles.appChipActive]}
                                    onPress={() => onApplicationChange(opt.value)}
                                    activeOpacity={0.9}
                                >
                                    <Text
                                        style={[styles.appChipText, selected && styles.appChipTextActive]}
                                        numberOfLines={1}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 추가 버튼 */}
                <TouchableOpacity
                    style={[styles.addButton, isSubmitDisabled && styles.addButtonDisabled]}
                    onPress={handlePressSubmit}
                    activeOpacity={0.9}
                    disabled={isSubmitDisabled}
                >
                    <Text style={styles.addButtonText}>{saving ? "추가 중..." : "추가"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff1f2", // rose-50
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#9f1239", // rose-800
        marginBottom: 10,
    },

    titleRow: { flexDirection: "row", marginBottom: 10 },
    titleInput: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#fff1f2", // rose-50
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 14,
        color: "#881337", // rose-900
    },

    bottomColumn: { marginTop: 4, gap: 10 },

    scopeGroupRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    scopeLabel: { fontSize: 12, color: "#9f1239", marginRight: 8 }, // rose-800

    scopeToggle: {
        flexDirection: "row",
        backgroundColor: "#ffe4e6", // rose-100
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        overflow: "hidden",
    },
    scopeButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    scopeButtonActive: { backgroundColor: "#fb7185" }, // rose-400
    scopeButtonText: { fontSize: 11, color: "#9f1239" }, // rose-800
    scopeButtonTextActive: { color: "#fff1f2", fontWeight: "700" }, // rose-50

    ddayGroupRow: { flexDirection: "row", alignItems: "center" },
    ddayLabelText: { fontSize: 12, color: "#9f1239", marginRight: 6 }, // rose-800
    deadlineWrap: { flex: 1, gap: 8 },

    deadlineButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#fff1f2", // rose-50
        paddingHorizontal: 10,
        paddingVertical: 10,
        minHeight: 42,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    deadlineButtonText: { fontSize: 12, color: "#881337", flexShrink: 1 }, // rose-900
    deadlineButtonPlaceholder: { fontSize: 12, color: "#fb7185", flexShrink: 1 }, // rose-400
    deadlineIcon: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#f43f5e", // rose-500
        backgroundColor: "#fff1f2", // rose-50
        overflow: "hidden",
        flexShrink: 0,
        alignItems: "stretch",
        justifyContent: "flex-start",
        opacity: 0.95,
    },
    calTop: {
        width: "100%",
        height: 5,
        backgroundColor: "rgba(244, 63, 94, 0.22)", // rose-500/22
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(244, 63, 94, 0.28)",
    },
    calRingsRow: {
        position: "absolute",
        top: 1,
        left: 0,
        right: 0,
        height: 6,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        pointerEvents: "none",
    },
    calRing: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#f43f5e", // rose-500
    },
    calBody: {
        flex: 1,
        paddingHorizontal: 3,
        paddingVertical: 3,
        justifyContent: "space-evenly",
    },
    calRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    calDot: {
        width: 2.5,
        height: 2.5,
        borderRadius: 2,
        backgroundColor: "rgba(244, 63, 94, 0.85)", // rose-500/85
    },

    pickerWrap: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "rgba(251, 113, 133, 0.10)", // rose-400 10%
        padding: 8,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(159, 18, 57, 0.25)", // rose-800 overlay
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    modalCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#fff1f2", // rose-50
        padding: 12,
    },
    modalCloseBtn: {
        alignSelf: "flex-end",
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#ffe4e6", // rose-100
    },
    modalCloseText: {
        color: "#9f1239", // rose-800
        fontSize: 12,
        fontWeight: "700",
    },

    quickRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    quickBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(244, 63, 94, 0.45)", // rose-500/45
        backgroundColor: "rgba(244, 63, 94, 0.10)", // rose-500/10
    },
    quickBtnText: { fontSize: 11, color: "#f43f5e", fontWeight: "700" }, // rose-500
    quickBtnGhost: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#ffe4e6", // rose-100
    },
    quickBtnGhostText: { fontSize: 11, color: "#fb7185", fontWeight: "700" }, // rose-400

    scopeBadge: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(244, 63, 94, 0.45)", // rose-500/45
        backgroundColor: "rgba(244, 63, 94, 0.10)", // rose-500/10
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    scopeBadgeText: { fontSize: 11, color: "#f43f5e", fontWeight: "700" }, // rose-500

    appGroupRow: { marginTop: 2 },
    appLabelText: { fontSize: 12, color: "#9f1239", marginBottom: 4 }, // rose-800
    appChipsRow: { flexDirection: "row", gap: 8 } as const,

    appChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#fff1f2", // rose-50
    },
    appChipActive: {
        borderColor: "#f43f5e", // rose-500
        backgroundColor: "rgba(244, 63, 94, 0.12)", // rose-500/12
    },
    appChipText: { fontSize: 11, color: "#881337", maxWidth: 180 }, // rose-900
    appChipTextActive: { color: "#f43f5e", fontWeight: "700" }, // rose-500

    addButton: {
        alignSelf: "flex-end",
        borderRadius: 8,
        backgroundColor: "#f43f5e", // rose-500
        paddingHorizontal: 14,
        paddingVertical: 9,
        marginTop: 4,
    },
    addButtonDisabled: { opacity: 0.6 },
    addButtonText: { fontSize: 12, fontWeight: "800", color: "#fff1f2" }, // rose-50
});