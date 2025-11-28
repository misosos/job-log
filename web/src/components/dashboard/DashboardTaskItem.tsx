type DashboardTaskItemProps = {
    title: string;
    dday: string; // "D-3" 이런 텍스트
};

export function DashboardTaskItem({ title, dday }: DashboardTaskItemProps) {
    return (
        <div className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
            <div className="flex items-center gap-3">
                {/* 가짜 체크박스 (미완료 상태) */}
                <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-500" />

                <p className="text-sm text-slate-200">{title}</p>
            </div>

            <span className="text-xs text-emerald-300">{dday}</span>
        </div>
    );
}