// app/components/auth/EmailAuthForm.tsx
import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useEmailAuthForm } from "../../features/auth/useEmailAuthForm";

type Props = {
    onSuccess?: () => void;
};

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

    const handlePressSubmit = () => {
        // RN에서는 이벤트 없으니까 그냥 호출
        void handleSubmit();
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                {isSignup ? "이메일로 회원가입" : "이메일로 로그인"}
            </Text>

            {/* 이메일 */}
            <View style={styles.field}>
                <Text style={styles.label}>이메일</Text>
                <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            {/* 비밀번호 */}
            <View style={styles.field}>
                <Text style={styles.label}>비밀번호</Text>
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 (6자 이상)"
                    placeholderTextColor="#6b7280"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            {/* 회원가입일 때만 이름 + 비밀번호 확인 */}
            {isSignup && (
                <>
                    <View style={styles.field}>
                        <Text style={styles.label}>이름</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="이름 또는 닉네임"
                            placeholderTextColor="#6b7280"
                            value={displayName}
                            onChangeText={setDisplayName}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>비밀번호 확인</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호를 다시 입력하세요"
                            placeholderTextColor="#6b7280"
                            secureTextEntry
                            value={passwordConfirm}
                            onChangeText={setPasswordConfirm}
                        />
                    </View>
                </>
            )}

            {/* 에러 메시지 */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* 제출 버튼 */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    (!isFormValid || loading) && styles.submitButtonDisabled,
                ]}
                disabled={!isFormValid || loading}
                onPress={handlePressSubmit}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                    <Text style={styles.submitButtonText}>
                        {isSignup ? "회원가입" : "로그인"}
                    </Text>
                )}
            </TouchableOpacity>

            {/* 모드 전환 */}
            <TouchableOpacity style={styles.switchButton} onPress={toggleMode}>
                <Text style={styles.switchButtonText}>
                    {isSignup
                        ? "이미 계정이 있으신가요? 로그인하기"
                        : "아직 계정이 없나요? 회원가입하기"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 18,
        backgroundColor: "#fff1f2", // rose-50
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
    },

    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#881337", // rose-900
        marginBottom: 12,
    },

    field: {
        marginBottom: 10,
    },

    label: {
        fontSize: 12,
        color: "#9f1239", // rose-800
        marginBottom: 4,
        fontWeight: "700",
    },

    input: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        color: "#881337", // rose-900
        backgroundColor: "#fff1f2", // rose-50
    },

    errorText: {
        marginTop: 4,
        marginBottom: 8,
        fontSize: 12,
        color: "#e11d48", // rose-600
        fontWeight: "700",
    },

    submitButton: {
        marginTop: 4,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: "#f43f5e", // rose-500
    },

    submitButtonDisabled: {
        backgroundColor: "#fb7185", // rose-400 (disabled도 테마 유지)
        opacity: 0.55,
    },

    submitButtonText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#fff1f2", // rose-50
    },

    switchButton: {
        marginTop: 10,
        alignItems: "center",
    },

    switchButtonText: {
        fontSize: 12,
        color: "#f43f5e", // rose-500
        fontWeight: "700",
    },
});