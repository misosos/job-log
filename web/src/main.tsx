// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/globals.css";
import App from "./App";
import { AuthProvider } from "./libs/auth-context";
import { db, auth } from "./libs/firebase";

// shared features API 초기화
import { initApplicationsApi } from "shared/features/applications/api.ts";
import { initPlannerApi } from "shared/features/planner/api";
import { initInterviewsApi } from "shared/features/interviews/api";
import { initResumesApi } from "shared/features/resumes/api";

/**
 * HMR/StrictMode에서도 1번만 init 되도록 전역 플래그로 가드
 * - StrictMode: 개발 환경에서 이펙트/렌더가 2번씩 호출될 수 있음
 * - HMR: 모듈이 재평가될 수 있음
 */
const INIT_FLAG_KEY = "__JOBLOG_APIS_INITED__";

function initSharedApisOnce() {
    const g = globalThis as unknown as Record<string, unknown>;
    if (g[INIT_FLAG_KEY]) return;
    g[INIT_FLAG_KEY] = true;

    initApplicationsApi({ db, auth });
    initPlannerApi(db, auth);
    initInterviewsApi(db);
    initResumesApi(db);
}

function getRootElement(id: string) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Root element (#${id}) not found`);
    return el;
}

function bootstrap() {
    initSharedApisOnce();

    const rootEl = getRootElement("root");
    createRoot(rootEl).render(
        <StrictMode>
            <AuthProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProvider>
        </StrictMode>,
    );
}

bootstrap();