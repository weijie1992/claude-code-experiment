"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import LoadingScreen from "@/components/LoadingScreen";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/heists");
    }
  }, [user, loading, router]);

  if (loading || user) return <LoadingScreen />;

  return <main className="public">{children}</main>;
}
