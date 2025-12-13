import { useCallback, useMemo } from "react";
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

type NavItem = { to: string; label: string };

const NAV_ITEMS: NavItem[] = [
    { to: "/applications", label: "지원 현황" },
    { to: "/planner", label: "플래너" },
    { to: "/resumes", label: "이력서" },
    { to: "/interviews", label: "면접 기록" },
];

const HEADER_CLASS =
    "jl-header !bg-rose-50 !text-rose-900 shadow-sm !border-b !border-rose-200 " +
    "dark:!bg-rose-50 dark:!text-rose-900 dark:!border-rose-200";

const BRAND_TEXT_CLASS = "jl-logo !text-rose-900 dark:!text-rose-900";

const LINK_BASE_CLASS =
    "rounded-md px-2 py-1 text-sm font-medium transition-colors " +
    "!text-rose-800 hover:!bg-rose-100 hover:!text-rose-900 " +
    "dark:!text-rose-800 dark:hover:!bg-rose-100 dark:hover:!text-rose-900";

const LINK_ACTIVE_CLASS = "!bg-rose-200 !text-rose-900 dark:!bg-rose-200 dark:!text-rose-900";

const DROPDOWN_PANEL_CLASS =
    "!bg-rose-50 !text-rose-900 !border !border-rose-200 shadow-sm " +
    "dark:!bg-rose-50 dark:!text-rose-900 dark:!border-rose-200";

function HeaderBrand() {
    const navigate = useNavigate();

    const goHome = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            navigate("/");
        },
        [navigate],
    );

    return (
        <NavbarBrand href="/" onClick={goHome} className="dark:!text-rose-900">
            <span className={BRAND_TEXT_CLASS}>Job-Log</span>
        </NavbarBrand>
    );
}

function UserMenu({
                      displayName,
                      email,
                      onSignOut,
                  }: {
    displayName: string;
    email: string;
    onSignOut: () => void;
}) {
    return (
        <Dropdown
            arrowIcon={false}
            inline
            className={DROPDOWN_PANEL_CLASS}
            label={
                <div className="flex h-9 w-9 items-center justify-center rounded-full !bg-rose-100 !text-rose-700 ring-1 !ring-rose-200 shadow-sm dark:!bg-rose-100 dark:!text-rose-700 dark:!ring-rose-200">
                    <HiUser className="h-4 w-4" aria-hidden="true" />
                </div>
            }
        >
            <DropdownHeader className="!text-rose-900 dark:!text-rose-900">
                <span className="block text-sm !text-rose-900 dark:!text-rose-900">{displayName}</span>
                <span className="block truncate text-sm font-medium !text-rose-700 dark:!text-rose-700">
          {email}
        </span>
            </DropdownHeader>

            <DropdownDivider className="!border-rose-200 dark:!border-rose-200" />

            <DropdownItem
                onClick={onSignOut}
                className="!text-rose-800 hover:!bg-rose-100 hover:!text-rose-900 dark:!text-rose-800 dark:hover:!bg-rose-100 dark:hover:!text-rose-900"
            >
                로그아웃
            </DropdownItem>
        </Dropdown>
    );
}

export function Header() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const activePath = location.pathname;

    const linkClass = useCallback(
        (to: string) => (activePath === to ? `${LINK_BASE_CLASS} ${LINK_ACTIVE_CLASS}` : LINK_BASE_CLASS),
        [activePath],
    );

    const handleSignOut = useCallback(async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    }, [navigate]);

    const navItems = useMemo(() => NAV_ITEMS, []);

    return (
        <Navbar fluid rounded className={HEADER_CLASS}>
            <HeaderBrand />

            <div className="jl-header-right flex items-center gap-3 md:gap-4">
                {user ? (
                    <UserMenu
                        displayName={user.displayName ?? "로그인 계정"}
                        email={user.email ?? ""}
                        onSignOut={handleSignOut}
                    />
                ) : null}

                <NavbarToggle className="!text-rose-900 dark:!text-rose-900" />
            </div>

            <NavbarCollapse className="jl-nav flex items-center gap-4 md:gap-6">
                {navItems.map((it) => (
                    <Link key={it.to} to={it.to} className={linkClass(it.to)}>
                        {it.label}
                    </Link>
                ))}
            </NavbarCollapse>
        </Navbar>
    );
}