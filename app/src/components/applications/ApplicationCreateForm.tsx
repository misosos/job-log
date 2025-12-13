// app/src/components/applications/ApplicationCreateForm.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Platform,
    Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import type { ApplicationStatus } from "../../../../shared/features/applications/types";

type Props = {
    company: string;

    /** ✅ UI 변형: 기본(full) / 2-step(모바일) */
    variant?: "full" | "twoStep";

    /** ✅ 권장: position (신규) */
    position?: string;

    /** ⚠️ 레거시 호환: role (구버전) */
    role?: string;

    status: ApplicationStatus;

    /** ✅ 지원일(YYYY-MM-DD) */
    appliedAt?: string;

    /** ✅ 권장: 3대 날짜(YYYY-MM-DD) */
    docDeadline?: string; // 서류 마감일
    interviewAt?: string; // 면접일
    finalResultAt?: string; // 최종 발표일

    /** ⚠️ 레거시: 예전 마감일(=서류 마감일로 취급) */
    deadline?: string;

    saving: boolean;
    error: string | null;

    onCompanyChange: (value: string) => void;

    /** ✅ 권장 */
    onPositionChange?: (value: string) => void;

    /** ⚠️ 레거시 */
    onRoleChange?: (value: string) => void;

    onStatusChange: (value: ApplicationStatus) => void;

    /** ✅ 지원일 핸들러 */
    onAppliedAtChange?: (value: string) => void;

    /** ✅ 권장 핸들러 */
    onDocDeadlineChange?: (value: string) => void;
    onInterviewAtChange?: (value: string) => void;
    onFinalResultAtChange?: (value: string) => void;

    /** ⚠️ 레거시 */
    onDeadlineChange?: (value: string) => void;

    onSubmit: () => void;
};

const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
    { label: "지원 예정", value: "지원 예정" },
    { label: "서류 제출", value: "서류 제출" },
    { label: "서류 통과", value: "서류 통과" },
    { label: "면접 예정", value: "면접 예정" },
    { label: "면접 완료", value: "면접 완료" },
    { label: "최종 합격", value: "최종 합격" },
    { label: "불합격", value: "불합격" },
    { label: "지원 철회", value: "지원 철회" },
];

