import React, { memo, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    TextInputProps,
} from "react-native";
import { useEmailAuthForm } from "../../features/auth/useEmailAuthForm";
import { colors, space, radius, font } from "../../styles/theme";

type Props = {
    onSuccess?: () => void;
};

type FieldProps = {
    label: string;
    inputProps: TextInputProps;
};

const Field = memo(function Field({ label, inputProps }: FieldProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholderTextColor={colors.placeholder}
                {...inputProps}
            />
        </View>
    );
});

export function EmailAuthForm({ onSuccess }: Props) {
    const {
        mode,
        toggleMode,
        email,
        setEmail,
        password,
        setPassword,
        passwordConfirm,
        setPasswordConfirm,
        displayName,
        setDisplayName,
        loading,
        error,
        isFormValid,
        handleSubmit,
    } = useEmailAuthForm(onSuccess);

    const isSignup = mode === "signup";
    const isSubmitDisabled = !isFormValid || loading;

    const handlePressSubmit = useCallback(() => {
        void handleSubmit();
    }, [handleSubmit]);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{isSignup ? "이메일로 회원가입" : "이메일로 로그인"}</Text>

            <Field
                label="이메일"
                inputProps={{
                    placeholder: "you@example.com",
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                    value: email,
                    onChangeText: setEmail,
                    editable: !loading,
                }}
            />

            <Field
                label="비밀번호"
                inputProps={{
                    placeholder: "비밀번호 (6자 이상)",
                    secureTextEntry: true,
                    value: password,
                    onChangeText: setPassword,
                    editable: !loading,
                }}
            />

            {isSignup && (
                <>
                    <Field
                        label="이름"
                        inputProps={{
                            placeholder: "이름 또는 닉네임",
                            value: displayName,
                            onChangeText: setDisplayName,
                            editable: !loading,
                        }}
                    />

                    <Field
                        label="비밀번호 확인"
                        inputProps={{
                            placeholder: "비밀번호를 다시 입력하세요",
                            secureTextEntry: true,
                            value: passwordConfirm,
                            onChangeText: setPasswordConfirm,
                            editable: !loading,
                        }}
                    />
                </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                disabled={isSubmitDisabled}
                onPress={handlePressSubmit}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={colors.bg} />
                ) : (
                    <Text style={styles.submitButtonText}>{isSignup ? "회원가입" : "로그인"}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.switchButton}
                onPress={toggleMode}
                activeOpacity={0.85}
                disabled={loading}
            >
                <Text style={styles.switchButtonText}>
                    {isSignup ? "이미 계정이 있으신가요? 로그인하기" : "아직 계정이 없나요? 회원가입하기"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: radius.lg,
        paddingHorizontal: space.lg,
        paddingVertical: space.lg + 2, // 18
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
    },

    title: {
        fontSize: 18, // 디자인 유지
        fontWeight: "800",
        color: colors.textStrong,
        marginBottom: space.lg - 4, // 12
    },

    field: {
        marginBottom: space.md - 2, // 10
    },

    label: {
        fontSize: font.small + 1, // 12
        color: colors.text,
        marginBottom: space.xs, // 4
        fontWeight: "700",
    },

    input: {
        borderRadius: radius.md - 2, // 10
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: space.md - 2, // 10
        paddingVertical: space.sm, // 8
        fontSize: font.body + 1, // 14
        color: colors.textStrong,
        backgroundColor: colors.bg,
    },

    errorText: {
        marginTop: space.xs, // 4
        marginBottom: space.sm, // 8
        fontSize: font.small + 1, // 12
        color: "#e11d48", // (에러 토큰 없어서 유지)
        fontWeight: "700",
    },

    submitButton: {
        marginTop: space.xs, // 4
        borderRadius: radius.md - 2, // 10
        paddingVertical: space.md - 2, // 10
        alignItems: "center",
        backgroundColor: colors.accent,
    },

    submitButtonDisabled: {
        backgroundColor: colors.placeholder,
        opacity: 0.55,
    },

    submitButtonText: {
        fontSize: font.body + 1, // 14
        fontWeight: "800",
        color: colors.bg,
    },

    switchButton: {
        marginTop: space.md - 2, // 10
        alignItems: "center",
    },

    switchButtonText: {
        fontSize: font.small + 1, // 12
        color: colors.accent,
        fontWeight: "700",
    },
});