// src/components/dashboard/DashboardSummaryCard.tsx
import type { IconType } from "react-icons";
import { Card } from "flowbite-react";

type DashboardSummaryCardProps = {
    label: string;             // 예: "전체 지원"
    value: string | number;    // 예: 12
    helperText?: string;       // 예: "최근 30일 기준"
    icon?: IconType;           // 아이콘 컴포넌트 (옵션)
};

export function DashboardSummaryCard({
                                         label,
                                         value,
                                         helperText,
                                         icon: Icon,
                                     }: DashboardSummaryCardProps) {
    return (
        <Card className="bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                        {value}
                    </p>
                    {helperText && (
                        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
                    )}
                </div>
                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                        <Icon className="h-5 w-5 text-emerald-300" />
                    </div>
                )}
            </div>
        </Card>
    );
}