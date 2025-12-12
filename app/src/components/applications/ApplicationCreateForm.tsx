// app/src/components/applications/ApplicationCreateForm.tsx
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import type { ApplicationStatus } from "../../../../shared/features/applications/types";

type Props = {
  company: string;
  role: string;
  status: ApplicationStatus;
  deadline: string; // "YYYY-MM-DD" 포맷
  saving: boolean;
  error: string | null;
  onCompanyChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: ApplicationStatus) => void;
  onDeadlineChange: (value: string) => void;
  onSubmit: () => void;
};

const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: "지원 예정", value: "지원 예정" },
  { label: "서류 제출", value: "서류 제출" },
  { label: "서류 통과", value: "서류 통과" },
  { label: "면접 진행", value: "면접 진행" },
  { label: "최종 합격", value: "최종 합격" },
  { label: "불합격", value: "불합격" },
];

export function ApplicationCreateForm({
  company,
  role,
  status,
  deadline,
  saving,
  error,
  onCompanyChange,
  onRoleChange,
  onStatusChange,
  onDeadlineChange,
  onSubmit,
}: Props) {
  const isSubmitDisabled = useMemo(
    () => saving || !company.trim() || !role.trim(),
    [saving, company, role],
  );

  const handleSubmitPress = useCallback(() => {
    if (isSubmitDisabled) return;
    onSubmit();
  }, [isSubmitDisabled, onSubmit]);

  return (
    <View style={styles.card}>
      {/* 회사명 */}
      <View style={styles.field}>
        <Text style={styles.label}>회사명</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 카카오페이"
          placeholderTextColor="#6b7280"
          value={company}
          onChangeText={onCompanyChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saving}
          returnKeyType="next"
        />
      </View>

      {/* 직무명 */}
      <View style={styles.field}>
        <Text style={styles.label}>직무명</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 데이터 산출 인턴"
          placeholderTextColor="#6b7280"
          value={role}
          onChangeText={onRoleChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!saving}
          returnKeyType="next"
        />
      </View>

      {/* 상태 */}
      <View style={styles.field}>
        <Text style={styles.label}>상태</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={status}
            enabled={!saving}
            dropdownIconColor="#e5e7eb"
            onValueChange={(value) =>
              onStatusChange(value as ApplicationStatus)
            }
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {STATUS_OPTIONS.map((opt) => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
                color="#e5e7eb"
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* 마감일 */}
      <View style={styles.field}>
        <Text style={styles.label}>마감일</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#6b7280"
          value={deadline}
          onChangeText={onDeadlineChange}
          editable={!saving}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Text style={styles.helperText}>
          선택 사항이에요. 공고 마감일이나 내 목표 마감일을 적어두면 좋아요.
        </Text>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonWrapper}>
        <Pressable
          onPress={handleSubmitPress}
          disabled={isSubmitDisabled}
          style={({ pressed }) => [
            styles.button,
            isSubmitDisabled && styles.buttonDisabled,
            pressed && !isSubmitDisabled && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {saving ? "저장 중..." : "지원 기록 추가"}
          </Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#020617", // slate-950 느낌
    borderWidth: 1,
    borderColor: "#1e293b", // slate-800
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: "#e5e7eb", // slate-200
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: "#f9fafb", // slate-50
    fontSize: 14,
    backgroundColor: "#020617",
  },
  helperText: {
    marginTop: 4,
    fontSize: 11,
    color: "#9ca3af", // slate-400
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  picker: {
    color: "#e5e7eb", // selected text color (Android)
    backgroundColor: "#020617",
  },
  pickerItem: {
    color: "#e5e7eb", // iOS item text color
    fontSize: 14,
  },
  buttonWrapper: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  button: {
    backgroundColor: "#22c55e", // emerald-500
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonPressed: {
    backgroundColor: "#4ade80", // emerald-400 느낌
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#020617",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 8,
    fontSize: 11,
    color: "#f97373", // red-ish
  },
});