// app/components/planner/PlannerNewTaskForm.tsx

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { PlannerScope } from "../../features/planner/types";

type PlannerNewTaskFormProps = {
  title: string;
  scope: PlannerScope;
  ddayLabel: string;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onScopeChange: (value: PlannerScope) => void;
  onDdayLabelChange: (value: string) => void;
  // RN에는 form 이벤트가 없으니까 그냥 콜백으로
  onSubmit: () => void;
};

export function PlannerNewTaskForm({
  title,
  scope,
  ddayLabel,
  saving,
  onTitleChange,
  onScopeChange,
  onDdayLabelChange,
  onSubmit,
}: PlannerNewTaskFormProps) {
  const isSubmitDisabled = saving || title.trim().length === 0;

  const handlePressSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit();
  };

  const isToday = scope === "today";

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>새 할 일 추가</Text>

      {/* 제목 입력 */}
      <View style={styles.titleRow}>
        <TextInput
          placeholder="예: 카카오페이 공고 JD 분석"
          placeholderTextColor="#6b7280" // slate-500
          value={title}
          onChangeText={onTitleChange}
          style={styles.titleInput}
          returnKeyType="done"
          onSubmitEditing={handlePressSubmit}
        />
      </View>

      {/* 범위 + D-Day + 추가 버튼 */}
      <View style={styles.bottomColumn}>
        {/* 범위 토글 */}
        <View style={styles.scopeGroupRow}>
          <Text style={styles.scopeLabel}>범위</Text>
          <View style={styles.scopeToggle}>
            <TouchableOpacity
              style={[styles.scopeButton, isToday && styles.scopeButtonActive]}
              onPress={() => onScopeChange("today")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.scopeButtonText,
                  isToday && styles.scopeButtonTextActive,
                ]}
              >
                오늘 할 일
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.scopeButton,
                !isToday && styles.scopeButtonActive,
              ]}
              onPress={() => onScopeChange("week")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.scopeButtonText,
                  !isToday && styles.scopeButtonTextActive,
                ]}
              >
                이번 주 계획
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* D-Day 라벨 */}
        <View style={styles.ddayGroupRow}>
          <Text style={styles.ddayLabelText}>D-Day 라벨</Text>
          <TextInput
            value={ddayLabel}
            onChangeText={onDdayLabelChange}
            placeholder="D-3, 오늘"
            placeholderTextColor="#6b7280"
            style={styles.ddayInput}
          />
        </View>

        {/* 추가 버튼 */}
        <TouchableOpacity
          style={[
            styles.addButton,
            isSubmitDisabled && styles.addButtonDisabled,
          ]}
          onPress={handlePressSubmit}
          activeOpacity={0.9}
          disabled={isSubmitDisabled}
        >
          <Text style={styles.addButtonText}>
            {saving ? "추가 중..." : "추가"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#020617", // slate-950
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#111827", // slate-900
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e5e7eb", // slate-200
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  titleInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151", // slate-700
    backgroundColor: "#020617", // slate-950
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: "#e5e7eb",
  },
  bottomColumn: {
    marginTop: 4,
    gap: 10,
  },
  scopeGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scopeLabel: {
    fontSize: 12,
    color: "#9ca3af", // slate-400
    marginRight: 8,
  },
  scopeToggle: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    overflow: "hidden",
  },
  scopeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scopeButtonActive: {
    backgroundColor: "#10b981", // emerald-500
  },
  scopeButtonText: {
    fontSize: 11,
    color: "#9ca3af", // slate-400
  },
  scopeButtonTextActive: {
    color: "#0f172a", // slate-900
    fontWeight: "600",
  },
  ddayGroupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ddayLabelText: {
    fontSize: 12,
    color: "#9ca3af",
    marginRight: 6,
  },
  ddayInput: {
    minWidth: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: "#e5e7eb",
  },
  addButton: {
    alignSelf: "flex-end",
    borderRadius: 8,
    backgroundColor: "#10b981", // emerald-500
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 4,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#020617", // slate-950
  },
});