function ymdToDate(ymd?: string): Date | null {
    const v = (ymd ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function dateToYmd(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

type PickerField = "appliedAt" | "docDeadline" | "interviewAt" | "finalResultAt";

export function ApplicationCreateForm({
                                          company,
                                          variant,
                                          position,
                                          role,
                                          status,

                                          appliedAt,

                                          docDeadline,
                                          interviewAt,
                                          finalResultAt,

                                          // legacy
                                          deadline,

                                          saving,
                                          error,
                                          onCompanyChange,

                                          onPositionChange,
                                          onRoleChange,

                                          onStatusChange,

                                          onAppliedAtChange,

                                          onDocDeadlineChange,
                                          onInterviewAtChange,
                                          onFinalResultAtChange,

                                          // legacy
                                          onDeadlineChange,

                                          onSubmit,
                                      }: Props) {
    const uiVariant = variant ?? "full";

    const resolvedPosition = (position ?? "").trim() || (role ?? "").trim() || "";
    const resolvedDocDeadline = (docDeadline ?? "").trim() || (deadline ?? "").trim() || "";

    const isSubmitDisabled = useMemo(
        () => saving || !company.trim() || !resolvedPosition.trim(),
        [saving, company, resolvedPosition],
    );

    const handleSubmitPress = useCallback(() => {
        if (isSubmitDisabled) return;
        onSubmit();
    }, [isSubmitDisabled, onSubmit]);

    const handlePositionChange = useCallback(
        (value: string) => {
            if (onPositionChange) onPositionChange(value);
            else onRoleChange?.(value);
        },
        [onPositionChange, onRoleChange],
    );

    const handleDocDeadlineChange = useCallback(
        (value: string) => {
            if (onDocDeadlineChange) onDocDeadlineChange(value);
            else onDeadlineChange?.(value);
        },
        [onDocDeadlineChange, onDeadlineChange],
    );

    // -----------------------------
    // ✅ 2-step + 접기/펼치기 UI 상태
    // -----------------------------
    const [step, setStep] = useState<1 | 2>(1);
    const [showExtraDates, setShowExtraDates] = useState(false);

    // 폼이 비면(저장 후 초기화) step/토글도 같이 초기화
    useEffect(() => {
        const emptyAll =
            !company.trim() &&
            !resolvedPosition.trim() &&
            !(appliedAt ?? "").trim() &&
            !resolvedDocDeadline.trim() &&
            !(interviewAt ?? "").trim() &&
            !(finalResultAt ?? "").trim();

        if (emptyAll) {
            setStep(1);
            setShowExtraDates(false);
        }
    }, [company, resolvedPosition, appliedAt, resolvedDocDeadline, interviewAt, finalResultAt]);

    // -----------------------------
    // ✅ Date Picker Controller
    // -----------------------------
    const [openField, setOpenField] = useState<PickerField | null>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const openPicker = useCallback(
        (field: PickerField) => {
            if (saving) return;

            const current =
                field === "appliedAt"
                    ? ymdToDate(appliedAt)
                    : field === "docDeadline"
                        ? ymdToDate(resolvedDocDeadline)
                        : field === "interviewAt"
                            ? ymdToDate(interviewAt)
                            : ymdToDate(finalResultAt);

            setTempDate(current ?? new Date());
            setOpenField(field);
        },
        [saving, appliedAt, resolvedDocDeadline, interviewAt, finalResultAt],
    );

    const closePicker = useCallback(() => setOpenField(null), []);

    const commitDate = useCallback(
        (field: PickerField, date: Date) => {
            const ymd = dateToYmd(date);

            if (field === "appliedAt") onAppliedAtChange?.(ymd);
            if (field === "docDeadline") handleDocDeadlineChange(ymd);
            if (field === "interviewAt") onInterviewAtChange?.(ymd);
            if (field === "finalResultAt") onFinalResultAtChange?.(ymd);
        },
        [onAppliedAtChange, handleDocDeadlineChange, onInterviewAtChange, onFinalResultAtChange],
    );

    const clearDate = useCallback(
        (field: PickerField) => {
            if (saving) return;
            if (field === "appliedAt") onAppliedAtChange?.("");
            if (field === "docDeadline") handleDocDeadlineChange("");
            if (field === "interviewAt") onInterviewAtChange?.("");
            if (field === "finalResultAt") onFinalResultAtChange?.("");
        },
        [saving, onAppliedAtChange, handleDocDeadlineChange, onInterviewAtChange, onFinalResultAtChange],
    );

    const onAndroidChange = useCallback(
        (event: DateTimePickerEvent, selected?: Date) => {
            if (event.type === "dismissed") {
                closePicker();
                return;
            }
            if (!openField) return;
            const picked = selected ?? tempDate;
            commitDate(openField, picked);
            closePicker();
        },
        [openField, tempDate, commitDate, closePicker],
    );

    const renderDateField = (label: string, field: PickerField, value?: string) => {
        const display = (value ?? "").trim();

        return (
            <View style={styles.field}>
                <View style={styles.dateLabelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {!!display && (
                        <Pressable onPress={() => clearDate(field)} disabled={saving} hitSlop={8}>
                            <Text style={styles.clearText}>지우기</Text>
                        </Pressable>
                    )}
                </View>

                <Pressable
                    onPress={() => openPicker(field)}
                    disabled={saving}
                    style={({ pressed }) => [
                        styles.dateButton,
                        pressed && !saving && styles.dateButtonPressed,
                    ]}
                >
                    <Text style={styles.dateButtonText}>{display || "선택 (YYYY-MM-DD)"}</Text>
                </Pressable>
            </View>
        );
    };

    const renderScheduleSection = () => {
        // full: 기존처럼 날짜 4개 다 보여주기
        if (uiVariant === "full") {
            return (
                <>
                    {renderDateField("지원일", "appliedAt", appliedAt)}
                    {renderDateField("서류 마감일", "docDeadline", resolvedDocDeadline)}
                    {renderDateField("면접일", "interviewAt", interviewAt)}
                    {renderDateField("최종 발표일", "finalResultAt", finalResultAt)}
                </>
            );
        }

        // twoStep: step=2에서만 일정 보여주기 + 기본은 서류마감만
        if (step !== 2) return null;

        return (
            <>
                {renderDateField("서류 마감일", "docDeadline", resolvedDocDeadline)}

                <Pressable
                    onPress={() => setShowExtraDates((v) => !v)}
                    disabled={saving}
                    style={({ pressed }) => [
                        styles.toggleRow,
                        pressed && !saving && styles.toggleRowPressed,
                    ]}
                >
                    <Text style={styles.toggleText}>
                        {showExtraDates ? "추가 일정 접기" : "추가 일정 입력"}
                    </Text>
                    <Text style={styles.toggleChevron}>{showExtraDates ? "▲" : "▼"}</Text>
                </Pressable>

                {showExtraDates && (
                    <>
                        {renderDateField("지원일", "appliedAt", appliedAt)}
                        {renderDateField("면접일", "interviewAt", interviewAt)}
                        {renderDateField("최종 발표일", "finalResultAt", finalResultAt)}
                    </>
                )}
            </>
        );
    };

    const renderButtons = () => {
        if (uiVariant === "full") {
            return (
                <View style={styles.buttonWrapper}>
                    <Pressable
                        onPress={handleSubmitPress}
                        disabled={isSubmitDisabled}
                        style={({ pressed }) => [
                            styles.button,
                            isSubmitDisabled && styles.buttonDisabled,
                            pressed && !isSubmitDisabled && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.buttonText}>{saving ? "저장 중..." : "지원 기록 추가"}</Text>
                    </Pressable>
                </View>
            );
        }

        // twoStep
        if (step === 1) {
            return (
                <View style={styles.stepButtonsRow}>
                    <Pressable
                        onPress={() => {
                            if (isSubmitDisabled) return;
                            setStep(2);
                        }}
                        disabled={isSubmitDisabled}
                        style={({ pressed }) => [
                            styles.button,
                            styles.buttonPrimary,
                            isSubmitDisabled && styles.buttonDisabled,
                            pressed && !isSubmitDisabled && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.buttonText}>다음</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.stepButtonsRow}>
                <Pressable
                    onPress={() => setStep(1)}
                    disabled={saving}
                    style={({ pressed }) => [
                        styles.button,
                        styles.buttonSecondary,
                        saving && styles.buttonDisabled,
                        pressed && !saving && styles.buttonSecondaryPressed,
                    ]}
                >
                    <Text style={styles.buttonSecondaryText}>이전</Text>
                </Pressable>

                <Pressable
                    onPress={handleSubmitPress}
                    disabled={isSubmitDisabled}
                    style={({ pressed }) => [
                        styles.button,
                        styles.buttonPrimary,
                        isSubmitDisabled && styles.buttonDisabled,
                        pressed && !isSubmitDisabled && styles.buttonPressed,
                    ]}
                >
                    <Text style={styles.buttonText}>{saving ? "저장 중..." : "지원 기록 추가"}</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <View style={styles.card}>
            {/* 회사명 */}
            <View style={styles.field}>
                <Text style={styles.label}>회사명</Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: 카카오페이"
                    placeholderTextColor="#6b7280"
                    value={company}
                    onChangeText={onCompanyChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                    returnKeyType="next"
                />
            </View>

            {/* 직무명 */}
            <View style={styles.field}>
                <Text style={styles.label}>직무명</Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: 데이터 산출 인턴"
                    placeholderTextColor="#6b7280"
                    value={resolvedPosition}
                    onChangeText={handlePositionChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                    returnKeyType="next"
                />
            </View>

            {/* 상태 */}
            <View style={styles.field}>
                <Text style={styles.label}>상태</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={status}
                        enabled={!saving}
                        dropdownIconColor="#e5e7eb"
                        onValueChange={(value) => onStatusChange(value as ApplicationStatus)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <Picker.Item key={opt.value} label={opt.label} value={opt.value} color="#e5e7eb" />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* ✅ 일정 섹션 */}
            {renderScheduleSection()}

            {/* 버튼 */}
            {renderButtons()}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* ✅ DateTimePicker 렌더 */}
            {openField && Platform.OS === "android" && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="calendar"
                    onChange={onAndroidChange}
                />
            )}

            {openField && Platform.OS === "ios" && (
                <Modal transparent animationType="fade" visible onRequestClose={closePicker}>
                    <Pressable style={styles.iosBackdrop} onPress={closePicker}>
                        <Pressable style={styles.iosSheet} onPress={() => {}}>
                            <View style={styles.iosHeader}>
                                <Pressable onPress={closePicker}>
                                    <Text style={styles.iosHeaderText}>취소</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        commitDate(openField, tempDate);
                                        closePicker();
                                    }}
                                >
                                    <Text style={[styles.iosHeaderText, styles.iosDone]}>완료</Text>
                                </Pressable>
                            </View>

                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="inline"
                                onChange={(_, d) => d && setTempDate(d)}
                            />
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 12,
        padding: 16,
        borderRadius: 14,
        backgroundColor: "#020617",
        borderWidth: 1,
        borderColor: "#1e293b",
    },

    field: { marginBottom: 14 },

    label: {
        fontSize: 12,
        color: "#e5e7eb",
        marginBottom: 4,
        fontWeight: "700",
    },

    input: {
        borderWidth: 1,
        borderColor: "#1e293b",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        color: "#f9fafb",
        fontSize: 14,
        backgroundColor: "#020617",
    },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#1e293b",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#020617",
    },
    picker: { color: "#e5e7eb", backgroundColor: "#020617" },
    pickerItem: { color: "#e5e7eb", fontSize: 14 },

    dateLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    clearText: {
        fontSize: 11,
        color: "#fda4af", // rose-300
        fontWeight: "700",
    },
    dateButton: {
        borderWidth: 1,
        borderColor: "#1e293b",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: "#020617",
    },
    dateButtonPressed: {
        borderColor: "#fb7185", // rose-400
    },
    dateButtonText: {
        color: "#f9fafb",
        fontSize: 14,
    },

    toggleRow: {
        marginTop: -4,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#1e293b",
        backgroundColor: "rgba(15,23,42,0.35)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleRowPressed: {
        backgroundColor: "rgba(15,23,42,0.55)",
    },
    toggleText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#e5e7eb",
    },
    toggleChevron: {
        fontSize: 12,
        color: "#9ca3af",
        fontWeight: "800",
    },

    buttonWrapper: { marginTop: 4, alignItems: "flex-end" },

    // 공통 버튼 베이스
    button: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        minWidth: 92,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: { opacity: 0.85 },
    buttonDisabled: { opacity: 0.4 },

    // primary/secondary
    buttonPrimary: { backgroundColor: "#22c55e" },
    buttonSecondary: {
        backgroundColor: "rgba(15,23,42,0.55)",
        borderWidth: 1,
        borderColor: "#1e293b",
    },
    buttonSecondaryPressed: { backgroundColor: "rgba(15,23,42,0.8)" },

    buttonText: { color: "#020617", fontSize: 13, fontWeight: "800" },
    buttonSecondaryText: { color: "#e5e7eb", fontSize: 13, fontWeight: "800" },

    stepButtonsRow: {
        marginTop: 4,
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    errorText: { marginTop: 8, fontSize: 11, color: "#f97373", fontWeight: "700" },

    iosBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.6)",
        justifyContent: "flex-end",
    },
    iosSheet: {
        backgroundColor: "#020617",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: "#1e293b",
        paddingBottom: 16,
    },
    iosHeader: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    iosHeaderText: {
        color: "#e5e7eb",
        fontSize: 14,
    },
    iosDone: {
        color: "#4ade80",
        fontWeight: "900",
    },
});