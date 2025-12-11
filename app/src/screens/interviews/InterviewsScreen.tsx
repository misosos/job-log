// app/screens/interviews/InterviewsScreen.tsx (예시 경로)

import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { auth } from "../../libs/firebase";
import { UpcomingInterviewsSection } from "../../components/interviews/UpcomingInterviewsSection";
import { InterviewReviewSection } from "../../components/interviews/InterviewReviewSection";
import type { InterviewItem } from "../../features/interviews/interviews";
import { createInterview } from "../../features/interviews/api";
import { InterviewCreateForm } from "../../components/interviews/InterviewCreateForm";
import { useInterviews } from "../../features/interviews/useInterviews";

function splitUpcomingAndPast(items: InterviewItem[]) {
    const now = new Date();
    const upcoming: InterviewItem[] = [];
    const past: InterviewItem[] = [];

    items.forEach((item) => {
        const target = item.scheduledAt ? item.scheduledAt.toDate() : null;

        if (target && target >= now) {
            upcoming.push(item);
        } else {
            past.push(item);
        }
    });

    return {
        upcoming,
        past,
    };
}

export function InterviewsScreen() {
    // 현재 로그인 유저 기준으로 훅 사용
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid ?? null;

    const {
        interviews,
        loading,
        error: listError,
        reload,
    } = useInterviews(userId);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleCreate = async (values: {
        company: string;
        role: string;
        date: string;
        time: string;
        type: string;
        note: string;
    }) => {
        const user = auth.currentUser;
        if (!user) {
            setFormError("로그인이 필요합니다.");
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            await createInterview({
                userId: user.uid,
                company: values.company,
                role: values.role,
                date: values.date,
                time: values.time,
                type: values.type,
                note: values.note,
            });

            // 저장 후 목록 새로고침
            await reload();
        } catch (err) {
            console.error("면접 기록 저장 실패:", err);
            setFormError("면접을 저장하는 중 문제가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const { upcoming, past } = splitUpcomingAndPast(interviews);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <View style={styles.section}>
                <SectionCard title="새 면접 기록 추가">
                    <InterviewCreateForm
                        saving={saving}
                        error={formError}
                        onSubmit={handleCreate}
                    />
                </SectionCard>
            </View>

            {listError ? (
                <Text style={styles.errorText}>{listError}</Text>
            ) : null}

            <View style={styles.section}>
                <UpcomingInterviewsSection items={upcoming} loading={loading} />
            </View>

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

export default InterviewsScreen;