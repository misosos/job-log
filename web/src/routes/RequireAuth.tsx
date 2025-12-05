import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../libs/auth-context";

export function RequireAuth() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">로딩중...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}