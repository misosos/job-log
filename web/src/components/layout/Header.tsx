import {
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarToggle,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { HiUser } from "react-icons/hi";

import { auth } from "../../libs/firebase";
import { useAuth } from "../../libs/auth-context"; // ✅ 공통 Auth 훅 사용

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ 더 이상 로컬 useState/useEffect 필요 없음
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path;
    const navLinkClass = (path: string) =>
        isActive(path)
            ? "jl-nav-link jl-nav-link--active"
            : "jl-nav-link";

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    return (
        <Navbar
            fluid
            rounded
            className="jl-header bg-slate-900 text-slate-50 shadow-sm dark:bg-slate-950 dark:text-slate-50"
        >
            <NavbarBrand
                href="/"
                onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                }}
            >
                <span className="jl-logo">준로그</span>
            </NavbarBrand>

            <div className="jl-header-right flex items-center gap-3 md:gap-4">
                {user && (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white ring-1 ring-slate-600 shadow-sm">
                                <HiUser className="h-4 w-4" aria-hidden="true" />
                            </div>
                        }
                    >
                        <DropdownHeader>
                            <span className="block text-sm">
                                {user.displayName ?? "로그인 계정"}
                            </span>
                            <span className="block truncate text-sm font-medium">
                                {user.email}
                            </span>
                        </DropdownHeader>
                        <DropdownDivider />
                        <DropdownItem onClick={handleSignOut}>로그아웃</DropdownItem>
                    </Dropdown>
                )}
                <NavbarToggle />
            </div>

            <NavbarCollapse className="jl-nav flex items-center gap-4 md:gap-6">
                <Link to="/applications" className={navLinkClass("/applications")}>
                    지원 현황
                </Link>
                <Link to="/planner" className={navLinkClass("/planner")}>
                    플래너
                </Link>
                <Link to="/resumes" className={navLinkClass("/resumes")}>
                    이력서
                </Link>
                <Link to="/interviews" className={navLinkClass("/interviews")}>
                    면접 기록
                </Link>
            </NavbarCollapse>
        </Navbar>
    );
}