import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { PageLayout } from "./components/layout/PageLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { ApplicationsPage } from "./pages/applications/ApplicationsPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { InterviewsPage } from "./pages/interviews/InterviewsPage";
import { PlannerPage } from "./pages/planner/PlannerPage";
import { ResumesPage } from "./pages/resumes/ResumesPage";

import { useAuth } from "./libs/auth-context";

type RequireAuthProps = {
    children: ReactNode;
};

function RequireAuth({ children }: RequireAuthProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-slate-200">
                로그인 상태 확인 중...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

const protectedRoutes: Array<{ path: string; element: ReactNode }> = [
    { path: "/", element: <DashboardPage /> },
    { path: "/applications", element: <ApplicationsPage /> },
    { path: "/planner", element: <PlannerPage /> },
    { path: "/resumes", element: <ResumesPage /> },
    { path: "/interviews", element: <InterviewsPage /> },
];

function App() {
    return (
        <PageLayout>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {protectedRoutes.map(({ path, element }) => (
                    <Route
                        key={path}
                        path={path}
                        element={<RequireAuth>{element}</RequireAuth>}
                    />
                ))}

                {/* 404 */}
                <Route
                    path="*"
                    element={<div className="text-slate-200">페이지를 찾을 수 없어요.</div>}
                />
            </Routes>
        </PageLayout>
    );
}

export default App;