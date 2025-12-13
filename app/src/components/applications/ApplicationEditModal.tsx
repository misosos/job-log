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
                                dropdownIconColor="#e5e7eb"
                                style={styles.picker}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <Picker.Item key={s} label={s} value={s} color="#e5e7eb" />
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
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    container: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 18,
        backgroundColor: "#020617",
        paddingHorizontal: 18,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: "#1f2937",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
        color: "#e5e7eb",
    },
    closeText: {
        color: "#9ca3af",
        fontSize: 20,
    },
    targetInfo: {
        marginBottom: 14,
    },
    companyText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#f9fafb",
    },
    roleText: {
        fontSize: 13,
        color: "#9ca3af",
        marginTop: 4,
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        color: "#e5e7eb",
        marginBottom: 6,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#1f2937",
        borderRadius: 10,
        backgroundColor: "#020617",
        overflow: "hidden",
    },
    picker: {
        height: Platform.select({ ios: 180, android: 44 }),
        color: "#e5e7eb",
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
        color: "#fda4af",
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
        borderColor: "#fb7185",
    },
    dateButtonText: {
        color: "#f9fafb",
        fontSize: 14,
    },

    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: "#f87171",
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
    buttonGray: {
        backgroundColor: "#111827",
        marginRight: 8,
    },
    buttonGrayPressed: {
        backgroundColor: "#1f2937",
    },
    buttonGrayText: {
        fontSize: 13,
        color: "#e5e7eb",
    },
    buttonPrimary: {
        backgroundColor: "#22c55e",
    },
    buttonPrimaryPressed: {
        backgroundColor: "#4ade80",
    },
    buttonPrimaryText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#020617",
    },
    buttonDisabled: {
        opacity: 0.7,
    },

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
        fontWeight: "700",
    },
});