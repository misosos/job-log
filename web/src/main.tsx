import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import "./styles/globals.css";
import App from './App.tsx'
import { AuthProvider } from "./libs/auth-context";

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </AuthProvider>
)
