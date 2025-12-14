import React, { useCallback, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

import type { PlannerScope } from "../../../../shared/features/planner/types";
import { colors, space, radius, font } from "../../styles/theme";

import { inferScopeFromDeadline } from "../../utils/dateYmd";

import { ScopeSelector } from "./parts/ScopeSelector";
import { DeadlinePicker } from "./parts/DeadlinePicker";
import { ApplicationChips, type ApplicationOption } from "./parts/ApplicationChips";

type PlannerNewTaskFormProps = {
    title: string;
    scope: PlannerScope;
    deadline: string | null;
    saving: boolean;
    applicationId: string; // "" = 연결 안 함
    applicationOptions: ApplicationOption[];
    onTitleChange: (value: string) => void;
    onScopeChange: (value: PlannerScope) => void;
    onDeadlineChange: (value: string | null) => void;
    onApplicationChange: (id: string) => void; // "" 허용
    onSubmit: () => void;
};

export function PlannerNewTaskForm({
                                       title,
                                       scope,
                                       deadline,
                                       saving,
                                       applicationId,
                                       applicationOptions,
                                       onTitleChange,
                                       onScopeChange,
                                       onDeadlineChange,
                                       onApplicationChange,
                                       onSubmit,
                                   }: PlannerNewTaskFormProps) {
    const isSubmitDisabled = saving || title.trim().length === 0;

    const handlePickDeadline = useCallback(
        (ymd: string) => {
            onDeadlineChange(ymd);
            onScopeChange(inferScopeFromDeadline(ymd));
        },
        [onDeadlineChange, onScopeChange],
    );

    const handleClearDeadline = useCallback(() => {
        onDeadlineChange(null);
        onScopeChange("today");
    }, [onDeadlineChange, onScopeChange]);

    const handleSubmit = useCallback(() => {
        if (isSubmitDisabled) return;
        onSubmit();
    }, [isSubmitDisabled, onSubmit]);

    const placeholder = useMemo(() => "예: 카카오페이 공고 JD 분석", []);

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>새 할 일 추가</Text>

            <View style={styles.titleRow}>
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={colors.placeholder}
                    value={title}
                    onChangeText={onTitleChange}
                    style={styles.titleInput}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    editable={!saving}
                />
            </View>

            <View style={styles.bottomColumn}>
                <ScopeSelector scope={scope} deadline={deadline} saving={saving} onScopeChange={onScopeChange} />

                <DeadlinePicker
                    deadline={deadline}
                    saving={saving}
                    onPick={handlePickDeadline}
                    onClear={handleClearDeadline}
                />

                <ApplicationChips
                    applicationId={applicationId}
                    options={applicationOptions}
                    saving={saving}
                    onChange={onApplicationChange}
                />

                <TouchableOpacity
                    style={[styles.addButton, isSubmitDisabled && styles.addButtonDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.9}
                    disabled={isSubmitDisabled}
                >
                    <Text style={styles.addButtonText}>{saving ? "추가 중..." : "추가"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.md,
        padding: space.md,
        marginBottom: space.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTitle: {
        fontSize: font.h2,
        fontWeight: "700",
        color: colors.text,
        marginBottom: space.sm,
    },

    titleRow: { flexDirection: "row", marginBottom: space.sm },
    titleInput: {
        flex: 1,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        fontSize: 14,
        color: colors.textStrong,
    },

    bottomColumn: { marginTop: space.xs },

    addButton: {
        alignSelf: "flex-end",
        borderRadius: radius.sm,
        backgroundColor: colors.accent,
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
        marginTop: space.xs,
    },
    addButtonDisabled: { opacity: 0.6 },
    addButtonText: { fontSize: 12, fontWeight: "800", color: colors.bg },
});