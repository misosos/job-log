// app/src/components/applications/ApplicationEditModal.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import type { ApplicationStatus, ApplicationRow } from "../../../../shared/features/applications/types";

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
    return (
        typeof v === "object" &&
        v !== null &&
        "toDate" in v &&
        typeof (v as { toDate?: unknown }).toDate === "function"
    );
}

type DateLike = unknown;

function toYmd(value: DateLike): string | null {
    if (!value) return null;

    if (typeof value === "string") {
        const v = value.trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    }

    const date =
        value instanceof Date ? value : isTimestampLike(value) ? value.toDate() : null;

    if (!date) return null;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function ymdToDate(ymd?: string | null): Date | null {
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

// ✅ 레거시/확장 필드도 안전하게 읽기 위한 확장 타입
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

export function ApplicationEditModal({
                                         open,
                                         target,
                                         saving,
                                         error,
                                         onClose,
                                         onSave,
                                     }: Props) {
    const [status, setStatus] = useState<ApplicationStatus>("지원 예정");

    const [appliedAt, setAppliedAt] = useState<string | null>(null);
    const [docDeadline, setDocDeadline] = useState<string | null>(null);
    const [interviewAt, setInterviewAt] = useState<string | null>(null);
    const [finalResultAt, setFinalResultAt] = useState<string | null>(null);

    // ✅ DatePicker controller
    const [openField, setOpenField] = useState<PickerField | null>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    useEffect(() => {
        const t = target as ApplicationRowExtended | null;

        setStatus((t?.status as ApplicationStatus) ?? "지원 예정");

        setAppliedAt(toYmd(t?.appliedAt ?? null));
        setDocDeadline(toYmd(t?.docDeadline ?? t?.documentDeadline ?? t?.deadline ?? null));
        setInterviewAt(toYmd(t?.interviewAt ?? t?.interviewDate ?? null));
        setFinalResultAt(toYmd(t?.finalResultAt ?? t?.finalResultDate ?? null));
    }, [target]);

    const handleSubmit = useCallback(() => {
        if (!target || saving) return;

        onSave(target.id, status, {
            appliedAt,
            docDeadline,
            interviewAt,
            finalResultAt,
        });
    }, [target, saving, onSave, status, appliedAt, docDeadline, interviewAt, finalResultAt]);

    const t = target as ApplicationRowExtended | null;
    const positionLabel =
        (typeof t?.position === "string" ? t.position : "") ||
        target?.position ||
        target?.role ||
        "";

    const openPicker = useCallback(
        (field: PickerField) => {
            if (saving) return;

            const currentYmd =
                field === "appliedAt"
                    ? appliedAt
                    : field === "docDeadline"
                        ? docDeadline
                        : field === "interviewAt"
                            ? interviewAt
                            : finalResultAt;

            setTempDate(ymdToDate(currentYmd) ?? new Date());
            setOpenField(field);
        },
        [saving, appliedAt, docDeadline, interviewAt, finalResultAt],
    );

    const closePicker = useCallback(() => setOpenField(null), []);

    const commitDate = useCallback((field: PickerField, date: Date) => {
        const ymd = dateToYmd(date);
        if (field === "appliedAt") setAppliedAt(ymd);
        if (field === "docDeadline") setDocDeadline(ymd);
        if (field === "interviewAt") setInterviewAt(ymd);
        if (field === "finalResultAt") setFinalResultAt(ymd);
    }, []);

    const clearDate = useCallback((field: PickerField) => {
        if (saving) return;
        if (field === "appliedAt") setAppliedAt(null);
        if (field === "docDeadline") setDocDeadline(null);
        if (field === "interviewAt") setInterviewAt(null);
        if (field === "finalResultAt") setFinalResultAt(null);
    }, [saving]);

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

    const renderDateField = (label: string, field: PickerField, value: string | null) => {
        const display = (value ?? "").trim();
        return (
            <View style={styles.gridItem}>
                <View style={styles.dateLabelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {!!display && (
                        <Pressable onPress={() => clearDate(field)} disabled={saving}>
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
                    <Text style={styles.dateButtonText}>
                        {display || "선택 (YYYY-MM-DD)"}
                    </Text>
                </Pressable>
            </View>
        );
    };

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
                                dropdownIconColor="#be123c"
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <Picker.Item key={s} label={s} value={s} color="#881337" />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* ✅ 날짜 4종: 캘린더 선택 */}
                    <View style={styles.grid}>
                        {renderDateField("지원일", "appliedAt", appliedAt)}
                        {renderDateField("서류 마감일", "docDeadline", docDeadline)}
                        {renderDateField("면접일", "interviewAt", interviewAt)}
                        {renderDateField("최종 발표일", "finalResultAt", finalResultAt)}
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* 푸터 버튼 */}
                    <View style={styles.footer}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                styles.button,
                                styles.buttonGray,
                                pressed && styles.buttonGrayPressed,
                            ]}
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

                    {/* ✅ DateTimePicker */}
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
                                        accentColor="#f43f5e"
                                        textColor="#881337"
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
        backgroundColor: "rgba(159, 18, 57, 0.25)", // rose-800 overlay
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },

    container: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 18,
        backgroundColor: "#fff1f2", // rose-50
        paddingHorizontal: 18,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
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
        marginBottom: 14,
    },

    title: {
        fontSize: 17,
        fontWeight: "800",
        color: "#881337", // rose-900 (필요할 때만 진하게)
    },

    closeText: {
        color: "#f43f5e", // rose-500 (포인트)
        fontSize: 20,
        fontWeight: "900",
    },

    targetInfo: {
        marginBottom: 14,
    },

    companyText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#881337", // rose-900
    },

    roleText: {
        fontSize: 13,
        color: "#be123c", // rose-700
        marginTop: 4,
        fontWeight: "700",
    },

    field: {
        marginBottom: 14,
    },

    label: {
        fontSize: 12,
        color: "#be123c", // rose-700
        marginBottom: 6,
        fontWeight: "700",
    },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        borderRadius: 10,
        backgroundColor: "#fff1f2", // rose-50
        overflow: "hidden",
    },

    picker: {
        height: Platform.select({ ios: 180, android: 44 }),
        color: "#881337", // rose-900
        backgroundColor: "#fff1f2", // rose-50
    },

    pickerItem: {
        color: "#881337", // rose-900
        fontSize: 14,
        fontWeight: "700",
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    gridItem: {
        flexBasis: "48%",
        flexGrow: 1,
        marginBottom: 10,
    },

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
        color: "#9f1239", // rose-800
        fontSize: 14,
        fontWeight: "700",
    },

    errorText: {
        marginTop: 6,
        fontSize: 11,
        color: "#e11d48", // rose-600
        fontWeight: "800",
    },

    footer: {
        marginTop: 18,
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    button: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 999,
        minWidth: 84,
        alignItems: "center",
    },

    // ✅ 취소 버튼도 로즈-서브 톤
    buttonGray: {
        backgroundColor: "#ffe4e6", // rose-100
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        marginRight: 8,
    },

    buttonGrayPressed: {
        backgroundColor: "#fecdd3", // rose-200
    },

    buttonGrayText: {
        fontSize: 13,
        color: "#be123c", // rose-700
        fontWeight: "900",
    },

    // ✅ 저장 버튼: 포인트 로즈
    buttonPrimary: {
        backgroundColor: "#f43f5e", // rose-500
    },

    buttonPrimaryPressed: {
        backgroundColor: "#fb7185", // rose-400
    },

    buttonPrimaryText: {
        fontSize: 13,
        fontWeight: "900",
        color: "#fff1f2", // rose-50
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    iosBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.55)", // darken for contrast
        justifyContent: "flex-end",
    },

    iosSheet: {
        backgroundColor: "#ffe4e6", // rose-100
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
        color: "#be123c", // rose-700
        fontSize: 14,
        fontWeight: "800",
    },

    iosDone: {
        color: "#f43f5e", // rose-500
        fontWeight: "900",
    },
});