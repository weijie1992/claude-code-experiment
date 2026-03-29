import type { Metadata } from "next";
import "@/app/globals.css";
import ThemeScript from "@/components/ThemeScript";
import ThemeToggle from "@/components/ThemeToggle";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Pocket Heist",
  description: "Tiny missions. Big office mischief.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AuthProvider>
          {children}
          <ThemeToggle />
        </AuthProvider>
      </body>
    </html>
  );
}
