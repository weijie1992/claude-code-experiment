import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthProvider, { useUser } from "@/components/AuthProvider/AuthProvider";

const mockUnsubscribe = vi.fn();
let capturedCallback: ((user: unknown) => void) | null = null;

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    capturedCallback = callback;
    return mockUnsubscribe;
  }),
  getAuth: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ auth: {} }));

function TestConsumer() {
  const { user, loading } = useUser();
  return (
    <div>
      <span data-loading={String(loading)}>
        {user
          ? ((user as { displayName?: string; email?: string }).displayName ??
            (user as { email?: string }).email)
          : "no user"}
      </span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    capturedCallback = null;
    mockUnsubscribe.mockClear();
  });

  it("returns loading=true before auth state resolves", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    const span = screen.getByText("no user");
    expect(span).toHaveAttribute("data-loading", "true");
  });

  it("returns user=null and loading=false when auth fires with no user", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    act(() => capturedCallback!(null));
    const span = screen.getByText("no user");
    expect(span).toHaveAttribute("data-loading", "false");
  });

  it("returns the user object when auth fires with a signed-in user", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    act(() =>
      capturedCallback!({ displayName: "Alice", email: "alice@test.com" }),
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("unsubscribes from the auth listener on unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it("throws when useUser is called outside AuthProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useUser must be used within an AuthProvider",
    );
    consoleError.mockRestore();
  });
});
