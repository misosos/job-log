// src/main.tsx (또는 현재 웹 엔트리 파일)

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/globals.css";
import App from "./App.tsx";
import { AuthProvider } from "./libs/auth-context";
import { db, auth } from "./libs/firebase";

// 🔧 shared features API 초기화
import { initApplicationsApi } from "../../shared/features/applications/api";
import { initPlannerApi } from "../../shared/features/planner/api";
import { initInterviewsApi } from "../../shared/features/interviews/api";
import { initResumesApi } from "../../shared/features/resumes/api";

// 웹 쪽에서 한 번만 초기화해서 web/app 공용으로 사용
initApplicationsApi({ db, auth });
initPlannerApi(db, auth);
initInterviewsApi(db);
initResumesApi(db);

createRoot(document.getElementById("root") as HTMLElement).render(
    <AuthProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </AuthProvider>,
);