import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateHeistForm from "@/components/CreateHeistForm";

// ── Firebase mocks ──────────────────────────────────────────
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockCollection = vi.fn();
const mockServerTimestamp = vi.fn(() => "SERVER_TIMESTAMP");

vi.mock("firebase/firestore", () => ({
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  serverTimestamp: () => mockServerTimestamp(),
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@/components/AuthProvider/AuthProvider", () => ({
  useUser: () => ({
    user: { uid: "user-1", displayName: "SilentFoxStrikes" },
    loading: false,
  }),
}));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// ── Helpers ─────────────────────────────────────────────────
const fakeUsers = [
  { id: "user-2", data: () => ({ id: "user-2", codename: "PhantomWolf" }) },
  { id: "user-3", data: () => ({ id: "user-3", codename: "CraftyCipher" }) },
];

function setupUsers() {
  mockGetDocs.mockResolvedValue({ docs: fakeUsers });
  mockCollection.mockReturnValue("col-ref");
}

async function renderAndWait() {
  render(<CreateHeistForm />);
  await waitFor(() =>
    expect(screen.queryByText("Loading agents...")).not.toBeInTheDocument(),
  );
}

async function fillAndSubmit() {
  await renderAndWait();
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Steal the chair" },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { value: "Take it from the corner office." },
  });
  fireEvent.change(screen.getByLabelText("Assign to"), {
    target: { value: "user-2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
}

// ── Tests ────────────────────────────────────────────────────
describe("CreateHeistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupUsers();
  });

  describe("Rendering", () => {
    it("renders the title input", async () => {
      await renderAndWait();
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    it("renders the description textarea", async () => {
      await renderAndWait();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    it("shows a loading message while fetching users", () => {
      mockGetDocs.mockReturnValue(new Promise(() => {}));
      mockCollection.mockReturnValue("col-ref");
      render(<CreateHeistForm />);
      expect(screen.getByText("Loading agents...")).toBeInTheDocument();
    });

    it("populates the assignee dropdown with user codenames", async () => {
      await renderAndWait();
      expect(
        screen.getByRole("option", { name: "PhantomWolf" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "CraftyCipher" }),
      ).toBeInTheDocument();
    });

    it("renders a submit button", async () => {
      await renderAndWait();
      expect(
        screen.getByRole("button", { name: "Create Heist" }),
      ).toBeInTheDocument();
    });
  });

  describe("Validation — does not submit when fields are missing", () => {
    it("does not call addDoc when title is empty", async () => {
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "desc" },
      });
      fireEvent.change(screen.getByLabelText("Assign to"), {
        target: { value: "user-2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it("does not call addDoc when description is empty", async () => {
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "title" },
      });
      fireEvent.change(screen.getByLabelText("Assign to"), {
        target: { value: "user-2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it("does not call addDoc when no assignee is selected", async () => {
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "title" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "desc" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe("Submission", () => {
    beforeEach(() => {
      mockAddDoc.mockResolvedValue({ id: "new-heist-id" });
    });

    it("calls addDoc with the correct heist data", async () => {
      await fillAndSubmit();
      await waitFor(() => expect(mockAddDoc).toHaveBeenCalledOnce());
      const [, input] = mockAddDoc.mock.calls[0];
      expect(input).toMatchObject({
        title: "Steal the chair",
        description: "Take it from the corner office.",
        createdBy: "user-1",
        createdByCodename: "SilentFoxStrikes",
        assignedTo: "user-2",
        assignedToCodename: "PhantomWolf",
        finalStatus: null,
        createdAt: "SERVER_TIMESTAMP",
      });
    });

    it("sets deadline approximately 48 hours from now", async () => {
      await fillAndSubmit();
      await waitFor(() => expect(mockAddDoc).toHaveBeenCalledOnce());
      const [, input] = mockAddDoc.mock.calls[0];
      const expectedDeadline = Date.now() + 48 * 60 * 60 * 1000;
      expect(
        Math.abs((input.deadline as Date).getTime() - expectedDeadline),
      ).toBeLessThan(2000);
    });

    it("redirects to /heists on success", async () => {
      await fillAndSubmit();
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/heists"));
    });

    it("shows an error message when addDoc fails", async () => {
      mockAddDoc.mockRejectedValue(new Error("Firestore error"));
      await fillAndSubmit();
      await waitFor(() =>
        expect(
          screen.getByText("Failed to create heist. Please try again."),
        ).toBeInTheDocument(),
      );
    });

    it("disables the submit button while submission is in progress", async () => {
      let resolve!: () => void;
      mockAddDoc.mockReturnValue(
        new Promise((res) => {
          resolve = () => res(undefined);
        }),
      );
      await renderAndWait();
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "title" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "desc" },
      });
      fireEvent.change(screen.getByLabelText("Assign to"), {
        target: { value: "user-2" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create Heist" }));
      expect(
        screen.getByRole("button", { name: "Creating..." }),
      ).toBeDisabled();
      resolve();
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Creating..." }),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
