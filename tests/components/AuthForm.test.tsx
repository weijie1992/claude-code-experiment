import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthForm from "@/components/AuthForm";

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
    beforeEach(() => {
      vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("does not log when both fields are empty", () => {
      render(<AuthForm mode="login" />);
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(console.log).not.toHaveBeenCalled();
    });

    it("does not log when only email is filled", () => {
      render(<AuthForm mode="login" />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "a@b.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(console.log).not.toHaveBeenCalled();
    });

    it("does not log when only password is filled", () => {
      render(<AuthForm mode="login" />);
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "secret" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("Form submission — success", () => {
    it("logs email and password when both fields are filled", () => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      render(<AuthForm mode="login" />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "secret" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      expect(console.log).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "secret",
      });
    });
  });
});
