// app/screens/dashboard/DashboardScreen.tsx

import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { DashboardRecentApplicationsSection } from "../../components/dashboard/DashboardRecentApplicationsSection";
import { DashboardTodayTasksSection } from "../../components/dashboard/DashboardTodayTasksSection";
import { DashboardDefaultResumeSection } from "../../components/dashboard/DashboardDefaultResumeSection";
import { DashboardUpcomingSection } from "../../components/dashboard/DashboardUpcomingSection";
import { DashboardSummarySection } from "../../components/dashboard/DashboardSummarySection";

export function DashboardScreen() {
    return (
        <View style={styles.root}>
            {/* 아래 내용 스크롤 영역 */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
            >
                <View style={styles.section}>
                    <DashboardSummarySection />
                </View>

                <View style={styles.section}>
                    <DashboardUpcomingSection />
                </View>

                <View style={styles.section}>
                    <DashboardRecentApplicationsSection />
                </View>

                <View style={styles.section}>
                    <DashboardTodayTasksSection />
                </View>

                <View style={styles.section}>
                    <DashboardDefaultResumeSection />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#fff1f2", // rose-50 (전체 배경)
    },
    container: {
        flex: 1,
        backgroundColor: "#fff1f2", // rose-50
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    section: {
        marginBottom: 16,
        backgroundColor: "#ffe4e6", // rose-100 (섹션 톤)
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200 (라인/보더)
        borderRadius: 14,
        padding: 14,
    },
});