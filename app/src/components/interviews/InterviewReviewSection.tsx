import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";

import { colors, font, radius, space } from "../../styles/theme";

type Props = {
    /** 이미 '지난 면접'만 들어온다고 가정 (useInterviewPageController의 past) */
    items: InterviewItem[];
    loading: boolean;
};

const TITLE = "면접 회고";

export function InterviewReviewSection({ items, loading }: Props) {
    const isEmpty = !loading && items.length === 0;

    // (선택) 혹시 정렬이 필요하면 여기서 정렬 가능
    const list = useMemo(() => items, [items]);

    return <Card title={TITLE}>{loading ? <Skeleton /> : isEmpty ? <Empty /> : <ReviewList items={list} />}</Card>;
}

/** -----------------------------
 * Presentational components
 * ------------------------------ */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    );
}

const Skeleton = memo(function Skeleton() {
    return (
        <View style={styles.skeletonContainer}>
            {[0, 1].map((i) => (
                <View key={i} style={[styles.skeleton, i > 0 && styles.skeletonSpacing]} />
            ))}
        </View>
    );
});

const Empty = memo(function Empty() {
    return (
        <Text style={styles.emptyText}>
            아직 회고를 남긴 완료된 면접이 없어요.{"\n"}
            면접이 끝난 뒤 느낀 점과 개선점을 간단히 기록해보세요.
        </Text>
    );
});

const ReviewList = memo(function ReviewList({ items }: { items: InterviewItem[] }) {
    return (
        <View style={styles.list}>
            {items.map((item) => (
                <ReviewItem key={item.id} item={item} />
            ))}
        </View>
    );
});

const ReviewItem = memo(function ReviewItem({ item }: { item: InterviewItem }) {
    const title = `${item.company} · ${item.role}`;
    const meta = `진행일: ${item.scheduledAtLabel ?? "일정 미정"}${item.type ? ` · ${item.type}` : ""}`;

    return (
        <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
                <View style={styles.itemTitleBox}>
                    <Text style={styles.companyRoleText} numberOfLines={1} ellipsizeMode="tail">
                        {title}
                    </Text>
                    <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                        {meta}
                    </Text>
                </View>

                <Badge label="완료" />
            </View>

            {!!item.note && (
                <Text style={styles.noteText} numberOfLines={3} ellipsizeMode="tail">
                    {item.note}
                </Text>
            )}
        </View>
    );
});

const Badge = memo(function Badge({ label }: { label: string }) {
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{label}</Text>
        </View>
    );
});

/** -----------------------------
 * styles (theme tokens)
 * ------------------------------ */

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bg,
        borderRadius: radius.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        marginBottom: space.md,
        borderWidth: 1,
        borderColor: colors.border,
    },

    title: {
        fontSize: font.h2,
        fontWeight: "700",
        color: colors.text,
        marginBottom: space.md,
    },

    skeletonContainer: { width: "100%" },

    skeleton: {
        height: 72,
        borderRadius: radius.sm,
        backgroundColor: colors.section,
        opacity: 0.8,
        borderWidth: 1,
        borderColor: colors.border,
    },

    skeletonSpacing: { marginTop: space.sm },

    emptyText: {
        fontSize: font.body,
        color: colors.text,
        lineHeight: 18,
    },

    list: { marginTop: space.xs },

    itemCard: {
        backgroundColor: colors.bg,
        borderRadius: radius.sm,
        paddingVertical: space.sm,
        paddingHorizontal: space.md,
        marginBottom: space.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },

    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    itemTitleBox: {
        flex: 1,
        paddingRight: space.sm,
        minWidth: 0,
    },

    companyRoleText: {
        fontSize: font.body,
        fontWeight: "700",
        color: colors.textStrong,
    },

    metaText: {
        marginTop: 2,
        fontSize: font.small,
        color: colors.placeholder, // 기존 rose-400 역할
        fontWeight: "700",
    },

    badge: {
        paddingHorizontal: space.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
        backgroundColor: colors.accent,
    },

    badgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: colors.bg,
    },

    noteText: {
        marginTop: space.sm,
        fontSize: 12,
        lineHeight: 17,
        color: colors.text,
    },
});