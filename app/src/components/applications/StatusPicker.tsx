import React, { memo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";

import type { ApplicationStatus } from "../../../../shared/features/applications/types";
import { colors, space, radius, font } from "../../styles/theme";

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

type Props = {
    value: ApplicationStatus;
    disabled?: boolean;
    onChange: (value: ApplicationStatus) => void;
    label?: string; // 기본 "상태"
};

export const StatusPicker = memo(function StatusPicker({
                                                           value,
                                                           disabled,
                                                           onChange,
                                                           label = "상태",
                                                       }: Props) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={value}
                    enabled={!disabled}
                    dropdownIconColor={colors.text}
                    onValueChange={(v) => onChange(v as ApplicationStatus)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={colors.textStrong} />
                    ))}
                </Picker>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    field: { marginBottom: space.lg - 2 }, // 14

    label: {
        fontSize: font.small + 1, // 12
        color: colors.text,
        marginBottom: space.xs, // 4
        fontWeight: "700",
    },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md - 2, // 10
        overflow: "hidden",
        backgroundColor: colors.section,
    },

    picker: {
        color: colors.textStrong,
        backgroundColor: colors.section,
        height: Platform.select({ ios: 180, android: 44 }),
    },

    pickerItem: {
        color: colors.textStrong,
        fontSize: font.body + 1, // 14
    },
});