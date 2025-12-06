import { SectionCard } from "../common/SectionCard";
import { PlannerTaskItem } from "./PlannerTaskItem";
import type { PlannerTask } from "../../features/planner/types";

type PlannerTaskSectionProps = {
    title: string;
    loading: boolean;
    tasks: PlannerTask[];
    emptyMessage: string;
    onToggle: (id: string) => void;
};

export function PlannerTaskSection({
                                       title,
                                       loading,
                                       tasks,
                                       emptyMessage,
                                       onToggle,
                                   }: PlannerTaskSectionProps) {
    return (
        <SectionCard title={title}>
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-10 rounded-md bg-slate-800/60 animate-pulse"
                        />
                    ))}
                </div>
            ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-400">{emptyMessage}</p>
            ) : (
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <PlannerTaskItem
                            key={task.id}
                            task={task}
                            onToggle={() => {
                                onToggle(task.id);
                            }}
                        />
                    ))}
                </div>
            )}
        </SectionCard>
    );
}