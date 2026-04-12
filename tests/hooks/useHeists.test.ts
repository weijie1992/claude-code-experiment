import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHeists } from "@/hooks/useHeists";

// ── Firebase mocks ────────────────────────────────────────────
const mockUnsubscribe = vi.fn();
const mockOnSnapshot = vi.fn();
const mockQuery = vi.fn(() => "query-ref");
const mockWhere = vi.fn(() => "where-clause");
const mockTimestampNow = vi.fn(() => ({ toDate: () => new Date() }));

const mockWithConverter = vi.fn(() => "converted-ref");
const mockCollection = vi.fn(() => ({ withConverter: mockWithConverter }));

vi.mock("firebase/firestore", () => ({
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  Timestamp: { now: () => mockTimestampNow() },
  getFirestore: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("@/types/firestore", () => ({
  COLLECTIONS: { HEISTS: "heists", USERS: "users" },
  heistConverter: { toFirestore: vi.fn(), fromFirestore: vi.fn() },
}));

vi.mock("@/components/AuthProvider/AuthProvider", () => ({
  useUser: () => ({ user: { uid: "user-1" }, loading: false }),
}));

// ── Helpers ───────────────────────────────────────────────────
const fakeHeist = {
  id: "h1",
  title: "Steal the chair",
  description: "From the corner office.",
  createdBy: "user-1",
  createdByCodename: "SilentFox",
  assignedTo: "user-2",
  assignedToCodename: "PhantomWolf",
  deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
  finalStatus: null,
  createdAt: new Date(),
};

let capturedOnNext: (snapshot: unknown) => void;
let capturedOnError: (error: unknown) => void;

function setupSnapshot() {
  mockOnSnapshot.mockImplementation(
    (
      _q: unknown,
      onNext: (s: unknown) => void,
      onError: (e: unknown) => void,
    ) => {
      capturedOnNext = onNext;
      capturedOnError = onError;
      return mockUnsubscribe;
    },
  );
}

// ── Tests ─────────────────────────────────────────────────────
describe("useHeists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSnapshot();
  });

  describe("Initial state", () => {
    it("returns loading: true before snapshot fires", () => {
      const { result } = renderHook(() => useHeists("active"));
      expect(result.current.loading).toBe(true);
    });

    it("returns an empty heists array before snapshot fires", () => {
      const { result } = renderHook(() => useHeists("active"));
      expect(result.current.heists).toEqual([]);
    });

    it("returns error: null before any error occurs", () => {
      const { result } = renderHook(() => useHeists("active"));
      expect(result.current.error).toBeNull();
    });
  });

  describe("After snapshot fires", () => {
    it("sets loading to false after first snapshot", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnNext({ docs: [{ data: () => fakeHeist }] }));
      expect(result.current.loading).toBe(false);
    });

    it("returns mapped heist objects from snapshot docs", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnNext({ docs: [{ data: () => fakeHeist }] }));
      expect(result.current.heists).toEqual([fakeHeist]);
    });

    it("returns empty array when snapshot has no docs", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnNext({ docs: [] }));
      expect(result.current.heists).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("sets error message when snapshot errors", () => {
      const { result } = renderHook(() => useHeists("active"));
      act(() => capturedOnError(new Error("Permission denied")));
      expect(result.current.error).toBe("Failed to load heists.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Query mode — active", () => {
    it("queries where assignedTo equals current user uid", () => {
      renderHook(() => useHeists("active"));
      expect(mockWhere).toHaveBeenCalledWith("assignedTo", "==", "user-1");
    });

    it("queries where deadline is greater than now", () => {
      renderHook(() => useHeists("active"));
      const calls = mockWhere.mock.calls;
      expect(
        calls.some(([field, op]) => field === "deadline" && op === ">"),
      ).toBe(true);
    });
  });

  describe("Query mode — assigned", () => {
    it("queries where createdBy equals current user uid", () => {
      renderHook(() => useHeists("assigned"));
      expect(mockWhere).toHaveBeenCalledWith("createdBy", "==", "user-1");
    });

    it("queries where deadline is greater than now", () => {
      renderHook(() => useHeists("assigned"));
      const calls = mockWhere.mock.calls;
      expect(
        calls.some(([field, op]) => field === "deadline" && op === ">"),
      ).toBe(true);
    });
  });

  describe("Query mode — expired", () => {
    it("queries where deadline is less than now", () => {
      renderHook(() => useHeists("expired"));
      const calls = mockWhere.mock.calls;
      expect(
        calls.some(([field, op]) => field === "deadline" && op === "<"),
      ).toBe(true);
    });

    it("filters out heists with null finalStatus client-side", () => {
      const { result } = renderHook(() => useHeists("expired"));
      act(() =>
        capturedOnNext({
          docs: [
            { data: () => ({ ...fakeHeist, finalStatus: "success" }) },
            { data: () => ({ ...fakeHeist, id: "h2", finalStatus: null }) },
          ],
        }),
      );
      expect(result.current.heists).toHaveLength(1);
      expect(result.current.heists[0].finalStatus).toBe("success");
    });
  });

  describe("Cleanup", () => {
    it("calls the unsubscribe function on unmount", () => {
      const { unmount } = renderHook(() => useHeists("active"));
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });
  });
});
