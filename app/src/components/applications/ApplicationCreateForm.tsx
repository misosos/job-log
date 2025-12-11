// app/src/components/applications/ApplicationCreateForm.tsx
import React from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    GestureResponderEvent,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

// 웹에서 쓰던 타입을 공유한다면 그 경로로 바꿔 줘도 돼
// import type { ApplicationStatus } from "../../features/applications/types";
export type ApplicationStatus =
    | "지원 예정"
    | "서류 제출"
    | "서류 통과"
    | "면접 진행"
    | "최종 합격"
    | "불합격";

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
    const handlePress = (e: GestureResponderEvent) => {
        if (!saving) {
            onSubmit();
        }
    };

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
                />
            </View>

            {/* 상태 */}
            <View style={styles.field}>
                <Text style={styles.label}>상태</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={status}
                        onValueChange={(value) =>
                            onStatusChange(value as ApplicationStatus)
                        }
                        dropdownIconColor="#e5e7eb"
                    >
                        <Picker.Item label="지원 예정" value="지원 예정" />
                        <Picker.Item label="서류 제출" value="서류 제출" />
                        <Picker.Item label="서류 통과" value="서류 통과" />
                        <Picker.Item label="면접 진행" value="면접 진행" />
                        <Picker.Item label="최종 합격" value="최종 합격" />
                        <Picker.Item label="불합격" value="불합격" />
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
                />
            </View>

            {/* 버튼 */}
            <View style={styles.buttonWrapper}>
                <Pressable
                    onPress={handlePress}
                    disabled={saving}
                    style={({ pressed }) => [
                        styles.button,
                        saving && styles.buttonDisabled,
                        pressed && !saving && styles.buttonPressed,
                    ]}
                >
                    <Text style={styles.buttonText}>
                        {saving ? "저장 중..." : "지원 기록 추가"}
                    </Text>
                </Pressable>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#020617", // slate-950 느낌
        borderWidth: 1,
        borderColor: "#1e293b", // slate-800
    },
    field: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: "#e5e7eb", // slate-200
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#1e293b",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        color: "#f9fafb", // slate-50
        fontSize: 14,
        backgroundColor: "#020617",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#1e293b",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#020617",
    },
    buttonWrapper: {
        marginTop: 8,
        alignItems: "flex-end",
    },
    button: {
        backgroundColor: "#22c55e", // emerald-500
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
    },
    buttonPressed: {
        backgroundColor: "#4ade80", // emerald-400 느낌
    },
    buttonDisabled: {
        opacity: 0.6,
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