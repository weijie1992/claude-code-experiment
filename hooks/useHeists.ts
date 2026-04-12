import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import { COLLECTIONS, heistConverter } from "@/types/firestore";
import type { Heist } from "@/types/firestore";

export type HeistMode = "active" | "assigned" | "expired";

interface UseHeistsResult {
  heists: Heist[];
  loading: boolean;
  error: string | null;
}

export function useHeists(mode: HeistMode): UseHeistsResult {
  const { user } = useUser();
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const now = Timestamp.now();
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );

    const q =
      mode === "active"
        ? query(
            heistsRef,
            where("assignedTo", "==", user.uid),
            where("deadline", ">", now),
          )
        : mode === "assigned"
          ? query(
              heistsRef,
              where("createdBy", "==", user.uid),
              where("deadline", ">", now),
            )
          : query(heistsRef, where("deadline", "<", now));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => doc.data() as Heist);
        // Firestore doesn't allow two inequality fields in one query,
        // so filter finalStatus !== null client-side for the expired mode.
        setHeists(
          mode === "expired"
            ? docs.filter((h) => h.finalStatus !== null)
            : docs,
        );
        setLoading(false);
      },
      () => {
        setError("Failed to load heists.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [mode, user]);

  return { heists, loading, error };
}
