import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthForm from "@/components/AuthForm";

// --- Firebase mocks ---

const mockUpdateProfile = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn();
const mockCreateUser = vi.fn();
const mockSignIn = vi.fn();

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUser(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
  getAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }));
vi.mock("@/lib/codename", () => ({
  generateCodename: () => "SilentFoxStrikes",
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// -------

function fillAndSubmit(mode: "login" | "signup") {
  render(<AuthForm mode={mode} />);
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "a@b.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secret123" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: mode === "login" ? "Log in" : "Sign up",
    }),
  );
}

describe("AuthForm", () => {
  describe("Rendering — login mode", () => {
    it("renders the email input", () => {
      render(<AuthForm mode="login" />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders the password input", () => {
      render(<AuthForm mode="login" />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it('renders a submit button labelled "Log in"', () => {
      render(<AuthForm mode="login" />);
      expect(
        screen.getByRole("button", { name: "Log in" }),
      ).toBeInTheDocument();
    });

    it("renders a link to /signup", () => {
      render(<AuthForm mode="login" />);
      const link = screen.getByRole("link", { name: "Sign up" });
      expect(link).toHaveAttribute("href", "/signup");
    });
  });

  describe("Rendering — signup mode", () => {
    it('renders a submit button labelled "Sign up"', () => {
      render(<AuthForm mode="signup" />);
      expect(
        screen.getByRole("button", { name: "Sign up" }),
      ).toBeInTheDocument();
    });

    it("renders a link to /login", () => {
      render(<AuthForm mode="signup" />);
      const link = screen.getByRole("link", { name: "Log in" });
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  describe("Password visibility toggle", () => {
    it('password input starts as type="password"', () => {
      render(<AuthForm mode="login" />);
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password",
      );
    });

    it("clicking the toggle changes input to type text", () => {
      render(<AuthForm mode="login" />);
      fireEvent.click(screen.getByRole("button", { name: "Show password" }));
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("clicking again restores type password", () => {
      render(<AuthForm mode="login" />);
      const toggle = screen.getByRole("button", { name: "Show password" });
      fireEvent.click(toggle);
      fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password",
      );
    });
  });

  describe("Form submission — validation", () => {
    it("does not call signIn when both fields are empty", () => {
      render(<AuthForm mode="login" />);
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("does not call signIn when only email is filled", () => {
      render(<AuthForm mode="login" />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "a@b.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("does not call signIn when only password is filled", () => {
      render(<AuthForm mode="login" />);
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "secret" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe("Form submission — login mode", () => {
    beforeEach(() => {
      mockSignIn.mockReset();
      mockSignIn.mockResolvedValue(undefined);
    });

    it("calls signInWithEmailAndPassword with email and password", async () => {
      fillAndSubmit("login");
      await waitFor(() =>
        expect(mockSignIn).toHaveBeenCalledWith({}, "a@b.com", "secret123"),
      );
    });

    it("shows success message on successful login", async () => {
      fillAndSubmit("login");
      await waitFor(() =>
        expect(screen.getByText("You're logged in!")).toBeInTheDocument(),
      );
    });

    it("shows error message when Firebase throws", async () => {
      mockSignIn.mockRejectedValue({ code: "auth/invalid-credential" });
      fillAndSubmit("login");
      await waitFor(() =>
        expect(
          screen.getByText("Invalid email or password."),
        ).toBeInTheDocument(),
      );
    });

    it("disables the submit button while login is in flight", async () => {
      let resolveSignIn!: () => void;
      mockSignIn.mockReturnValue(
        new Promise((res) => {
          resolveSignIn = () => res(undefined);
        }),
      );
      render(<AuthForm mode="login" />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "secret123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();
      resolveSignIn();
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Log in" }),
        ).not.toBeDisabled(),
      );
    });

    it("does not call signInWithEmailAndPassword in signup mode", async () => {
      mockCreateUser.mockResolvedValue({ user: { uid: "uid-123" } });
      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue("doc-ref");
      fillAndSubmit("signup");
      await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe("Form submission — signup mode", () => {
    beforeEach(() => {
      mockCreateUser.mockResolvedValue({ user: { uid: "uid-123" } });
      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue("doc-ref");
    });

    it("calls createUserWithEmailAndPassword with email and password", async () => {
      fillAndSubmit("signup");
      await waitFor(() =>
        expect(mockCreateUser).toHaveBeenCalledWith({}, "a@b.com", "secret123"),
      );
    });

    it("calls updateProfile with the generated codename", async () => {
      fillAndSubmit("signup");
      await waitFor(() =>
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          { uid: "uid-123" },
          { displayName: "SilentFoxStrikes" },
        ),
      );
    });

    it("writes correct fields to Firestore (no email)", async () => {
      fillAndSubmit("signup");
      await waitFor(() =>
        expect(mockSetDoc).toHaveBeenCalledWith("doc-ref", {
          id: "uid-123",
          codename: "SilentFoxStrikes",
        }),
      );
      // ensure email is not in the written data
      const writtenData = mockSetDoc.mock.calls[0][1];
      expect(writtenData).not.toHaveProperty("email");
    });

    it("disables the submit button while the request is in flight", async () => {
      let resolveCreate!: () => void;
      mockCreateUser.mockReturnValue(
        new Promise((res) => {
          resolveCreate = () => res({ user: { uid: "uid-123" } });
        }),
      );
      render(<AuthForm mode="signup" />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "secret123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
      expect(screen.getByRole("button", { name: "Sign up" })).toBeDisabled();
      resolveCreate();
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Sign up" }),
        ).not.toBeDisabled(),
      );
    });

    it("shows an error message when Firebase throws", async () => {
      mockCreateUser.mockRejectedValue({ code: "auth/email-already-in-use" });
      fillAndSubmit("signup");
      await waitFor(() =>
        expect(
          screen.getByText("This email is already registered."),
        ).toBeInTheDocument(),
      );
    });

    it("shows a generic error for unknown error codes", async () => {
      mockCreateUser.mockRejectedValue({ code: "auth/unknown-error" });
      fillAndSubmit("signup");
      await waitFor(() =>
        expect(
          screen.getByText("Something went wrong. Please try again."),
        ).toBeInTheDocument(),
      );
    });

    it("redirects to /heists after successful signup", async () => {
      fillAndSubmit("signup");
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/heists"));
    });
  });
});
