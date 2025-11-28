// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { PageLayout } from "./components/layout/PageLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage.tsx";
import { ApplicationsPage } from "./pages/applications/ApplicationsPage.tsx";
import { PlannerPage } from "./pages/planner/PlannerPage.tsx";
import { ResumesPage } from "./pages/resumes/ResumesPage.tsx";
import { InterviewsPage } from "./pages/interviews/InterviewsPage.tsx";

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        {/* 404 */}
        <Route path="*" element={<div className="text-slate-200">페이지를 찾을 수 없어요.</div>} />
      </Routes>
    </PageLayout>
  );
}

export default App;