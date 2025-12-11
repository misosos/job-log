// app/components/planner/PlannerTaskSection.tsx (예시 경로)

import React, { memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { PlannerTaskItem } from "./PlannerTaskItem";
import type { PlannerTask } from "../../features/planner/types";

type PlannerTaskSectionProps = {
    title: string;
    loading: boolean;
    tasks: PlannerTask[];
    emptyMessage: string;
    /**
     * 체크 토글 핸들러 (옵션)
     */
    onToggle?: (id: string) => void | Promise<void>;
    /**
     * 삭제 핸들러 (옵션)
     */
    onDelete?: (id: string) => void | Promise<void>;
};

function PlannerTaskSectionBase({
                                    title,
                                    loading,
                                    tasks,
                                    emptyMessage,
                                    onToggle,
                                    onDelete,
                                }: PlannerTaskSectionProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>

            {loading ? (
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color="#6ee7b7" />
                    {/* 스켈레톤 느낌 추가 */}
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.skeleton} />
                    ))}
                </View>
            ) : tasks.length === 0 ? (
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            ) : (
                <View style={styles.list}>
                    {tasks.map((task) => {
                        const handleToggle = () => {
                            if (!onToggle) return;
                            void onToggle(task.id);
                        };

                        const handleDelete = () => {
                            if (!onDelete) return;
                            void onDelete(task.id);
                        };

                        return (
                            <PlannerTaskItem
                                key={task.id}
                                task={task}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        );
                    })}
                </View>
            )}
        </View>
    );
}

export const PlannerTaskSection = memo(PlannerTaskSectionBase);

const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(15,23,42,0.9)", // slate-900/90
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
        marginBottom: 8,
    },
    loadingWrapper: {
        marginTop: 4,
    },
    skeleton: {
        height: 32,
        borderRadius: 8,
        backgroundColor: "rgba(30,64,175,0.3)", // 대충 slate-800/60 느낌
        marginTop: 6,
    },
    emptyText: {
        fontSize: 13,
        color: "#9ca3af", // slate-400
        marginTop: 4,
    },
    list: {
        marginTop: 4,
        gap: 4,
    },
});