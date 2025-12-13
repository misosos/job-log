import type { ReactNode } from "react";
import { Card } from "flowbite-react";

type SectionCardProps = {
    title?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
};

const BASE_CARD_CLASS =
    "!bg-rose-50 !border !border-rose-200 !shadow-sm !text-rose-900";

export function SectionCard({
                                title,
                                children,
                                className = "",
                                actions,
                            }: SectionCardProps) {
    const hasHeader = Boolean(title) || Boolean(actions);

    return (
        <Card className={`${BASE_CARD_CLASS} ${className}`.trim()}>
            {hasHeader && (
                <div className="mb-3 flex items-center justify-between">
                    {title ? (
                        <h2 className="jl-section-title text-rose-900">{title}</h2>
                    ) : (
                        <span />
                    )}
                    {actions ? <div className="shrink-0">{actions}</div> : null}
                </div>
            )}

            {children}
        </Card>
    );
}