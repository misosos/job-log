// app/screens/dashboard/DashboardScreen.tsx
import React, { memo, type PropsWithChildren } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { DashboardRecentApplicationsSection } from "../../components/dashboard/DashboardRecentApplicationsSection";
import { DashboardTodayTasksSection } from "../../components/dashboard/DashboardTodayTasksSection";
import { DashboardDefaultResumeSection } from "../../components/dashboard/DashboardDefaultResumeSection";
import { DashboardUpcomingSection } from "../../components/dashboard/DashboardUpcomingSection";
import { DashboardSummarySection } from "../../components/dashboard/DashboardSummarySection";

import { colors, radius, space } from "../../styles/theme";

const Section = memo(function Section({ children }: PropsWithChildren) {
    return <View style={styles.section}>{children}</View>;
});

export function DashboardScreen() {
    return (
        <View style={styles.root}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Section>
                    <DashboardSummarySection />
                </Section>
                <Section>
                    <DashboardUpcomingSection />
                </Section>
                <Section>
                    <DashboardRecentApplicationsSection />
                </Section>
                <Section>
                    <DashboardTodayTasksSection />
                </Section>
                <Section>
                    <DashboardDefaultResumeSection />
                </Section>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        paddingHorizontal: space.lg,
        paddingVertical: space.lg,
    },
    section: {
        marginBottom: space.lg,
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md, // 기존 14면 radius에 lg/md 중 하나로 통일(원하면 14 유지해도 됨)
        padding: space.lg,
    },
});