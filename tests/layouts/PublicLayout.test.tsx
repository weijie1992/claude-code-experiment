import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PublicLayout from "@/app/(public)/layout";

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

import { useUser } from "@/components/AuthProvider/AuthProvider";

const mockUseUser = vi.mocked(useUser);

describe("PublicLayout", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders children when unauthenticated and not loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<PublicLayout>page content</PublicLayout>);
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders LoadingScreen while loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<PublicLayout>page content</PublicLayout>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
  });

  it("renders LoadingScreen and redirects to /heists when user is authenticated", () => {
    mockUseUser.mockReturnValue({
      user: { uid: "123" } as never,
      loading: false,
    });
    render(<PublicLayout>page content</PublicLayout>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/heists");
  });
});
