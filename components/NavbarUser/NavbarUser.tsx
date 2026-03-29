"use client";

import { useUser } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";

export default function NavbarUser() {
  const { user, loading } = useUser();

  if (loading || !user) return null;

  const name = user.displayName ?? user.email ?? "User";

  return <Avatar name={name} />;
}
