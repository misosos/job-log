import React, { memo, useCallback, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Linking,
    Platform,
} from "react-native";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";
import { colors, font, radius, space } from "../../styles/theme";

type ResumeItemProps = {
    resume: ResumeVersion;
    onSetDefault?: (id: string) => void;
};

const ResumeItem = memo(function ResumeItem({ resume, onSetDefault }: ResumeItemProps) {
    const handleSetDefault = useCallback(() => {
        onSetDefault?.(resume.id);
    }, [onSetDefault, resume.id]);

    const handleOpenLink = useCallback(async () => {
        const url = resume.link?.trim();
        if (!url) return;

        try {
            if (Platform.OS === "web") {
                await Linking.openURL(url);
                return;
            }

            const supported = await Linking.canOpenURL(url);
            if (!supported) {
                console.warn("이 URL을 열 수 없습니다:", url);
                return;
            }
            await Linking.openURL(url);
        } catch (e) {
            console.warn("링크 열기 실패:", e);
        }
    }, [resume.link]);

    const showSetDefault = !resume.isDefault && !!onSetDefault;
    const showOpen = !!resume.link;

    return (
        <View style={styles.itemContainer}>
            {/* 왼쪽 정보 */}
            <View style={styles.itemLeft}>
                <Text style={styles.title} numberOfLines={1}>
                    {resume.title}
                </Text>

                <Text style={styles.target} numberOfLines={1}>
                    타겟: {resume.target}
                </Text>

                <Text style={styles.updatedAt} numberOfLines={1}>
                    마지막 수정: {resume.updatedAt}
                </Text>

                {resume.note ? (
                    <Text style={styles.note} numberOfLines={2}>
                        메모: {resume.note}
                    </Text>
                ) : null}
            </View>

            {/* 오른쪽 액션 */}
            <View style={styles.itemRight}>
                {resume.isDefault ? (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>기본 이력서</Text>
                    </View>
                ) : showSetDefault ? (
                    <TouchableOpacity
                        onPress={handleSetDefault}
                        style={styles.setDefaultButton}
                        hitSlop={HIT_SLOP}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.setDefaultButtonText}>기본으로 설정</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.rightSpacer} />
                )}

                {showOpen ? (
                    <TouchableOpacity
                        onPress={handleOpenLink}
                        style={styles.openButton}
                        hitSlop={HIT_SLOP}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.openButtonText}>열기</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
});

type ResumeListProps = {
    resumes: ResumeVersion[];
    loading: boolean;
    onSetDefault?: (id: string) => void;
};

export function ResumeList({ resumes, loading, onSetDefault }: ResumeListProps) {
    const sortedResumes = useMemo(() => {
        const safe = Array.isArray(resumes) ? resumes : [];
        return [...safe].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    }, [resumes]);

    if (loading) {
        return (
            <View style={styles.skeletonContainer}>
                {[1, 2].map((i) => (
                    <View key={i} style={styles.skeletonItem}>
                        {/* 기존 green -> accent로 통일 */}
                        <ActivityIndicator size="small" color={colors.accent} />
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
            {sortedResumes.map((resume, idx) => (
                <View
                    key={resume.id}
                    style={[styles.listItemWrapper, idx === sortedResumes.length - 1 && styles.lastItem]}
                >
                    <ResumeItem resume={resume} onSetDefault={onSetDefault} />
                </View>
            ))}
        </View>
    );
}

const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;

const styles = StyleSheet.create({
    listContainer: {
        marginTop: space.sm,
    },
    listItemWrapper: {
        marginBottom: space.sm,
    },
    lastItem: {
        marginBottom: 0,
    },

    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: space.md,
        paddingVertical: space.md,
        borderRadius: 10, // (radius.sm은 8이라 기존 느낌 유지)
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
            },
            android: { elevation: 2 },
            default: {},
        }),
    },

    itemLeft: {
        flex: 1,
        flexShrink: 1,
        marginRight: space.md,
    },
    itemRight: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },

    title: {
        fontSize: font.h2, // 15
        fontWeight: "700",
        color: colors.textStrong,
    },
    target: {
        fontSize: 12,
        color: colors.text,
        opacity: 0.75,
        marginTop: space.xs,
    },
    updatedAt: {
        fontSize: 11,
        color: colors.text,
        opacity: 0.55,
        marginTop: space.sm,
    },
    note: {
        fontSize: 12,
        color: colors.text,
        opacity: 0.65,
        marginTop: space.md,
    },

    defaultBadge: {
        borderRadius: radius.pill,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        backgroundColor: colors.accent,
        marginBottom: space.xs,
    },
    defaultBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.bg,
    },

    setDefaultButton: {
        borderRadius: radius.pill,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.section,
        marginBottom: space.xs,
    },
    setDefaultButtonText: {
        fontSize: 11,
        color: colors.accent,
        fontWeight: "700",
    },

    // 기본 뱃지가 없고 setDefault도 없는 경우 레이아웃 흔들림 방지
    rightSpacer: {
        height: 24,
    },

    openButton: {
        borderRadius: radius.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        backgroundColor: colors.accent,
    },
    openButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.bg,
    },

    skeletonContainer: {
        marginTop: space.sm,
    },
    skeletonItem: {
        height: 60,
        borderRadius: 10,
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: space.sm,
    },

    emptyText: {
        fontSize: 13,
        color: colors.text,
        opacity: 0.65,
        marginTop: space.xs,
    },
});