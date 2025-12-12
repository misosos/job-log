import React, { memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
// 🔹 여기서 타입까지 같이 import
import {
    PlannerTaskItem,
    type PlannerTaskWithLabel,
} from "./PlannerTaskItem";

type PlannerTaskSectionProps = {
    title: string;
    loading: boolean;
    tasks: PlannerTaskWithLabel[];
    emptyMessage: string;
    /** 체크 토글 핸들러 (옵션) */
    onToggle?: (id: string) => void | Promise<void>;
    /** 삭제 핸들러 (옵션) */
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
    const renderItem = (item: PlannerTaskWithLabel) => {
        const handleToggle = () => {
            if (!onToggle) return;
            void onToggle(item.id);
        };

        const handleDelete = () => {
            if (!onDelete) return;
            void onDelete(item.id);
        };

        return (
            <View style={styles.itemWrapper}>
                <PlannerTaskItem
                    task={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                />
            </View>
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{title}</Text>
                {loading && <ActivityIndicator size="small" color="#6ee7b7" />}
            </View>

            {loading ? (
                <View style={styles.loadingWrapper}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.skeleton} />
                    ))}
                </View>
            ) : tasks.length === 0 ? (
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            ) : (
                <View style={styles.listContent}>
                    {tasks.map((task) => (
                        <React.Fragment key={task.id}>{renderItem(task)}</React.Fragment>
                    ))}
                </View>
            )}
        </View>
    );
}

export const PlannerTaskSection = memo(PlannerTaskSectionBase);

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#020617", // slate-950
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(148,163,184,0.35)", // slate-400/35
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#e5e7eb", // slate-200
    },
    loadingWrapper: {
        marginTop: 4,
    },
    skeleton: {
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(30,64,175,0.32)", // 대충 slate-800/60 느낌
        marginTop: 8,
    },
    emptyText: {
        fontSize: 13,
        color: "#9ca3af", // slate-400
        marginTop: 4,
    },
    listContent: {
        paddingVertical: 4,
    },
    itemWrapper: {
        marginBottom: 6,
    },
});