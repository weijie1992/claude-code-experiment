"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import { COLLECTIONS } from "@/types/firestore";
import type { UserDoc, CreateHeistInput } from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

export default function CreateHeistForm() {
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        if (isMounted)
          setUsers(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as UserDoc,
            ),
          );
      } catch {
        if (isMounted) setError("Failed to load agents.");
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    }
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !assignedTo || !user) return;

    const assignedUser = users.find((u) => u.id === assignedTo);
    if (!assignedUser) return;

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);

    const input: CreateHeistInput = {
      title,
      description,
      createdBy: user.uid,
      createdByCodename: user.displayName ?? "",
      assignedTo,
      assignedToCodename: assignedUser.codename,
      deadline,
      finalStatus: null,
      createdAt: serverTimestamp(),
    };

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, COLLECTIONS.HEISTS), input);
      router.replace("/heists");
    } catch {
      setError("Failed to create heist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>New Heist</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="assignedTo">
            Assign to
          </label>
          {loadingUsers ? (
            <p className={styles.loading}>Loading agents...</p>
          ) : (
            <select
              id="assignedTo"
              className={styles.input}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Select an agent</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.codename}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={`btn ${styles.submit}`}
          disabled={submitting || loadingUsers}
        >
          {submitting ? "Creating..." : "Create Heist"}
        </button>
      </form>
    </div>
  );
}
