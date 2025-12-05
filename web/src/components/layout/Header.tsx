import {
    Avatar,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarToggle,
} from "flowbite-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const navLinkClass = (path: string) =>
        isActive(path)
            ? "jl-nav-link jl-nav-link--active"
            : "jl-nav-link";

    return (
        <Navbar fluid rounded className="jl-header">
            <NavbarBrand as={Link} to="/">
                <span className="jl-logo">준로그</span>
            </NavbarBrand>

            <div className="jl-header-right">
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar
                            alt="User settings"
                            img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                            rounded
                        />
                    }
                >
                    <DropdownHeader>
                        <span className="block text-sm">Bonnie Green</span>
                        <span className="block truncate text-sm font-medium">
              name@flowbite.com
            </span>
                    </DropdownHeader>
                    <DropdownItem>Dashboard</DropdownItem>
                    <DropdownItem>Settings</DropdownItem>
                    <DropdownItem>Earnings</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem>Sign out</DropdownItem>
                </Dropdown>
                <NavbarToggle />
            </div>

            <NavbarCollapse className="jl-nav">
                <Link to="/" className={navLinkClass("/")}>
                    대시보드
                </Link>
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