import React, { memo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { InterviewItem } from "../../../../shared/features/interviews/interviews";
import { colors, font, radius, space } from "../../styles/theme";

type Props = {
    items: InterviewItem[];
    loading: boolean;
};

const TITLE = "다가오는 면접";

export function UpcomingInterviewsSection({ items, loading }: Props) {
    const isEmpty = !loading && items.length === 0;

    return <Card title={TITLE}>{loading ? <Loading /> : isEmpty ? <Empty /> : <UpcomingList items={items} />}</Card>;
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

const Loading = memo(function Loading() {
    return (
        <View style={styles.loadingBox}>
            {/* ✅ 기존 green(#22c55e) → theme accent로 통일 */}
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>면접 일정을 불러오는 중이에요…</Text>
        </View>
    );
});

const Empty = memo(function Empty() {
    return <Text style={styles.emptyText}>아직 예정된 면접이 없어요. 새 면접을 추가해보세요.</Text>;
});

const UpcomingList = memo(function UpcomingList({ items }: { items: InterviewItem[] }) {
    return (
        <View style={styles.list}>
            {items.map((item) => (
                <UpcomingItem key={item.id} item={item} />
            ))}
        </View>
    );
});

const UpcomingItem = memo(function UpcomingItem({ item }: { item: InterviewItem }) {
    const title = `${item.company} · ${item.role}`;
    const meta = `일정: ${item.scheduledAtLabel ?? "일정 미정"}${item.type ? ` · ${item.type}` : ""}`;

    return (
        <View style={styles.itemRow}>
            <View style={styles.itemTextBox}>
                <Text style={styles.companyRoleText} numberOfLines={1} ellipsizeMode="tail">
                    {title}
                </Text>

                <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                    {meta}
                </Text>

                {!!item.note && (
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.noteText}>
                        {item.note}
                    </Text>
                )}
            </View>

            <Badge label="예정" />
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
        marginBottom: space.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },

    title: {
        fontSize: font.h2,
        fontWeight: "700",
        color: colors.text,
        marginBottom: space.md,
    },

    loadingBox: {
        flexDirection: "row",
        alignItems: "center",
    },

    loadingText: {
        marginLeft: space.sm, // gap 대체
        fontSize: font.body,
        color: colors.placeholder,
        fontWeight: "700",
    },

    emptyText: {
        fontSize: font.body,
        color: colors.placeholder,
        fontWeight: "700",
    },

    list: { marginTop: space.xs },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundColor: colors.bg,
        borderRadius: radius.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.md,
        marginBottom: space.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },

    itemTextBox: {
        flex: 1,
        marginRight: space.md,
        minWidth: 0,
    },

    companyRoleText: {
        fontSize: font.h2,
        fontWeight: "700",
        color: colors.textStrong,
    },

    metaText: {
        marginTop: 2,
        fontSize: 12,
        color: colors.placeholder,
        fontWeight: "700",
    },

    noteText: {
        marginTop: space.xs,
        fontSize: 12,
        lineHeight: 17,
        color: colors.text,
        fontWeight: "700",
    },

    badge: {
        paddingHorizontal: space.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.accentSoft,
        borderWidth: 1,
        borderColor: "rgba(244,63,94,0.25)", // 토큰에 없어서 유지(원하면 colors.accentBorder 추가 권장)
        alignSelf: "flex-start",
    },

    badgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: colors.accent,
    },
});