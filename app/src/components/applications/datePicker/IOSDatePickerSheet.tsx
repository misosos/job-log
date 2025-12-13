import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
    open: boolean;
    date: Date;
    onChange: (d: Date) => void;
    onCancel: () => void;
    onDone: () => void;
};

export function IOSDatePickerSheet({ open, date, onChange, onCancel, onDone }: Props) {
    if (!open) return null;

    return (
        <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
            <Pressable style={styles.backdrop} onPress={onCancel}>
                <Pressable style={styles.sheet} onPress={() => {}}>
                    <View style={styles.header}>
                        <Pressable onPress={onCancel} hitSlop={8}>
                            <Text style={styles.headerText}>취소</Text>
                        </Pressable>

                        <Pressable onPress={onDone} hitSlop={8}>
                            <Text style={[styles.headerText, styles.done]}>완료</Text>
                        </Pressable>
                    </View>

                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="inline"
                        themeVariant="light"
                        textColor="#881337"
                        style={styles.picker}
                        onChange={(_, d) => d && onChange(d)}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#ffe4e6", // rose-100
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        paddingBottom: 16,
    },
    header: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headerText: {
        color: "#9f1239",
        fontSize: 14,
        fontWeight: "700",
    },
    done: { color: "#f43f5e", fontWeight: "900" },
    picker: { backgroundColor: "#ffe4e6" },
});