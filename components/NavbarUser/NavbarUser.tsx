"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useUser } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import { auth } from "@/lib/firebase";
import styles from "./NavbarUser.module.css";

export default function NavbarUser() {
  const { user, loading } = useUser();
  const [signingOut, setSigningOut] = useState(false);

  if (loading || !user) return null;

  const name = user.displayName ?? user.email ?? "User";

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut(auth);
    } catch {
      // sign-out errors are silent
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className={styles.userItem}>
      <Avatar name={name} />
      <button
        className={styles.logoutBtn}
        onClick={handleLogout}
        disabled={signingOut}
        aria-label="Log out"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
}
