// app/src/components/applications/ApplicationEditModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

// 웹에서 공통 타입을 쓰고 있으면 아래 타입 대신 import 해도 돼
// import type { ApplicationStatus } from "../../features/applications/types";

export type ApplicationStatus =
  | "지원 예정"
  | "서류 제출"
  | "서류 통과"
  | "면접 진행"
  | "최종 합격"
  | "불합격";

// 웹에서 쓰던 ApplicationRow 타입도 앱 쪽에서 공유하고 있으면 경로 맞춰서 import 해줘
export type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAtLabel?: string;
  deadline?: unknown;
};

type Props = {
  open: boolean;
  target: ApplicationRow | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (id: string, status: ApplicationStatus) => void;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "지원 예정",
  "서류 제출",
  "서류 통과",
  "면접 진행",
  "최종 합격",
  "불합격",
];

export function ApplicationEditModal({
  open,
  target,
  saving,
  error,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState<ApplicationStatus>("지원 예정");

  // 선택된 row가 바뀔 때마다 상태 동기화
  useEffect(() => {
    if (target?.status) {
      setStatus(target.status);
    } else {
      setStatus("지원 예정");
    }
  }, [target]);

  const handleSubmit = () => {
    if (!target || saving) return;
    onSave(target.id, status);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 바깥 영역 터치 시 닫히도록 Pressable 사용 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 안쪽 컨텐츠는 별도 컨테이너로 눌러도 닫히지 않게 별도 Pressable */}
        <Pressable style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>지원 상태 수정</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 회사 / 직무 정보 */}
          {target && (
            <View style={styles.targetInfo}>
              <Text style={styles.companyText} numberOfLines={1}>
                {target.company}
              </Text>
              <Text style={styles.roleText} numberOfLines={2}>
                {target.role}
              </Text>
            </View>
          )}

          {/* 상태 선택 */}
          <View style={styles.field}>
            <Text style={styles.label}>지원 상태</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={status}
                onValueChange={(value) =>
                  setStatus(value as ApplicationStatus)
                }
                dropdownIconColor="#e5e7eb"
                style={styles.picker}
              >
                {STATUS_OPTIONS.map((s) => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* 푸터 버튼 */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                styles.buttonGray,
                pressed && styles.buttonGrayPressed,
              ]}
            >
              <Text style={styles.buttonGrayText}>취소</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && styles.buttonPrimaryPressed,
                saving && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonPrimaryText}>
                {saving ? "저장 중..." : "저장"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)", // slate-900/70
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: "#020617", // slate-950
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#1f2937", // slate-800
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#e5e7eb", // slate-200
  },
  closeText: {
    color: "#9ca3af", // slate-400
    fontSize: 20,
  },
  targetInfo: {
    marginBottom: 14,
  },
  companyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f9fafb", // slate-50
  },
  roleText: {
    fontSize: 13,
    color: "#9ca3af", // slate-400
    marginTop: 4,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: "#e5e7eb",
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    backgroundColor: "#020617",
    overflow: "hidden",
  },
  picker: {
    height: Platform.select({ ios: 180, android: 44 }),
    color: "#e5e7eb",
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: "#f87171", // red-400
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    minWidth: 84,
    alignItems: "center",
  },
  buttonGray: {
    backgroundColor: "#111827", // slate-900
    marginRight: 8,
  },
  buttonGrayPressed: {
    backgroundColor: "#1f2937", // slate-800
  },
  buttonGrayText: {
    fontSize: 13,
    color: "#e5e7eb",
  },
  buttonPrimary: {
    backgroundColor: "#22c55e", // emerald-500
  },
  buttonPrimaryPressed: {
    backgroundColor: "#4ade80", // emerald-400
  },
  buttonPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#020617", // slate-950
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});