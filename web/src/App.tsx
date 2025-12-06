// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { type ReactNode, useEffect, useState } from "react";
import { PageLayout } from "./components/layout/PageLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage.tsx";
import { ApplicationsPage } from "./pages/applications/ApplicationsPage.tsx";
import { PlannerPage } from "./pages/planner/PlannerPage.tsx";
import { ResumesPage } from "./pages/resumes/ResumesPage.tsx";
import { InterviewsPage } from "./pages/interviews/InterviewsPage.tsx";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import { auth } from "./libs/firebase";
import type { User } from "firebase/auth";

type RequireAuthProps = {
  children: ReactNode;
};

function RequireAuth({ children }: RequireAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/applications"
          element={
            <RequireAuth>
              <ApplicationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/planner"
          element={
            <RequireAuth>
              <PlannerPage />
            </RequireAuth>
          }
        />
        <Route
          path="/resumes"
          element={
            <RequireAuth>
              <ResumesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/interviews"
          element={
            <RequireAuth>
              <InterviewsPage />
            </RequireAuth>
          }
        />

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