"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
