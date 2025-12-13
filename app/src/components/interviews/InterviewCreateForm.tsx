import React, { useCallback, useMemo, useReducer, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    Modal,
    Pressable,
} from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

import type { CreateInterviewFormValues } from "../../features/interviews/useInterviewPageController";
import { colors, font, radius, space } from "../../styles/theme";

type Props = {
    saving: boolean;
    error?: string | null;
    onSubmit: (values: CreateInterviewFormValues) => Promise<void> | void;
};

type FormState = {
    company: string;
    role: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    type: string;
    note: string;
};

const INITIAL_STATE: FormState = {
    company: "",
    role: "",
    date: "",
    time: "",
    type: "온라인",
    note: "",
};

type Action = { type: "set"; key: keyof FormState; value: string } | { type: "reset" };

function reducer(state: FormState, action: Action): FormState {
    switch (action.type) {
        case "set":
            return { ...state, [action.key]: action.value };
        case "reset":
            return INITIAL_STATE;
        default:
            return state;
    }
}

function dateToYmd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function ymdToDate(ymd?: string): Date {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return new Date();
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
}

function dateToHm(date: Date): string {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function hmToDate(hm?: string): Date {
    const now = new Date();
    if (!hm || !/^\d{2}:\d{2}$/.test(hm)) return now;
    const [h, m] = hm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return now;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
}

export function InterviewCreateForm({ saving, error, onSubmit }: Props) {
    const [form, dispatch] = useReducer(reducer, INITIAL_STATE);

    // ✅ date/time picker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const setField = useCallback(
        (key: keyof FormState) => (value: string) => dispatch({ type: "set", key, value }),
        [],
    );

    const canSubmit = useMemo(() => {
        if (saving) return false;
        return form.company.trim().length > 0 && form.role.trim().length > 0 && form.date.trim().length > 0;
    }, [saving, form.company, form.role, form.date]);

    const payload = useMemo<CreateInterviewFormValues>(
        () => ({
            company: form.company.trim(),
            role: form.role.trim(),
            date: form.date.trim(),
            time: form.time.trim(),
            type: form.type.trim(),
            note: form.note,
        }),
        [form],
    );

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) return;
        await onSubmit(payload);
        dispatch({ type: "reset" });
    }, [canSubmit, onSubmit, payload]);

    // -----------------------------
    // Date picker
    // -----------------------------
    const openDatePicker = useCallback(() => {
        if (saving) return;
        setShowDatePicker(true);
    }, [saving]);

    const closeDatePicker = useCallback(() => setShowDatePicker(false), []);

    const onChangeDate = useCallback(
        (_e: DateTimePickerEvent, selected?: Date) => {
            if (Platform.OS === "android") closeDatePicker();
            if (!selected) return;
            setField("date")(dateToYmd(selected));
        },
        [closeDatePicker, setField],
    );

    // -----------------------------
    // Time picker
    // -----------------------------
    const openTimePicker = useCallback(() => {
        if (saving) return;
        setShowTimePicker(true);
    }, [saving]);

    const closeTimePicker = useCallback(() => setShowTimePicker(false), []);

    const onChangeTime = useCallback(
        (_e: DateTimePickerEvent, selected?: Date) => {
            if (Platform.OS === "android") closeTimePicker();
            if (!selected) return;
            setField("time")(dateToHm(selected));
        },
        [closeTimePicker, setField],
    );

    return (
        <View style={styles.container}>
            {/* 회사명 */}
            <View style={styles.field}>
                <Text style={styles.label}>회사명</Text>
                <TextInput
                    value={form.company}
                    onChangeText={setField("company")}
                    placeholder="예: IBK기업은행, 카카오페이 등"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    editable={!saving}
                />
            </View>

            {/* 직무 / 포지션 */}
            <View style={styles.field}>
                <Text style={styles.label}>직무 / 포지션</Text>
                <TextInput
                    value={form.role}
                    onChangeText={setField("role")}
                    placeholder="예: 디지털 인턴, 데이터 분석 인턴 등"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    editable={!saving}
                />
            </View>

            {/* 면접 일자 / 시간 */}
            <View style={styles.row}>
                {/*  면접 일자 */}
                <View style={[styles.field, styles.fieldHalf, styles.rowItemLeft]}>
                    <Text style={styles.label}>면접 일자</Text>

                    <TouchableOpacity
                        onPress={openDatePicker}
                        activeOpacity={0.85}
                        disabled={saving}
                        style={styles.pickerButton}
                        accessibilityRole="button"
                        accessibilityLabel="면접 일자 선택"
                    >
                        <Text style={form.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder} numberOfLines={1}>
                            {form.date || "날짜 선택"}
                        </Text>
                    </TouchableOpacity>

                    {Platform.OS === "ios" ? (
                        <Modal transparent visible={showDatePicker} animationType="fade" onRequestClose={closeDatePicker}>
                            <Pressable style={styles.modalBackdrop} onPress={closeDatePicker}>
                                <Pressable style={styles.modalCard} onPress={() => {}}>
                                    <DateTimePicker
                                        value={ymdToDate(form.date)}
                                        mode="date"
                                        display="spinner"
                                        themeVariant="light"
                                        textColor={colors.textStrong as any}
                                        accentColor={colors.accent as any}
                                        style={{ backgroundColor: colors.bg }}
                                        onChange={onChangeDate}
                                    />
                                    <TouchableOpacity style={styles.modalCloseBtn} activeOpacity={0.9} onPress={closeDatePicker}>
                                        <Text style={styles.modalCloseText}>닫기</Text>
                                    </TouchableOpacity>
                                </Pressable>
                            </Pressable>
                        </Modal>
                    ) : (
                        showDatePicker && (
                            <View style={styles.pickerWrap}>
                                <DateTimePicker value={ymdToDate(form.date)} mode="date" display="default" onChange={onChangeDate} />
                            </View>
                        )
                    )}
                </View>

                {/* 면접 시간 */}
                <View style={[styles.field, styles.fieldHalf]}>
                    <Text style={styles.label}>면접 시간</Text>

                    <TouchableOpacity
                        onPress={openTimePicker}
                        activeOpacity={0.85}
                        disabled={saving}
                        style={styles.pickerButton}
                        accessibilityRole="button"
                        accessibilityLabel="면접 시간 선택"
                    >
                        <Text style={form.time ? styles.pickerButtonText : styles.pickerButtonPlaceholder} numberOfLines={1}>
                            {form.time || "시간 선택"}
                        </Text>
                    </TouchableOpacity>

                    {Platform.OS === "ios" ? (
                        <Modal transparent visible={showTimePicker} animationType="fade" onRequestClose={closeTimePicker}>
                            <Pressable style={styles.modalBackdrop} onPress={closeTimePicker}>
                                <Pressable style={styles.modalCard} onPress={() => {}}>
                                    <DateTimePicker
                                        value={hmToDate(form.time)}
                                        mode="time"
                                        display="spinner"
                                        themeVariant="light"
                                        minuteInterval={5}
                                        is24Hour
                                        textColor={colors.textStrong as any}
                                        accentColor={colors.accent as any}
                                        style={{ backgroundColor: colors.bg }}
                                        onChange={onChangeTime}
                                    />
                                    <TouchableOpacity style={styles.modalCloseBtn} activeOpacity={0.9} onPress={closeTimePicker}>
                                        <Text style={styles.modalCloseText}>닫기</Text>
                                    </TouchableOpacity>
                                </Pressable>
                            </Pressable>
                        </Modal>
                    ) : (
                        showTimePicker && (
                            <View style={styles.pickerWrap}>
                                <DateTimePicker
                                    value={hmToDate(form.time)}
                                    mode="time"
                                    display="default"
                                    is24Hour
                                    minuteInterval={5}
                                    onChange={onChangeTime}
                                />
                            </View>
                        )
                    )}
                </View>
            </View>

            {/* 형태 */}
            <View style={styles.field}>
                <Text style={styles.label}>형태</Text>
                <TextInput
                    value={form.type}
                    onChangeText={setField("type")}
                    placeholder="예: 온라인, 오프라인, 화상 등"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    autoCapitalize="none"
                    editable={!saving}
                />
            </View>

            {/* 메모 */}
            <View style={styles.field}>
                <Text style={styles.label}>메모 / 예상 질문 & 회고</Text>
                <TextInput
                    value={form.note}
                    onChangeText={setField("note")}
                    placeholder="예상 질문, 준비할 내용, 면접 이후 느낀 점 등을 자유롭게 적어두면 좋아요."
                    placeholderTextColor={colors.placeholder}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!saving}
                />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={[styles.button, !canSubmit && styles.buttonDisabled]}
                    activeOpacity={0.9}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator size="small" color={colors.bg} />
                            <Text style={styles.buttonText}> 저장 중...</Text>
                        </>
                    ) : (
                        <Text style={styles.buttonText}>면접 기록 저장</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: space.md,
    },
    rowItemLeft: { marginRight: space.md },

    field: { marginTop: space.md },

    fieldHalf: { flex: 1, flexBasis: "48%" },

    label: {
        fontSize: font.small,
        color: colors.text,
        fontWeight: "700",
        marginBottom: space.xs,
    },

    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.textStrong,
        backgroundColor: colors.bg,
    },

    // TextInput처럼 보이는 picker 버튼(날짜/시간 공용)
    pickerButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 10,
        minHeight: 44,
        justifyContent: "center",
        backgroundColor: colors.bg,
    },
    pickerButtonText: {
        fontSize: 14,
        color: colors.textStrong,
    },
    pickerButtonPlaceholder: {
        fontSize: 14,
        color: colors.placeholder,
    },

    // Android picker wrapper
    pickerWrap: {
        marginTop: space.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.section,
        padding: space.sm,
    },

    // iOS modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    modalCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        padding: space.md,
    },
    modalCloseBtn: {
        alignSelf: "flex-end",
        marginTop: space.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.section,
    },
    modalCloseText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: "700",
    },

    textArea: { minHeight: 100 },

    errorText: {
        fontSize: font.small,
        color: "#e11d48",
        marginTop: space.md,
        fontWeight: "800",
    },

    buttonRow: { alignItems: "flex-end", marginTop: space.lg },

    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.accent,
        paddingHorizontal: space.lg,
        paddingVertical: 9,
        borderRadius: radius.pill,
    },

    buttonDisabled: { opacity: 0.6 },

    buttonText: { fontSize: 13, fontWeight: "800", color: colors.bg },
});