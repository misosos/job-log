import {
    Avatar,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle,
} from "flowbite-react";

export function Header() {
    return (
        <Navbar fluid rounded className="jl-header">
            <NavbarBrand href="/">
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
                <NavbarLink href="/" active className="jl-nav-link">
                    대시보드
                </NavbarLink>
                <NavbarLink href="/applications" className="jl-nav-link">
                    지원 현황
                </NavbarLink>
                <NavbarLink href="/planner" className="jl-nav-link">
                    플래너
                </NavbarLink>
                <NavbarLink href="/resumes" className="jl-nav-link">
                    이력서
                </NavbarLink>
                <NavbarLink href="/interviews" className="jl-nav-link">
                    면접 기록
                </NavbarLink>
            </NavbarCollapse>
        </Navbar>
    );
}