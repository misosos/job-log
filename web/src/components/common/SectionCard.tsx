import type { ReactNode } from "react";
import { Card } from "flowbite-react";

type SectionCardProps = {
    title: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode; // 우측 상단 버튼/필터 같은 거 넣고 싶을 때
};

export function SectionCard({ title, children, className, actions }: SectionCardProps) {
    return (
        <Card
            className={
                "bg-slate-900 border border-slate-800 shadow-sm " +
                (className ?? "")
            }
        >
            <div className="mb-3 flex items-center justify-between">
                <h2 className="jl-section-title">{title}</h2>
                {actions}
            </div>
            {children}
        </Card>
    );
}