// app/components/resumes/ResumeList.tsx (예시 경로)
import React, { useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Linking } from "react-native";
import type { ResumeVersion } from "../../features/resumes/types";

type ResumeItemProps = {
    resume: ResumeVersion;
    onSetDefault?: (id: string) => void;
};

function ResumeItem({ resume, onSetDefault }: ResumeItemProps) {
    const handleSetDefault = () => {
        if (!onSetDefault) return;
        onSetDefault(resume.id);
    };

    const handleOpenLink = async () => {
        if (!resume.link) return;

        try {
            const supported = await Linking.canOpenURL(resume.link);
            if (supported) {
                await Linking.openURL(resume.link);
            } else {
                console.warn("이 URL을 열 수 없습니다:", resume.link);
            }
        } catch (e) {
            console.warn("링크 열기 실패:", e);
        }
    };

    return (
        <View style={styles.itemContainer}>
            {/* 왼쪽 정보 영역 */}
            <View style={styles.itemLeft}>
                <Text style={styles.title}>{resume.title}</Text>
                <Text style={styles.target}>타겟: {resume.target}</Text>
                <Text style={styles.updatedAt}>마지막 수정: {resume.updatedAt}</Text>

                {resume.note ? (
                    <Text style={styles.note}>메모: {resume.note}</Text>
                ) : null}
            </View>

            {/* 오른쪽 태그 + 열기 / 기본설정 영역 */}
            <View style={styles.itemRight}>
                {resume.isDefault ? (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>기본 이력서</Text>
                    </View>
                ) : (
                    onSetDefault && (
                        <TouchableOpacity
                            onPress={handleSetDefault}
                            style={styles.setDefaultButton}
                        >
                            <Text style={styles.setDefaultButtonText}>기본으로 설정</Text>
                        </TouchableOpacity>
                    )
                )}

                {resume.link ? (
                    <TouchableOpacity onPress={handleOpenLink} style={styles.openButton}>
                        <Text style={styles.openButtonText}>열기</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}

type ResumeListProps = {
    resumes: ResumeVersion[];
    loading: boolean;
    onSetDefault?: (id: string) => void;
};

export function ResumeList({
                               resumes,
                               loading,
                               onSetDefault,
                           }: ResumeListProps) {
    const sortedResumes = useMemo(
        () =>
            [...resumes].sort((a, b) =>
                (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
            ),
        [resumes],
    );

    if (loading) {
        return (
            <View style={styles.skeletonContainer}>
                {[1, 2].map((i) => (
                    <View key={i} style={styles.skeletonItem}>
                        <ActivityIndicator size="small" color="#10b981" />
                    </View>
                ))}
            </View>
        );
    }

    if (sortedResumes.length === 0) {
        return (
            <Text style={styles.emptyText}>
                아직 등록된 이력서 버전이 없어요. 위 폼에서 첫 이력서를 추가해 보세요.
            </Text>
        );
    }

    return (
        <View style={styles.listContainer}>
            {sortedResumes.map((resume) => (
                <ResumeItem
                    key={resume.id}
                    resume={resume}
                    onSetDefault={onSetDefault}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        gap: 8,
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "rgba(15,23,42,0.6)", // slate-800/60
    },
    itemLeft: {
        flexShrink: 1,
        marginRight: 12,
    },
    itemRight: {
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 6,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffffff",
    },
    target: {
        fontSize: 11,
        color: "#9ca3af", // slate-400
        marginTop: 2,
    },
    updatedAt: {
        fontSize: 11,
        color: "#6b7280", // slate-500
        marginTop: 2,
    },
    note: {
        fontSize: 11,
        color: "#9ca3af",
        marginTop: 4,
    },
    defaultBadge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: "#10b981", // emerald-500
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#020617", // slate-900
    },
    setDefaultButton: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: "rgba(52,211,153,0.7)", // emerald-400/70
    },
    setDefaultButtonText: {
        fontSize: 10,
        color: "#6ee7b7", // emerald-300
    },
    openButton: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "#10b981",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    openButtonText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#020617",
    },
    skeletonContainer: {
        gap: 6,
    },
    skeletonItem: {
        height: 56,
        borderRadius: 8,
        backgroundColor: "rgba(15,23,42,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 13,
        color: "#9ca3af",
    },
});