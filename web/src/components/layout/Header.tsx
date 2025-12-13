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
import { useAuth } from "../../libs/auth-context";

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const navLinkClass = (path: string) => {
        const base =
            "rounded-md px-2 py-1 text-sm font-medium " +
            "!text-rose-800 hover:!bg-rose-100 hover:!text-rose-900 transition-colors " +
            "dark:!text-rose-800 dark:hover:!bg-rose-100 dark:hover:!text-rose-900";
        const active =
            "!bg-rose-200 !text-rose-900 dark:!bg-rose-200 dark:!text-rose-900";
        return isActive(path) ? `${base} ${active}` : base;
    };

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
            className={
                "jl-header " +
                "!bg-rose-50 !text-rose-900 shadow-sm !border-b !border-rose-200 " +
                "dark:!bg-rose-50 dark:!text-rose-900 dark:!border-rose-200"
            }
        >
            <NavbarBrand
                href="/"
                onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                }}
                className="dark:!text-rose-900"
            >
                <span className="jl-logo !text-rose-900 dark:!text-rose-900">준로그</span>
            </NavbarBrand>

            <div className="jl-header-right flex items-center gap-3 md:gap-4">
                {user && (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        // ✅ dropdown menu(패널)까지 라이트 고정
                        className="!bg-rose-50 !text-rose-900 !border !border-rose-200 shadow-sm dark:!bg-rose-50 dark:!text-rose-900 dark:!border-rose-200"
                        label={
                            <div className="flex h-9 w-9 items-center justify-center rounded-full !bg-rose-100 !text-rose-700 ring-1 !ring-rose-200 shadow-sm dark:!bg-rose-100 dark:!text-rose-700 dark:!ring-rose-200">
                                <HiUser className="h-4 w-4" aria-hidden="true" />
                            </div>
                        }
                    >
                        <DropdownHeader className="!text-rose-900 dark:!text-rose-900">
              <span className="block text-sm !text-rose-900 dark:!text-rose-900">
                {user.displayName ?? "로그인 계정"}
              </span>
                            <span className="block truncate text-sm font-medium !text-rose-700 dark:!text-rose-700">
                {user.email}
              </span>
                        </DropdownHeader>

                        <DropdownDivider className="!border-rose-200 dark:!border-rose-200" />

                        <DropdownItem
                            onClick={handleSignOut}
                            className="!text-rose-800 hover:!bg-rose-100 hover:!text-rose-900 dark:!text-rose-800 dark:hover:!bg-rose-100 dark:hover:!text-rose-900"
                        >
                            로그아웃
                        </DropdownItem>
                    </Dropdown>
                )}

                <NavbarToggle className="!text-rose-900 dark:!text-rose-900" />
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