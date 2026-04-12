import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeistCard, { getDeadlineLabel } from "@/components/HeistCard/HeistCard";
import type { Heist } from "@/types/firestore";

const baseHeist: Heist = {
  id: "heist-1",
  title: "Leave a mysterious sticky note on the desk",
  description: "A sneaky mission",
  createdBy: "user-1",
  createdByCodename: "NightOwl",
  assignedTo: "user-2",
  assignedToCodename: "SecretSauceAgent",
  deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
  finalStatus: null,
  createdAt: new Date(),
};

describe("HeistCard", () => {
  it("renders the heist title", () => {
    render(<HeistCard heist={baseHeist} />);
    expect(screen.getByText(baseHeist.title)).toBeInTheDocument();
  });

  it("links the title to the heist detail page", () => {
    render(<HeistCard heist={baseHeist} />);
    const link = screen.getByRole("link", { name: baseHeist.title });
    expect(link).toHaveAttribute("href", "/heists/heist-1");
  });

  it("renders the assignee codename with @ prefix", () => {
    render(<HeistCard heist={baseHeist} />);
    expect(screen.getByText("@SecretSauceAgent")).toBeInTheDocument();
  });

  it("renders the creator codename with @ prefix", () => {
    render(<HeistCard heist={baseHeist} />);
    expect(screen.getByText("@NightOwl")).toBeInTheDocument();
  });

  it('shows "Overdue" when the deadline has passed', () => {
    const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);
    render(<HeistCard heist={{ ...baseHeist, deadline: pastDeadline }} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("shows time remaining when deadline is in the future", () => {
    render(<HeistCard heist={baseHeist} />);
    expect(screen.getByText(/\d+h \d+m/)).toBeInTheDocument();
  });
});

describe("getDeadlineLabel", () => {
  it('returns "Overdue" for a past deadline', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    expect(getDeadlineLabel(past).status).toBe("Overdue");
  });

  it("returns a time string for a future deadline within a day", () => {
    const future = new Date(Date.now() + 3 * 60 * 60 * 1000);
    expect(getDeadlineLabel(future).status).toMatch(/\d+h \d+m/);
  });

  it("returns a day string for a deadline more than a day away", () => {
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    expect(getDeadlineLabel(future).status).toMatch(/\d+d \d+h/);
  });
});
