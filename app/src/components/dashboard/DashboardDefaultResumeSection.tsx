import React, { useMemo } from "react";
import { View, Text, StyleSheet, Linking } from "react-native";

import { SectionCard } from "../common/SectionCard";
import { useResumesController } from "../../features/resumes/useResumesController";
import type { ResumeVersion } from "../../features/resumes/types";

/**
 * 대시보드에서 사용할 최소한의 이력서 정보 타입
 */
type DashboardResume = {
    id: string;
    title: string;
    target: string;
    note?: string;
    link?: string;
};

export function DashboardDefaultResumeSection() {
    const { resumes, loading, error } = useResumesController();

    const defaultResume = useMemo<DashboardResume | null>(() => {
        if (!resumes || resumes.length === 0) return null;

        // 1순위: isDefault === true
        const picked: ResumeVersion | undefined =
            resumes.find((r) => r.isDefault) ?? resumes[0];

        if (!picked) return null;

        return {
            id: picked.id,
            title: picked.title,
            target: picked.target,
            note: picked.note,
            link: picked.link,
        };
    }, [resumes]);

    const handleOpenLink = async (link?: string) => {
        if (!link) return;
        try {
            await Linking.openURL(link);
        } catch (e) {
            console.warn("[DashboardDefaultResumeSection] 링크 열기 실패:", e);
        }
    };

    return (
        <SectionCard title="기본 이력서">
            {loading ? (
                // ⏳ 로딩 스켈레톤
                <View style={styles.skeleton} />
            ) : error ? (
                // ⚠️ 에러
                <Text style={styles.errorText}>{error}</Text>
            ) : !defaultResume ? (
                // 📭 기본 이력서 없음
                <Text style={styles.emptyText}>
                    아직 기본 이력서가 설정되지 않았어요. 이력서 페이지에서 하나를
                    기본으로 설정해 보세요.
                </Text>
            ) : (
                // ✅ 기본 이력서 정보
                <View>
                    <Text style={styles.title}>{defaultResume.title}</Text>
                    <Text style={styles.target}>{defaultResume.target}</Text>

                    {defaultResume.note ? (
                        <Text style={styles.note} numberOfLines={2}>
                            {defaultResume.note}
                        </Text>
                    ) : null}

                    {defaultResume.link ? (
                        <Text
                            style={styles.link}
                            numberOfLines={1}
                            onPress={() => handleOpenLink(defaultResume.link)}
                        >
                            {defaultResume.link}
                        </Text>
                    ) : null}
                </View>
            )}
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        height: 64,
        borderRadius: 12,
        backgroundColor: "#020617",
        borderWidth: 1,
        borderColor: "#111827",
    },
    errorText: {
        fontSize: 12,
        color: "#fecaca", // red-200
    },
    emptyText: {
        fontSize: 13,
        color: "#9ca3af", // slate-400
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#e5e7eb",
        marginBottom: 2,
    },
    target: {
        fontSize: 12,
        color: "#9ca3af",
        marginBottom: 6,
    },
    note: {
        fontSize: 12,
        color: "#cbd5f5",
        marginBottom: 4,
    },
    link: {
        fontSize: 12,
        color: "#a5b4fc", // 링크 느낌
        textDecorationLine: "underline",
    },
});