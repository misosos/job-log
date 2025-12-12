// app/screens/interviews/InterviewsScreen.tsx

import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useAuth } from "../../libs/auth-context";
import { useInterviewPageController } from "../../features/interviews/useInterviewPageController";

export function InterviewsScreen() {
    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    const {
        upcoming,
        past,
        loading,
        listError,
        saving,
        formError,
        handleCreate,
    } = useInterviewPageController(userId);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* 새 면접 기록 추가 */}
            <View style={styles.section}>
                <SectionCard title="새 면접 기록 추가">
                    <InterviewCreateForm
                        saving={saving}
                        error={formError}
                        onSubmit={handleCreate}
                    />
                </SectionCard>
            </View>

            {/* 목록 에러 */}
            {listError ? (
                <Text style={styles.errorText}>{listError}</Text>
            ) : null}

            {/* 다가올 면접 */}
            <View style={styles.section}>
                <UpcomingInterviewsSection items={upcoming} loading={loading} />
            </View>

            {/* 지난 면접 / 리뷰 */}
            <View style={styles.section}>
                <InterviewReviewSection items={past} loading={loading} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617", // slate-900 느낌
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    section: {
        marginBottom: 16,
    },
    errorText: {
        fontSize: 12,
        color: "#fecaca", // red-200 느낌
        marginBottom: 8,
    },
});