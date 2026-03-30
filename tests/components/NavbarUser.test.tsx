import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NavbarUser from "@/components/NavbarUser/NavbarUser";

vi.mock("@/components/AuthProvider", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/components/Avatar", () => ({
  default: ({ name }: { name: string }) => <span>{name}</span>,
}));

const mockSignOut = vi.fn();
vi.mock("firebase/auth", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));
vi.mock("@/lib/firebase", () => ({ auth: {} }));

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

  it("renders logout button when user is logged in", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: "Alice", email: "alice@test.com" },
      loading: false,
    });
    render(<NavbarUser />);
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("does not render logout button when user is null", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<NavbarUser />);
    expect(
      screen.queryByRole("button", { name: "Log out" }),
    ).not.toBeInTheDocument();
  });

  it("does not render logout button while loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<NavbarUser />);
    expect(
      screen.queryByRole("button", { name: "Log out" }),
    ).not.toBeInTheDocument();
  });

  it("clicking logout button calls signOut", async () => {
    mockSignOut.mockResolvedValue(undefined);
    mockUseUser.mockReturnValue({
      user: { displayName: "Alice", email: "alice@test.com" },
      loading: false,
    });
    render(<NavbarUser />);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledWith({}));
  });
});
