// src/App.tsx
import { PageLayout } from "./components/layout/PageLayout";

function App() {
    return (
        <PageLayout>
            {/* 여기부터는 나중에 DashboardPage로 바꾸면 됨 */}
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">대시보드 (임시)</h1>
                <p className="text-sm text-slate-300">
                    여기에서 지원 현황, 할 일, 면접 기록을 한 번에 볼 수 있어요.
                </p>
            </section>
        </PageLayout>
    );
}

export default App;