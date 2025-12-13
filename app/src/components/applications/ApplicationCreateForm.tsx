import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { StatusPicker } from "./StatusPicker";
import type { ApplicationStatus } from "../../../../shared/features/applications/types";
import { DateField } from "./DateField";
import { IOSDatePickerSheet } from "./datePicker/IOSDatePickerSheet";
import { PickerField, useDatePickerController } from "./datePicker/useDatePickerController";

import { colors, space, radius, font } from "../../styles/theme";

type Props = {
    company: string;
    variant?: "full" | "twoStep";

    position?: string;
    role?: string;

    status: ApplicationStatus;

    appliedAt?: string;

    docDeadline?: string;
    interviewAt?: string;
    finalResultAt?: string;

    deadline?: string;

    saving: boolean;
    error: string | null;

    onCompanyChange: (value: string) => void;

    onPositionChange?: (value: string) => void;
    onRoleChange?: (value: string) => void;

    onStatusChange: (value: ApplicationStatus) => void;

    onAppliedAtChange?: (value: string) => void;
    onDocDeadlineChange?: (value: string) => void;
    onInterviewAtChange?: (value: string) => void;
    onFinalResultAtChange?: (value: string) => void;

    onDeadlineChange?: (value: string) => void;

    onSubmit: () => void;
};

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

                                          onDeadlineChange,

                                          onSubmit,
                                      }: Props) {
    const uiVariant = variant ?? "full";

    const resolvedPosition = useMemo(
        () => (position ?? "").trim() || (role ?? "").trim() || "",
        [position, role],
    );
    const resolvedDocDeadline = useMemo(
        () => (docDeadline ?? "").trim() || (deadline ?? "").trim() || "",
        [docDeadline, deadline],
    );

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
    // twoStep 상태
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
    //  날짜 값 get/set/clear
    // -----------------------------
    const getFieldValue = useCallback(
        (field: PickerField) => {
            if (field === "appliedAt") return (appliedAt ?? "").trim();
            if (field === "docDeadline") return resolvedDocDeadline;
            if (field === "interviewAt") return (interviewAt ?? "").trim();
            return (finalResultAt ?? "").trim();
        },
        [appliedAt, resolvedDocDeadline, interviewAt, finalResultAt],
    );

    const setFieldValue = useCallback(
        (field: PickerField, ymd: string) => {
            if (field === "appliedAt") onAppliedAtChange?.(ymd);
            if (field === "docDeadline") handleDocDeadlineChange(ymd);
            if (field === "interviewAt") onInterviewAtChange?.(ymd);
            if (field === "finalResultAt") onFinalResultAtChange?.(ymd);
        },
        [onAppliedAtChange, handleDocDeadlineChange, onInterviewAtChange, onFinalResultAtChange],
    );

    const clearFieldValue = useCallback(
        (field: PickerField) => {
            if (saving) return;
            if (field === "appliedAt") onAppliedAtChange?.("");
            if (field === "docDeadline") handleDocDeadlineChange("");
            if (field === "interviewAt") onInterviewAtChange?.("");
            if (field === "finalResultAt") onFinalResultAtChange?.("");
        },
        [saving, onAppliedAtChange, handleDocDeadlineChange, onInterviewAtChange, onFinalResultAtChange],
    );

    // -----------------------------
    // DatePicker Controller
    // -----------------------------
    const { openField, tempDate, setTempDate, openPicker, closePicker, onAndroidChange, onIOSDone } =
        useDatePickerController({
            saving,
            getValue: getFieldValue,
            onCommit: setFieldValue,
        });

    const scheduleFieldsFull = useMemo(
        () =>
            [
                { label: "지원일", field: "appliedAt" as const },
                { label: "서류 마감일", field: "docDeadline" as const },
                { label: "면접일", field: "interviewAt" as const },
                { label: "최종 발표일", field: "finalResultAt" as const },
            ] as const,
        [],
    );

    const scheduleFieldsExtra = useMemo(
        () =>
            [
                { label: "지원일", field: "appliedAt" as const },
                { label: "면접일", field: "interviewAt" as const },
                { label: "최종 발표일", field: "finalResultAt" as const },
            ] as const,
        [],
    );

    return (
        <View style={styles.card}>
            {/* 회사명 */}
            <View style={styles.field}>
                <Text style={styles.label}>회사명</Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: 카카오페이"
                    placeholderTextColor={colors.placeholder}
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
                    placeholderTextColor={colors.placeholder}
                    value={resolvedPosition}
                    onChangeText={handlePositionChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                    returnKeyType="next"
                />
            </View>

            {/* 상태 */}
            <StatusPicker value={status} disabled={saving} onChange={onStatusChange} />

            {/* 일정 */}
            {uiVariant === "full" ? (
                <>
                    {scheduleFieldsFull.map((f) => (
                        <DateField
                            key={f.field}
                            label={f.label}
                            value={getFieldValue(f.field)}
                            disabled={saving}
                            onOpen={() => openPicker(f.field)}
                            onClear={() => clearFieldValue(f.field)}
                        />
                    ))}
                </>
            ) : (
                <>
                    {step === 2 && (
                        <>
                            <DateField
                                label="서류 마감일"
                                value={getFieldValue("docDeadline")}
                                disabled={saving}
                                onOpen={() => openPicker("docDeadline")}
                                onClear={() => clearFieldValue("docDeadline")}
                            />

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

                            {showExtraDates &&
                                scheduleFieldsExtra.map((f) => (
                                    <DateField
                                        key={f.field}
                                        label={f.label}
                                        value={getFieldValue(f.field)}
                                        disabled={saving}
                                        onOpen={() => openPicker(f.field)}
                                        onClear={() => clearFieldValue(f.field)}
                                    />
                                ))}
                        </>
                    )}
                </>
            )}

            {/* 버튼 */}
            {uiVariant === "full" ? (
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
            ) : (
                <>
                    {step === 1 ? (
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
                    ) : (
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
                    )}
                </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/*  Android picker */}
            {openField && Platform.OS === "android" && (
                <DateTimePicker value={tempDate} mode="date" display="calendar" onChange={onAndroidChange} />
            )}

            {/*  iOS picker sheet */}
            <IOSDatePickerSheet
                open={Platform.OS === "ios" && !!openField}
                date={tempDate}
                onChange={setTempDate}
                onCancel={closePicker}
                onDone={onIOSDone}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: space.md, // 12 느낌
        padding: space.lg,
        borderRadius: radius.md + 2, // 14 느낌
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
    },

    field: { marginBottom: space.lg - 2 }, // 14 근사

    label: {
        fontSize: font.small + 1, // 12 느낌
        color: colors.text,
        marginBottom: space.xs,
        fontWeight: "700",
    },

    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm + 2, // 10 느낌
        paddingHorizontal: space.lg,
        paddingVertical: space.md - 3, // 9 느낌
        color: colors.textStrong,
        fontSize: 14, // font 토큰에 input 사이즈 없어서 유지 (원하면 font.input 추가)
        backgroundColor: colors.bg,
    },

    toggleRow: {
        marginTop: -space.xs,
        marginBottom: space.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.md - 2, // 10 느낌
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.accentSoft,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleRowPressed: { opacity: 0.9 },
    toggleText: { fontSize: font.small + 1, fontWeight: "800", color: colors.text },
    toggleChevron: { fontSize: font.small + 1, color: colors.placeholder, fontWeight: "900" },

    buttonWrapper: { marginTop: space.xs, alignItems: "flex-end" },

    button: {
        paddingHorizontal: space.lg + 2, // 18 느낌
        paddingVertical: space.md - 2, // 10 느낌
        borderRadius: radius.pill,
        minWidth: 92,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: { opacity: 0.88 },
    buttonDisabled: { opacity: 0.45 },

    buttonPrimary: { backgroundColor: colors.accent },
    buttonSecondary: {
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonSecondaryPressed: { backgroundColor: colors.border },

    buttonText: { color: colors.bg, fontSize: font.body, fontWeight: "900" },
    buttonSecondaryText: { color: colors.text, fontSize: font.body, fontWeight: "900" },

    stepButtonsRow: {
        marginTop: space.xs,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: space.md, // RN 구버전이면 gap 대신 marginRight 방식으로 변경
    },

    errorText: {
        marginTop: space.sm,
        fontSize: font.small,
        color: colors.textSub, // 에러 전용 토큰 없어서 textSub로 연결
        fontWeight: "800",
    },
});