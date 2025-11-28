// src/components/layout/PageLayout.tsx
import type { ReactNode } from "react";
import { Header } from "./Header";

type Props = {
    children: ReactNode;
};

export function PageLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
    );
}