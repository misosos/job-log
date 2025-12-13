import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Modal, View, Text, Pressable, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

import type { ApplicationStatus, ApplicationRow } from "../../../../shared/features/applications/types";

// theme tokens (경로만 맞춰줘)
import { colors, space, radius, font } from "../../styles/theme";

type Props = {
    open: boolean;
    target: ApplicationRow | null;
    saving: boolean;
    error?: string | null;
    onClose: () => void;
    onSave: (
        id: string,
        status: ApplicationStatus,
        meta?: {
            appliedAt?: string | null;
            docDeadline?: string | null;
            interviewAt?: string | null;
            finalResultAt?: string | null;
        },
    ) => void;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
    "지원 예정",
    "서류 제출",
    "서류 통과",
    "면접 예정",
    "면접 완료",
    "최종 합격",
    "불합격",
    "지원 철회",
];

// ---- Timestamp-like guard (no any) ----
type TimestampLike = { toDate: () => Date };
function isTimestampLike(v: unknown): v is TimestampLike {
    return typeof v === "object" && v !== null && "toDate" in v && typeof (v as any).toDate === "function";
}

type DateLike = unknown;

/** Date/Timestamp/string -> YYYY-MM-DD | null */
function toYmd(value: DateLike): string | null {
    if (!value) return null;

    if (typeof value === "string") {
        const v = value.trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    }

    const date = value instanceof Date ? value : isTimestampLike(value) ? value.toDate() : null;
    if (!date) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function ymdToDateOrNow(ymd?: string | null): Date {
    const v = (ymd ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date();
    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function dateToYmd(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// 레거시/확장 필드도 안전하게 읽기 위한 확장 타입
type ApplicationRowExtended = ApplicationRow & {
    position?: unknown;

    appliedAt?: unknown;

    docDeadline?: unknown;
    interviewAt?: unknown;
    finalResultAt?: unknown;

    // 레거시 호환 키
    documentDeadline?: unknown;
    interviewDate?: unknown;
    finalResultDate?: unknown;
};

type PickerField = "appliedAt" | "docDeadline" | "interviewAt" | "finalResultAt";

export function ApplicationEditModal({ open, target, saving, error, onClose, onSave }: Props) {
    const [status, setStatus] = useState<ApplicationStatus>("지원 예정");

    const [appliedAt, setAppliedAt] = useState<string | null>(null);
    const [docDeadline, setDocDeadline] = useState<string | null>(null);
    const [interviewAt, setInterviewAt] = useState<string | null>(null);
    const [finalResultAt, setFinalResultAt] = useState<string | null>(null);

    // DatePicker controller
    const [openField, setOpenField] = useState<PickerField | null>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const ext = target as ApplicationRowExtended | null;

    // -----------------------------
    //  init from target
    // -----------------------------
    useEffect(() => {
        setStatus((ext?.status as ApplicationStatus) ?? "지원 예정");

        setAppliedAt(toYmd(ext?.appliedAt ?? null));
        setDocDeadline(toYmd(ext?.docDeadline ?? ext?.documentDeadline ?? ext?.deadline ?? null));
        setInterviewAt(toYmd(ext?.interviewAt ?? ext?.interviewDate ?? null));
        setFinalResultAt(toYmd(ext?.finalResultAt ?? ext?.finalResultDate ?? null));
    }, [ext]);

    const positionLabel = useMemo(() => {
        const p = typeof ext?.position === "string" ? ext?.position : "";
        return (p ?? "").trim() || (target?.position ?? "").trim() || (target?.role ?? "").trim() || "";
    }, [ext?.position, target?.position, target?.role]);

    // -----------------------------
    //  field value getter/setter
    // -----------------------------
    const getFieldValue = useCallback(
        (field: PickerField) => {
            if (field === "appliedAt") return appliedAt;
            if (field === "docDeadline") return docDeadline;
            if (field === "interviewAt") return interviewAt;
            return finalResultAt;
        },
        [appliedAt, docDeadline, interviewAt, finalResultAt],
    );

    const setFieldValue = useCallback((field: PickerField, value: string | null) => {
        if (field === "appliedAt") setAppliedAt(value);
        if (field === "docDeadline") setDocDeadline(value);
        if (field === "interviewAt") setInterviewAt(value);
        if (field === "finalResultAt") setFinalResultAt(value);
    }, []);

    const clearFieldValue = useCallback(
        (field: PickerField) => {
            if (saving) return;
            setFieldValue(field, null);
        },
        [saving, setFieldValue],
    );

    // -----------------------------
    // picker open/close/commit
    // -----------------------------
    const openPicker = useCallback(
        (field: PickerField) => {
            if (saving) return;
            setTempDate(ymdToDateOrNow(getFieldValue(field)));
            setOpenField(field);
        },
        [saving, getFieldValue],
    );

    const closePicker = useCallback(() => setOpenField(null), []);

    const commitDate = useCallback(
        (field: PickerField, date: Date) => {
            setFieldValue(field, dateToYmd(date));
        },
        [setFieldValue],
    );

    const onAndroidChange = useCallback(
        (event: DateTimePickerEvent, selected?: Date) => {
            if (event.type === "dismissed") {
                closePicker();
                return;
            }
            if (!openField) return;
            commitDate(openField, selected ?? tempDate);
            closePicker();
        },
        [openField, tempDate, commitDate, closePicker],
    );

    // -----------------------------
    //  submit
    // -----------------------------
    const handleSubmit = useCallback(() => {
        if (!target || saving) return;

        onSave(target.id, status, {
            appliedAt,
            docDeadline,
            interviewAt,
            finalResultAt,
        });
    }, [target, saving, onSave, status, appliedAt, docDeadline, interviewAt, finalResultAt]);

    // -----------------------------
    //  DateField component
    // -----------------------------
    const DateField = useCallback(
        ({ label, field }: { label: string; field: PickerField }) => {
            const display = (getFieldValue(field) ?? "").trim();

            return (
                <View style={styles.gridItem}>
                    <View style={styles.dateLabelRow}>
                        <Text style={styles.label}>{label}</Text>
                        {!!display && (
                            <Pressable onPress={() => clearFieldValue(field)} disabled={saving} hitSlop={8}>
                                <Text style={styles.clearText}>지우기</Text>
                            </Pressable>
                        )}
                    </View>

                    <Pressable
                        onPress={() => openPicker(field)}
                        disabled={saving}
                        style={({ pressed }) => [styles.dateButton, pressed && !saving && styles.dateButtonPressed]}
                    >
                        <Text style={styles.dateButtonText}>{display || "선택 (YYYY-MM-DD)"}</Text>
                    </Pressable>
                </View>
            );
        },
        [getFieldValue, clearFieldValue, openPicker, saving],
    );

    const dateFields = useMemo(
        () =>
            [
                { label: "지원일", field: "appliedAt" as const },
                { label: "서류 마감일", field: "docDeadline" as const },
                { label: "면접일", field: "interviewAt" as const },
                { label: "최종 발표일", field: "finalResultAt" as const },
            ] as const,
        [],
    );

    return (
        <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.container} onPress={() => {}}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>지원 상태 수정</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 회사 / 직무 정보 */}
                    {target && (
                        <View style={styles.targetInfo}>
                            <Text style={styles.companyText} numberOfLines={1}>
                                {target.company}
                            </Text>
                            <Text style={styles.roleText} numberOfLines={2}>
                                {positionLabel}
                            </Text>
                        </View>
                    )}

                    {/* 상태 */}
                    <View style={styles.field}>
                        <Text style={styles.label}>지원 상태</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={status}
                                enabled={!saving}
                                onValueChange={(value) => setStatus(value as ApplicationStatus)}
                                dropdownIconColor={colors.textSub}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <Picker.Item key={s} label={s} value={s} color={colors.textStrong} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* 날짜 4종 */}
                    <View style={styles.grid}>
                        {dateFields.map((f) => (
                            <DateField key={f.field} label={f.label} field={f.field} />
                        ))}
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* 푸터 버튼 */}
                    <View style={styles.footer}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [styles.button, styles.buttonGray, pressed && styles.buttonGrayPressed]}
                        >
                            <Text style={styles.buttonGrayText}>취소</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={saving}
                            style={({ pressed }) => [
                                styles.button,
                                styles.buttonPrimary,
                                pressed && styles.buttonPrimaryPressed,
                                saving && styles.buttonDisabled,
                            ]}
                        >
                            <Text style={styles.buttonPrimaryText}>{saving ? "저장 중..." : "저장"}</Text>
                        </Pressable>
                    </View>

                    {/* DateTimePicker */}
                    {openField && Platform.OS === "android" && (
                        <DateTimePicker value={tempDate} mode="date" display="calendar" onChange={onAndroidChange} />
                    )}

                    {openField && Platform.OS === "ios" && (
                        <Modal transparent animationType="fade" visible onRequestClose={closePicker}>
                            <Pressable style={styles.iosBackdrop} onPress={closePicker}>
                                <Pressable style={styles.iosSheet} onPress={() => {}}>
                                    <View style={styles.iosHeader}>
                                        <Pressable onPress={closePicker} hitSlop={8}>
                                            <Text style={styles.iosHeaderText}>취소</Text>
                                        </Pressable>

                                        <Pressable
                                            hitSlop={8}
                                            onPress={() => {
                                                if (openField) commitDate(openField, tempDate);
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
                                        accentColor={colors.accent}
                                        textColor={colors.textStrong}
                                        style={styles.iosPicker}
                                        onChange={(_, d) => d && setTempDate(d)}
                                    />
                                </Pressable>
                            </Pressable>
                        </Modal>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: space.lg,
    },

    container: {
        width: "100%",
        maxWidth: 420,
        borderRadius: radius.lg + 2, // 18 느낌
        backgroundColor: colors.bg,
        paddingHorizontal: space.lg + 2, // 18 느낌
        paddingVertical: space.lg + 4, // 20 느낌
        borderWidth: 1,
        borderColor: colors.border,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.lg - 2, // 14 느낌
    },

    title: {
        fontSize: 17, // token에 17 없음 → 유지(원하면 font.modalTitle 추가)
        fontWeight: "800",
        color: colors.textStrong,
    },

    closeText: {
        color: colors.accent,
        fontSize: 20,
        fontWeight: "900",
    },

    targetInfo: { marginBottom: space.lg - 2 },

    companyText: {
        fontSize: font.h2, // 15
        fontWeight: "800",
        color: colors.textStrong,
    },

    roleText: {
        fontSize: font.body, // 13
        color: colors.textSub,
        marginTop: space.xs,
        fontWeight: "700",
    },

    field: { marginBottom: space.lg - 2 },

    label: {
        fontSize: font.small + 1, // 12 느낌
        color: colors.textSub,
        marginBottom: space.sm - 2, // 6 느낌
        fontWeight: "700",
    },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm + 2, // 10 느낌
        backgroundColor: colors.bg,
        overflow: "hidden",
    },

    picker: {
        height: Platform.select({ ios: 180, android: 44 }),
        color: colors.textStrong,
        backgroundColor: colors.bg,
    },

    pickerItem: {
        color: colors.textStrong,
        fontSize: 14, // token에 14 없음 → 유지(원하면 font.input 추가)
        fontWeight: "700",
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.md - 2, // 10 느낌
    },

    gridItem: {
        flexBasis: "48%",
        flexGrow: 1,
        marginBottom: space.md - 2, // 10 느낌
    },

    dateLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.xs,
    },

    clearText: {
        fontSize: font.small,
        color: colors.accent,
        fontWeight: "800",
    },

    dateButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm + 2,
        paddingHorizontal: space.lg,
        paddingVertical: space.md - 1, // 11 느낌
        backgroundColor: colors.bg,
    },

    dateButtonPressed: { borderColor: colors.placeholder },

    dateButtonText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "700",
    },

    errorText: {
        marginTop: space.sm - 2, // 6 느낌
        fontSize: font.small,
        color: colors.textSub, // 에러 전용 토큰 없어서 textSub로 연결
        fontWeight: "800",
    },

    footer: {
        marginTop: space.lg + 2, // 18 느낌
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    button: {
        paddingHorizontal: space.lg, // 16
        paddingVertical: space.md - 3, // 9 느낌
        borderRadius: radius.pill,
        minWidth: 84,
        alignItems: "center",
    },

    buttonGray: {
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: space.md - 4, // 8
    },

    buttonGrayPressed: { backgroundColor: colors.border },

    buttonGrayText: {
        fontSize: font.body,
        color: colors.textSub,
        fontWeight: "900",
    },

    buttonPrimary: { backgroundColor: colors.accent },

    buttonPrimaryPressed: { backgroundColor: colors.placeholder },

    buttonPrimaryText: {
        fontSize: font.body,
        fontWeight: "900",
        color: colors.bg,
    },

    buttonDisabled: { opacity: 0.65 },

    iosBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.55)", //  (원하면 tokens에 추가 가능)
        justifyContent: "flex-end",
    },

    iosSheet: {
        backgroundColor: colors.section,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingBottom: space.lg,
    },

    iosPicker: { backgroundColor: colors.section },

    iosHeader: {
        paddingHorizontal: space.lg - 2, // 14 느낌
        paddingTop: space.lg - 4, // 12 느낌
        paddingBottom: space.md - 4, // 8 느낌
        flexDirection: "row",
        justifyContent: "space-between",
    },

    iosHeaderText: {
        color: colors.textSub,
        fontSize: 14,
        fontWeight: "800",
    },

    iosDone: {
        color: colors.accent,
        fontWeight: "900",
    },
});