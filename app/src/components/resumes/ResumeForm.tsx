// app/components/resumes/ResumeForm.tsx (예시 경로)
import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

type ResumeFormProps = {
    title: string;
    target: string;
    link: string;
    note: string;
    isValid: boolean;
    onSubmit: () => void | Promise<void>;
    onChangeTitle: (value: string) => void;
    onChangeTarget: (value: string) => void;
    onChangeLink: (value: string) => void;
    onChangeNote: (value: string) => void;
};

export function ResumeForm({
                               title,
                               target,
                               link,
                               note,
                               isValid,
                               onSubmit,
                               onChangeTitle,
                               onChangeTarget,
                               onChangeLink,
                               onChangeNote,
                           }: ResumeFormProps) {
    const handlePress = async () => {
        if (!isValid) return;
        await onSubmit();
    };

    return (
        <View style={styles.container}>
            {/* 이력서 제목 + 타겟 */}
            <View style={styles.field}>
                <Text style={styles.label}>이력서 제목</Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: 금융/데이터 분석 공통 이력서 v4"
                    placeholderTextColor="#6b7280" // slate-500
                    value={title}
                    onChangeText={onChangeTitle}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>타겟 회사/직무</Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: 저축은행 데이터/리스크, 증권사 운용 등"
                    placeholderTextColor="#6b7280"
                    value={target}
                    onChangeText={onChangeTarget}
                    returnKeyType="next"
                />
            </View>

            {/* 링크 */}
            <View style={styles.field}>
                <Text style={styles.label}>
                    파일 / 노션 / 구글 드라이브 링크 (선택)
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: PDF 파일, 노션 페이지, 구글 드라이브 폴더 URL"
                    placeholderTextColor="#6b7280"
                    value={link}
                    onChangeText={onChangeLink}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                />
            </View>

            {/* 메모 */}
            <View style={styles.field}>
                <Text style={styles.label}>메모(선택)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="이 버전의 특징이나 사용 예정 공고를 메모해 두면 좋아요."
                    placeholderTextColor="#6b7280"
                    value={note}
                    onChangeText={onChangeNote}
                    multiline
                    blurOnSubmit={true}
                />
            </View>

            {/* 버튼 */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handlePress}
                    disabled={!isValid}
                    style={[
                        styles.button,
                        !isValid && styles.buttonDisabled,
                    ]}
                >
                    <Text style={styles.buttonText}>이력서 버전 추가</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#ffe4e6", // rose-100
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    field: {
        width: "100%",
        marginBottom: 12,
    },

    label: {
        fontSize: 11,
        color: "#9f1239", // rose-800
        opacity: 0.8,
        marginBottom: 4,
        fontWeight: "600",
    },

    input: {
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        minHeight: 40,
        color: "#881337", // rose-900
        backgroundColor: "#fff1f2", // rose-50
    },

    textArea: {
        minHeight: 60,
        textAlignVertical: "top",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 4,
    },

    button: {
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: "#f43f5e", // rose-500
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        alignSelf: "flex-end",
    },

    buttonDisabled: {
        backgroundColor: "#fb7185", // rose-400 (disabled 톤)
        opacity: 0.6,
    },

    buttonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff1f2", // rose-50
    },
});