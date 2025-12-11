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
        backgroundColor: "#020617", // 전체 배경 (slate-950 느낌)
    },
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    section: {
        marginBottom: 16, // space-y-6 비슷한 여백
    },
});

export default DashboardScreen;