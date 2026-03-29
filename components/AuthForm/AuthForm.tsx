"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { submitLabel, footerText, footerLinkText, footerHref, autoComplete } =
    config[mode];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    console.log({ email, password });
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

        <button type="submit" className={`btn ${styles.submit}`}>
          {submitLabel}
        </button>
      </form>

      <p className={styles.footer}>
        {footerText} <Link href={footerHref}>{footerLinkText}</Link>
      </p>
    </div>
  );
}
