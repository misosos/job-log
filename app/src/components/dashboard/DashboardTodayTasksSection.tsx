import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SectionCard } from "../common/SectionCard";
import { usePlanner } from "../../features/planner/usePlanner";
import { colors, font, radius } from "../../styles/theme";

type Task = {
    id: string;
    title: string;
    done?: boolean;
    ddayLabel?: string | null;
};

const SkeletonRow = memo(function SkeletonRow({ isFirst }: { isFirst: boolean }) {
    return <View style={[styles.skeletonItem, !isFirst && styles.rowGap]} />;
});

const TaskRow = memo(function TaskRow({ task, isLast }: { task: Task; isLast: boolean }) {
    return (
        <View style={[styles.taskRow, !isLast && styles.rowGap]}>
            <Text style={[styles.taskText, task.done && styles.taskTextDone]} numberOfLines={1}>
                {task.title}
            </Text>

            {!!task.ddayLabel && (
                <Text style={styles.ddayText} numberOfLines={1}>
                    {task.ddayLabel}
                </Text>
            )}
        </View>
    );
});

export function DashboardTodayTasksSection() {
    const { todayTasks, loading } = usePlanner();
    const tasks = todayTasks.slice(0, 3) as Task[];

    return (
        <SectionCard title="오늘 할 일">
            {loading ? (
                <View style={styles.block}>
                    {[0, 1, 2].map((i) => (
                        <SkeletonRow key={i} isFirst={i === 0} />
                    ))}
                </View>
            ) : tasks.length === 0 ? (
                <Text style={styles.emptyText}>
                    오늘은 아직 등록된 할 일이 없어요. 플래너에서 할 일을 추가해 보세요.
                </Text>
            ) : (
                <View style={styles.block}>
                    {tasks.map((t, idx) => (
                        <TaskRow key={t.id} task={t} isLast={idx === tasks.length - 1} />
                    ))}
                </View>
            )}
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    block: { width: "100%" },

    rowGap: { marginTop: 6 },

    skeletonItem: {
        height: 36,
        width: "100%",
        borderRadius: radius.sm,
        backgroundColor: colors.section,
        borderWidth: 1,
        borderColor: colors.border,
    },

    emptyText: {
        fontSize: font.body,
        color: colors.placeholder,
        fontWeight: "700",
    },

    taskRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: radius.sm,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
    },

    taskText: {
        flex: 1,
        paddingRight: 10,
        fontSize: 14,
        color: colors.text,
        fontWeight: "800",
    },

    taskTextDone: {
        color: colors.placeholder,
        textDecorationLine: "line-through",
        fontWeight: "700",
    },

    ddayText: {
        fontSize: 12,
        color: colors.accent,
        fontWeight: "900",
    },
});