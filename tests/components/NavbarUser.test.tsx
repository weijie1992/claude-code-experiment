import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NavbarUser from "@/components/NavbarUser/NavbarUser";

vi.mock("@/components/AuthProvider", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/components/Avatar", () => ({
  default: ({ name }: { name: string }) => <span>{name}</span>,
}));

import { useUser } from "@/components/AuthProvider";

const mockUseUser = useUser as ReturnType<typeof vi.fn>;

describe("NavbarUser", () => {
  it("renders Avatar with displayName when user is logged in", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: "Alice", email: "alice@test.com" },
      loading: false,
    });
    render(<NavbarUser />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("falls back to email when displayName is null", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: null, email: "alice@test.com" },
      loading: false,
    });
    render(<NavbarUser />);
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("renders nothing when user is null", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    const { container } = render(<NavbarUser />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    const { container } = render(<NavbarUser />);
    expect(container).toBeEmptyDOMElement();
  });
});
