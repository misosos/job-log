import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, space, radius, font } from "../../styles/theme";

type Props = {
    label: string;
    value: string;
    disabled?: boolean;
    onOpen: () => void;
    onClear?: () => void;
    placeholder?: string;
};

export function DateField({ label, value, disabled, onOpen, onClear, placeholder }: Props) {
    const display = (value ?? "").trim();

    return (
        <View style={styles.field}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>

                {!!display && !!onClear && (
                    <Pressable onPress={onClear} disabled={disabled} hitSlop={8}>
                        <Text style={styles.clearText}>지우기</Text>
                    </Pressable>
                )}
            </View>

            <Pressable
                onPress={onOpen}
                disabled={disabled}
                style={({ pressed }) => [styles.button, pressed && !disabled && styles.buttonPressed]}
            >
                <Text style={styles.buttonText}>{display || placeholder || "선택 (YYYY-MM-DD)"}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    field: { marginBottom: space.lg - 2 }, // 14

    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.xs, // 4
    },

    label: {
        fontSize: font.small + 1, // 12
        color: colors.text,
        fontWeight: "700",
    },

    clearText: {
        fontSize: font.small, // 11
        color: colors.accent,
        fontWeight: "800",
    },

    button: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md - 2, // 10
        paddingHorizontal: space.lg - 4, // 12
        paddingVertical: space.lg - 5, // 11
        backgroundColor: colors.bg,
    },

    buttonPressed: { borderColor: colors.placeholder },

    buttonText: {
        color: colors.textStrong,
        fontSize: font.body + 1, // 14
    },
});