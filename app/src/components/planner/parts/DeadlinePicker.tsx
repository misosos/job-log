import React, { memo, useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Modal,
    Pressable,
} from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { colors, space, radius, font } from "../../../styles/theme";
import { dateToYmd, ymdToDate } from "../../../utils/dateYmd";

type Props = {
    deadline: string | null;
    saving: boolean;
    onPick: (ymd: string) => void;
    onClear: () => void;
};

export const DeadlinePicker = memo(function DeadlinePicker({
                                                               deadline,
                                                               saving,
                                                               onPick,
                                                               onClear,
                                                           }: Props) {
    const [show, setShow] = useState(false);

    const open = useCallback(() => {
        if (saving) return;
        setShow(true);
    }, [saving]);

    const close = useCallback(() => setShow(false), []);

    const onChange = useCallback(
        (_e: DateTimePickerEvent, selected?: Date) => {
            if (Platform.OS === "android") close();
            if (!selected) return;
            onPick(dateToYmd(selected));
        },
        [close, onPick],
    );

    const quickToday = useCallback(() => onPick(dateToYmd(new Date())), [onPick]);

    const quickPlus7 = useCallback(() => {
        const now = new Date();
        const plus7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        onPick(dateToYmd(plus7));
    }, [onPick]);

    return (
        <View style={styles.ddayGroupRow}>
            <Text style={styles.ddayLabelText}>마감일</Text>

            <View style={styles.deadlineWrap}>
                <TouchableOpacity
                    style={styles.deadlineButton}
                    activeOpacity={0.85}
                    onPress={open}
                    disabled={saving}
                >
                    <Text
                        style={deadline ? styles.deadlineButtonText : styles.deadlineButtonPlaceholder}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {deadline ?? "날짜 선택"}
                    </Text>

                    {/* 캘린더 아이콘(그대로 유지) */}
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
                    <Modal transparent visible={show} animationType="fade" onRequestClose={close}>
                        <Pressable style={styles.modalBackdrop} onPress={close}>
                            <Pressable style={styles.modalCard} onPress={() => {}}>
                                <DateTimePicker
                                    value={ymdToDate(deadline)}
                                    mode="date"
                                    display="spinner"
                                    themeVariant="light"
                                    textColor={colors.textStrong}
                                    accentColor={colors.accent}
                                    style={{ backgroundColor: colors.bg }}
                                    onChange={onChange}
                                />

                                <TouchableOpacity style={styles.modalCloseBtn} activeOpacity={0.9} onPress={close}>
                                    <Text style={styles.modalCloseText}>닫기</Text>
                                </TouchableOpacity>
                            </Pressable>
                        </Pressable>
                    </Modal>
                ) : (
                    show && (
                        <View style={styles.pickerWrap}>
                            <DateTimePicker value={ymdToDate(deadline)} mode="date" display="default" onChange={onChange} />
                        </View>
                    )
                )}

                <View style={styles.quickRow}>
                    <TouchableOpacity style={styles.quickBtn} activeOpacity={0.9} onPress={quickToday} disabled={saving}>
                        <Text style={styles.quickBtnText}>오늘</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickBtn} activeOpacity={0.9} onPress={quickPlus7} disabled={saving}>
                        <Text style={styles.quickBtnText}>+7일</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickBtnGhost} activeOpacity={0.9} onPress={onClear} disabled={saving}>
                        <Text style={styles.quickBtnGhostText}>지우기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    ddayGroupRow: { flexDirection: "row", alignItems: "center", marginBottom: space.sm },
    ddayLabelText: { fontSize: 12, color: colors.text, marginRight: space.sm },
    deadlineWrap: { flex: 1 },

    deadlineButton: {
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    deadlineButtonText: { fontSize: 12, color: colors.textStrong, flexShrink: 1 },
    deadlineButtonPlaceholder: { fontSize: 12, color: colors.placeholder, flexShrink: 1 },

    deadlineIcon: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.bg,
        overflow: "hidden",
        flexShrink: 0,
        opacity: 0.95,
    },
    calTop: {
        width: "100%",
        height: 5,
        backgroundColor: colors.accentSoft,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.accent,
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
    calRing: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.accent },
    calBody: { flex: 1, paddingHorizontal: 3, paddingVertical: 3, justifyContent: "space-evenly" },
    calRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    calDot: { width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: colors.accent },

    pickerWrap: {
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.accentSoft,
        padding: space.sm,
        marginTop: space.sm,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "center",
        paddingHorizontal: space.lg,
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
    modalCloseText: { color: colors.text, fontSize: 12, fontWeight: "700" },

    quickRow: { flexDirection: "row", flexWrap: "wrap", marginTop: space.sm },
    quickBtn: {
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
        marginRight: space.sm,
        marginBottom: space.sm,
    },
    quickBtnText: { fontSize: font.small, color: colors.accent, fontWeight: "700" },
    quickBtnGhost: {
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.section,
        marginRight: space.sm,
        marginBottom: space.sm,
    },
    quickBtnGhostText: { fontSize: font.small, color: colors.placeholder, fontWeight: "700" },
});