import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardLayout from "@/app/(dashboard)/layout";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/components/AuthProvider/AuthProvider", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/components/LoadingScreen", () => ({
  default: () => <div>Loading</div>,
}));

vi.mock("@/components/Navbar", () => ({
  default: () => <nav>Navbar</nav>,
}));

import { useUser } from "@/components/AuthProvider/AuthProvider";

const mockUseUser = vi.mocked(useUser);

describe("DashboardLayout", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders children when authenticated and not loading", () => {
    mockUseUser.mockReturnValue({
      user: { uid: "123" } as never,
      loading: false,
    });
    render(<DashboardLayout>page content</DashboardLayout>);
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByText("Navbar")).toBeInTheDocument();
  });

  it("renders LoadingScreen while loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<DashboardLayout>page content</DashboardLayout>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
  });

  it("renders LoadingScreen and redirects to /login when unauthenticated", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<DashboardLayout>page content</DashboardLayout>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});
