import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { colors, space, radius, font } from "../../../styles/theme";

export type ApplicationOption = { value: string; label: string };

type Props = {
    applicationId: string; // "" = 연결 안 함
    options: ApplicationOption[];
    saving: boolean;
    onChange: (id: string) => void;
};

export const ApplicationChips = memo(function ApplicationChips({
                                                                   applicationId,
                                                                   options,
                                                                   saving,
                                                                   onChange,
                                                               }: Props) {
    return (
        <View style={styles.appGroupRow}>
            <Text style={styles.appLabelText}>관련 공고 (선택)</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appChipsRow}>
                <TouchableOpacity
                    key="none"
                    style={[styles.appChip, applicationId === "" && styles.appChipActive]}
                    onPress={() => !saving && onChange("")}
                    activeOpacity={0.9}
                    disabled={saving}
                >
                    <Text style={[styles.appChipText, applicationId === "" && styles.appChipTextActive]}>
                        연결 안 함
                    </Text>
                </TouchableOpacity>

                {options.map((opt) => {
                    const selected = opt.value === applicationId;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.appChip, selected && styles.appChipActive]}
                            onPress={() => !saving && onChange(opt.value)}
                            activeOpacity={0.9}
                            disabled={saving}
                        >
                            <Text style={[styles.appChipText, selected && styles.appChipTextActive]} numberOfLines={1}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    appGroupRow: { marginTop: space.xs, marginBottom: space.sm },
    appLabelText: { fontSize: 12, color: colors.text, marginBottom: space.xs },

    appChipsRow: { flexDirection: "row" } as const,

    appChip: {
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        marginRight: space.sm,
    },
    appChipActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    appChipText: { fontSize: font.small, color: colors.textStrong, maxWidth: 180 },
    appChipTextActive: { color: colors.accent, fontWeight: "700" },
});