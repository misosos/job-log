import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { PlannerScope } from "../../../../../shared/features/planner/types";
import { colors, space, radius, font } from "../../../styles/theme";

type Props = {
    scope: PlannerScope;
    deadline: string | null;
    saving: boolean;
    onScopeChange: (v: PlannerScope) => void;
};

export const ScopeSelector = memo(function ScopeSelector({
                                                             scope,
                                                             deadline,
                                                             saving,
                                                             onScopeChange,
                                                         }: Props) {
    const isToday = scope === "today";

    return (
        <View style={styles.scopeGroupRow}>
            <Text style={styles.scopeLabel}>범위</Text>

            {deadline ? (
                <View style={styles.scopeBadge}>
                    <Text style={styles.scopeBadgeText}>
                        {scope === "today" ? "오늘 할 일" : "앞으로의 계획"}
                    </Text>
                </View>
            ) : (
                <View style={styles.scopeToggle}>
                    <TouchableOpacity
                        style={[styles.scopeButton, isToday && styles.scopeButtonActive]}
                        onPress={() => !saving && onScopeChange("today")}
                        activeOpacity={0.8}
                        disabled={saving}
                    >
                        <Text style={[styles.scopeButtonText, isToday && styles.scopeButtonTextActive]}>
                            오늘 할 일
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.scopeButton, !isToday && styles.scopeButtonActive]}
                        onPress={() => !saving && onScopeChange("week")}
                        activeOpacity={0.8}
                        disabled={saving}
                    >
                        <Text style={[styles.scopeButtonText, !isToday && styles.scopeButtonTextActive]}>
                            앞으로의 계획
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    scopeGroupRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.sm,
    },
    scopeLabel: { fontSize: 12, color: colors.text, marginRight: space.sm },

    scopeToggle: {
        flexDirection: "row",
        backgroundColor: colors.section,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
    },
    scopeButton: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
    scopeButtonActive: { backgroundColor: colors.placeholder },
    scopeButtonText: { fontSize: font.small, color: colors.text },
    scopeButtonTextActive: { color: colors.bg, fontWeight: "700" },

    scopeBadge: {
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
    },
    scopeBadgeText: { fontSize: font.small, color: colors.accent, fontWeight: "700" },
});