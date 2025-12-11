// app/components/interviews/InterviewCreateForm.tsx (예시 경로)

import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type InterviewFormValues = {
    company: string;
    role: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM (optional)
    type: string;
    note: string;
};

type Props = {
    saving: boolean;
    error?: string | null;
    onSubmit: (values: InterviewFormValues) => Promise<void> | void;
};

export function InterviewCreateForm({ saving, error, onSubmit }: Props) {
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("온라인");
    const [note, setNote] = useState("");

    const handleSubmit = async () => {
        if (!company.trim() || !role.trim() || !date) {
            return;
        }

        await onSubmit({
            company: company.trim(),
            role: role.trim(),
            date,
            time,
            type: type.trim(),
            note,
        });

        // 성공했다고 가정하고 폼 초기화 (웹 버전과 동일 동작)
        setCompany("");
        setRole("");
        setDate("");
        setTime("");
        setType("온라인");
        setNote("");
    };

    return (
        <View style={styles.container}>
            {/* 회사명 / 포지션 */}
            <View style={styles.row}>
                <View style={styles.field}>
                    <Text style={styles.label}>회사명</Text>
                    <TextInput
                        value={company}
                        onChangeText={setCompany}
                        placeholder="예: IBK기업은행, 카카오페이 등"
                        placeholderTextColor="#6b7280"
                        style={styles.input}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>직무 / 포지션</Text>
                    <TextInput
                        value={role}
                        onChangeText={setRole}
                        placeholder="예: 디지털 인턴, 데이터 분석 인턴 등"
                        placeholderTextColor="#6b7280"
                        style={styles.input}
                    />
                </View>
            </View>

            {/* 날짜 / 시간 / 형태 */}
            <View style={styles.row}>
                <View style={styles.field}>
                    <Text style={styles.label}>면접 일자</Text>
                    <TextInput
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#6b7280"
                        style={styles.input}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>면접 시간</Text>
                    <TextInput
                        value={time}
                        onChangeText={setTime}
                        placeholder="HH:MM"
                        placeholderTextColor="#6b7280"
                        style={styles.input}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>형태</Text>
                    <TextInput
                        value={type}
                        onChangeText={setType}
                        placeholder="예: 온라인, 오프라인, 화상 등"
                        placeholderTextColor="#6b7280"
                        style={styles.input}
                    />
                </View>
            </View>

            {/* 메모 */}
            <View style={styles.field}>
                <Text style={styles.label}>메모 / 예상 질문 & 회고</Text>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="예상 질문, 준비할 내용, 면접 이후 느낀 점 등을 자유롭게 적어두면 좋아요."
                    placeholderTextColor="#6b7280"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={saving}
                    style={[
                        styles.button,
                        saving ? styles.buttonDisabled : undefined,
                    ]}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator size="small" color="#020617" />
                            <Text style={styles.buttonText}> 저장 중...</Text>
                        </>
                    ) : (
                        <Text style={styles.buttonText}>면접 기록 저장</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    field: {
        flex: 1,
        gap: 4,
    },
    label: {
        fontSize: 11,
        color: "#e5e7eb", // slate-200
    },
    input: {
        borderWidth: 1,
        borderColor: "#1f2937", // slate-800
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        color: "#f9fafb", // slate-50
        backgroundColor: "#020617", // slate-950
    },
    textArea: {
        minHeight: 90,
    },
    errorText: {
        fontSize: 11,
        color: "#f87171", // red-400
    },
    buttonRow: {
        alignItems: "flex-end",
        marginTop: 4,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#22c55e", // emerald-500
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#020617", // almost black
    },
});