import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { SectionCard } from "../common/SectionCard";
import { useAuth } from "../../libs/auth-context";
import { useResumesController } from "../../features/resumes/useResumesController";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

import { colors, radius, font } from "../../styles/theme";

type DashboardResume = Pick<ResumeVersion, "id" | "title" | "target" | "note" | "link">;

function pickDefaultResume(resumes?: ResumeVersion[] | null): DashboardResume | null {
    if (!resumes?.length) return null;
    const picked = resumes.find((r) => r.isDefault) ?? resumes[0];
    return picked
        ? {
            id: picked.id,
            title: picked.title,
            target: picked.target,
            note: picked.note,
            link: picked.link,
        }
        : null;
}

async function openExternalLink(url: string) {
    const v = url.trim();
    if (!v) return;

    if (!/^https?:\/\//i.test(v)) {
        console.warn("[DashboardDefaultResumeSection] invalid url:", v);
        return;
    }

    const can = await Linking.canOpenURL(v);
    if (!can) {
        console.warn("[DashboardDefaultResumeSection] cannot open url:", v);
        return;
    }
    await Linking.openURL(v);
}

export function DashboardDefaultResumeSection() {
    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    const { resumes, loading, error } = useResumesController(userId);
    const defaultResume = useMemo(() => pickDefaultResume(resumes), [resumes]);

    const handlePressLink = useCallback(async () => {
        if (!defaultResume?.link) return;
        try {
            await openExternalLink(defaultResume.link);
        } catch (e) {
            console.warn("[DashboardDefaultResumeSection] 링크 열기 실패:", e);
        }
    }, [defaultResume?.link]);

    let content: React.ReactNode;

    if (loading) {
        content = <View style={styles.skeleton} />;
    } else if (error) {
        content = <Text style={styles.errorText}>{error}</Text>;
    } else if (!defaultResume) {
        content = (
            <Text style={styles.emptyText}>
                아직 기본 이력서가 설정되지 않았어요. 이력서 페이지에서 하나를 기본으로 설정해 보세요.
            </Text>
        );
    } else {
        content = (
            <View>
                <Text style={styles.title} numberOfLines={1}>
                    {defaultResume.title}
                </Text>
                <Text style={styles.target} numberOfLines={1}>
                    {defaultResume.target}
                </Text>

                {!!defaultResume.note && (
                    <Text style={styles.note} numberOfLines={2}>
                        {defaultResume.note}
                    </Text>
                )}

                {!!defaultResume.link && (
                    <Text style={styles.link} numberOfLines={1} onPress={handlePressLink}>
                        {defaultResume.link}
                    </Text>
                )}
            </View>
        );
    }

    return <SectionCard title="기본 이력서">{content}</SectionCard>;
}

const styles = StyleSheet.create({
    skeleton: {
        height: 64,
        borderRadius: radius.md,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
    },

    errorText: {
        fontSize: 12,
        color: "#e11d48",
        fontWeight: "700",
    },

    emptyText: {
        fontSize: font.body,
        color: colors.placeholder,
    },

    title: {
        fontSize: font.h2,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 2,
    },

    target: {
        fontSize: 12,
        color: colors.accent,
        marginBottom: 6,
    },

    note: {
        fontSize: 12,
        color: colors.text,
        marginBottom: 4,
    },

    link: {
        fontSize: 12,
        color: colors.accent,
        textDecorationLine: "underline",
    },
});