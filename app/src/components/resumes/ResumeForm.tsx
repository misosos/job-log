import React, { memo, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { colors, font, radius, space } from "../../styles/theme";

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

type FormFieldProps = {
    label: string;
    value: string;
    placeholder: string;
    onChangeText: (v: string) => void;
    inputProps?: Omit<
        React.ComponentProps<typeof TextInput>,
        "value" | "onChangeText" | "placeholder"
    >;
    multiline?: boolean;
};

function FormField({
                       label,
                       value,
                       placeholder,
                       onChangeText,
                       inputProps,
                       multiline,
                   }: FormFieldProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                placeholder={placeholder}
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                {...inputProps}
            />
        </View>
    );
}

function ResumeFormBase({
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
    const handlePress = useCallback(() => {
        if (!isValid) return;
        void onSubmit();
    }, [isValid, onSubmit]);

    return (
        <View style={styles.container}>
            <FormField
                label="이력서 제목"
                value={title}
                placeholder="예: 금융/데이터 분석 공통 이력서 v4"
                onChangeText={onChangeTitle}
                inputProps={{ returnKeyType: "next" }}
            />

            <FormField
                label="타겟 회사/직무"
                value={target}
                placeholder="예: 저축은행 데이터/리스크, 증권사 운용 등"
                onChangeText={onChangeTarget}
                inputProps={{ returnKeyType: "next" }}
            />

            <FormField
                label="파일 / 노션 / 구글 드라이브 링크 (선택)"
                value={link}
                placeholder="예: PDF 파일, 노션 페이지, 구글 드라이브 폴더 URL"
                onChangeText={onChangeLink}
                inputProps={{
                    autoCapitalize: "none",
                    autoCorrect: false,
                    keyboardType: "url",
                }}
            />

            <FormField
                label="메모(선택)"
                value={note}
                placeholder="이 버전의 특징이나 사용 예정 공고를 메모해 두면 좋아요."
                onChangeText={onChangeNote}
                multiline
                inputProps={{
                    blurOnSubmit: true,
                    textAlignVertical: "top",
                }}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handlePress}
                    disabled={!isValid}
                    activeOpacity={0.9}
                    style={[styles.button, !isValid && styles.buttonDisabled]}
                >
                    <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
                        이력서 버전 추가
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export const ResumeForm = memo(ResumeFormBase);

const styles = StyleSheet.create({
    container: {
        marginBottom: space.lg,
        paddingHorizontal: space.md,
        paddingVertical: space.lg,
        borderRadius: radius.md,
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
    },

    field: {
        width: "100%",
        marginBottom: space.md,
    },

    label: {
        fontSize: font.small,
        color: colors.text,
        opacity: 0.8,
        marginBottom: space.xs,
        fontWeight: "600",
    },

    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        fontSize: 14,
        minHeight: 40,
        color: colors.textStrong,
        backgroundColor: colors.bg,
    },

    textArea: {
        minHeight: 80,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: space.xs,
    },

    button: {
        borderRadius: radius.sm,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        backgroundColor: colors.accent,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        alignSelf: "flex-end",
    },

    buttonDisabled: {
        backgroundColor: colors.placeholder,
        opacity: 0.6,
    },

    buttonText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.bg,
    },

    buttonTextDisabled: {
        color: colors.bg,
    },
});