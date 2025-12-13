// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/globals.css";
import App from "./App";
import { AuthProvider } from "./libs/auth-context";
import { db, auth } from "./libs/firebase";

// shared features API 초기화
import { initApplicationsApi } from "../../shared/features/applications/api";
import { initPlannerApi } from "../../shared/features/planner/api";
import { initInterviewsApi } from "../../shared/features/interviews/api";
import { initResumesApi } from "../../shared/features/resumes/api";

/** HMR/StrictMode에서도 1번만 init 되도록 전역 가드 */
declare global {
    interface Window {
        __JOBLOG_APIS_INITED__?: boolean;
    }
}

function initSharedApisOnce() {
    if (window.__JOBLOG_APIS_INITED__) return;
    window.__JOBLOG_APIS_INITED__ = true;

    initApplicationsApi({ db, auth });
    initPlannerApi(db, auth);
    initInterviewsApi(db);
    initResumesApi(db);
}

initSharedApisOnce();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element (#root) not found");

createRoot(rootEl).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
);