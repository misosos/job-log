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
                            styles.buttonPrimary,
                            isSubmitDisabled && styles.buttonDisabled,
                            pressed && !isSubmitDisabled && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.buttonText}>{saving ? "저장 중..." : "지원 기록 추가"}</Text>
                    </Pressable>
                </View>
            );
        }

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
                    placeholderTextColor="#fb7185" // ✅ rose-400
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
                    placeholderTextColor="#fb7185" // ✅ rose-400
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
                        dropdownIconColor="#9f1239" // ✅ rose-800 (아이콘이 안 보이던 문제 해결)
                        onValueChange={(value) => onStatusChange(value as ApplicationStatus)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <Picker.Item
                                key={opt.value}
                                label={opt.label}
                                value={opt.value}
                                color="#881337" // ✅ rose-900 (기존 #e5e7eb 제거)
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* 일정 */}
            {renderScheduleSection()}

            {/* 버튼 */}
            {renderButtons()}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* ✅ DateTimePicker 렌더 */}
            {openField && Platform.OS === "android" && (
                <DateTimePicker value={tempDate} mode="date" display="calendar" onChange={onAndroidChange} />
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
                                themeVariant="light"
                                textColor="#881337"
                                style={styles.iosPicker}
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
        backgroundColor: "#fff1f2", // rose-50
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    field: { marginBottom: 14 },

    label: {
        fontSize: 12,
        color: "#9f1239", // rose-800
        marginBottom: 4,
        fontWeight: "700",
    },

    input: {
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        color: "#881337", // rose-900
        fontSize: 14,
        backgroundColor: "#fff1f2", // rose-50
    },

    // ✅ 상태 Picker: 배경을 rose-100으로 올려 대비 강화
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#fecdd3",     // rose-200
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#ffe4e6", // ✅ rose-100
    },

    // Android: Picker 텍스트 컬러는 style.color가 잘 먹음
    // iOS: itemStyle / Picker.Item color가 더 잘 먹는 편
    picker: {
        color: "#881337", // ✅ rose-900
        backgroundColor: "#ffe4e6",
        height: Platform.select({ ios: 180, android: 44 }),
    },
    pickerItem: { color: "#881337", fontSize: 14 },

    dateLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    clearText: {
        fontSize: 11,
        color: "#f43f5e", // rose-500
        fontWeight: "800",
    },

    dateButton: {
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: "#fff1f2", // rose-50
    },

    dateButtonPressed: {
        borderColor: "#fb7185", // rose-400
    },

    dateButtonText: {
        color: "#881337", // rose-900
        fontSize: 14,
    },

    toggleRow: {
        marginTop: -4,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "rgba(251, 113, 133, 0.10)", // rose-400 10%
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    toggleRowPressed: {
        backgroundColor: "rgba(251, 113, 133, 0.18)",
    },

    toggleText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#9f1239", // rose-800
    },

    toggleChevron: {
        fontSize: 12,
        color: "#fb7185", // rose-400
        fontWeight: "900",
    },

    buttonWrapper: { marginTop: 4, alignItems: "flex-end" },

    button: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        minWidth: 92,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonPressed: { opacity: 0.88 },
    buttonDisabled: { opacity: 0.45 },

    buttonPrimary: { backgroundColor: "#f43f5e" }, // rose-500
    buttonSecondary: {
        backgroundColor: "#ffe4e6", // rose-100
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },
    buttonSecondaryPressed: { backgroundColor: "#fecdd3" }, // rose-200

    buttonText: { color: "#fff1f2", fontSize: 13, fontWeight: "900" }, // rose-50
    buttonSecondaryText: { color: "#9f1239", fontSize: 13, fontWeight: "900" }, // rose-800

    stepButtonsRow: {
        marginTop: 4,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },

    errorText: { marginTop: 8, fontSize: 11, color: "#e11d48", fontWeight: "800" }, // rose-600

    iosBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        justifyContent: "flex-end",
    },

    iosSheet: {
        backgroundColor: "#ffe4e6", // rose-100 (캘린더 배경 대비)
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        paddingBottom: 16,
    },

    iosPicker: {
        backgroundColor: "#ffe4e6", // rose-100
    },

    iosHeader: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    iosHeaderText: {
        color: "#9f1239", // rose-800
        fontSize: 14,
        fontWeight: "700",
    },

    iosDone: {
        color: "#f43f5e", // rose-500
        fontWeight: "900",
    },
});