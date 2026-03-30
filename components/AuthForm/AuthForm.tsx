"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateCodename } from "@/lib/codename";
import styles from "./AuthForm.module.css";

interface AuthFormProps {
  mode: "login" | "signup";
}

const config = {
  login: {
    submitLabel: "Log in",
    footerText: "Don\u2019t have an account?",
    footerLinkText: "Sign up",
    footerHref: "/signup",
    autoComplete: "current-password",
  },
  signup: {
    submitLabel: "Sign up",
    footerText: "Already have an account?",
    footerLinkText: "Log in",
    footerHref: "/login",
    autoComplete: "new-password",
  },
} as const;

const errorMessages: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/weak-password": "Password must be at least 6 characters.",
};

function getErrorMessage(code: string): string {
  return errorMessages[code] ?? "Something went wrong. Please try again.";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { submitLabel, footerText, footerLinkText, footerHref, autoComplete } =
    config[mode];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === "login") {
      console.log({ email, password });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const codename = generateCodename();
      await updateProfile(user, { displayName: codename });
      await setDoc(doc(db, "users", user.uid), { id: user.uid, codename });
      router.push("/heists");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(getErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={styles.input}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={styles.input}
              autoComplete={autoComplete}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={`btn ${styles.submit}`}
          disabled={loading}
        >
          {submitLabel}
        </button>
      </form>

      <p className={styles.footer}>
        {footerText} <Link href={footerHref}>{footerLinkText}</Link>
      </p>
    </div>
  );
}
