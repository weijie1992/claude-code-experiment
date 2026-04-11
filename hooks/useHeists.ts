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
          : query(
              heistsRef,
              where("deadline", "<", now),
              where("finalStatus", "!=", null),
            );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setHeists(snapshot.docs.map((doc) => doc.data() as Heist));
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
