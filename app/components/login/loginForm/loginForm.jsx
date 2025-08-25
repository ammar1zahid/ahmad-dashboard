"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./loginForm.module.css";

const ERROR_MESSAGES = {
  CredentialsSignin: "Incorrect username or password. Please try again.",
  OAuthSignin: "Sign-in failed. Try a different provider or try again later.",
  OAuthCallback: "Sign-in failed during callback. Try again.",
  OAuthCreateAccount: "Could not create account. Contact support.",
  EmailCreateAccount: "Could not create account with email.",
  Callback: "Authentication callback failed. Try again.",
  OAuthAccountNotLinked: "This account is not linked. Use the original provider to sign in.",
  SessionRequired: "You must sign in to access that page.",
  default: "Something went wrong. Please try again.",
};

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const getFriendlyError = (errCode, status) => {
    if (!errCode && status >= 500) return "Server error — please try again later.";
    return ERROR_MESSAGES[errCode] || errCode || ERROR_MESSAGES.default;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const username = form.get("username");
      const password = form.get("password");

      const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL || "";

      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      console.log("signIn result:", res);
      setLoading(false);

      if (res?.error) {
        setError(getFriendlyError(res.error, res.status));
        return;
      }

      if (!res?.ok) {
        setError(getFriendlyError(null, res?.status));
        return;
      }

      const callbackUrl = new URL("/dashboard", origin).toString();
      router.replace(callbackUrl);
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError("Network error — please check your connection and try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>AT</div>
          </div>
          <h1 className={styles.title}>Ahmad Traders</h1>
          <p className={styles.subtitle}>Welcome back! Please sign in to your account</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className={styles.form} aria-live="polite">
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input 
                id="username"
                type="text" 
                placeholder="Enter your username" 
                name="username" 
                className={styles.input}
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password" 
                name="password" 
                className={styles.input}
                required 
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className={styles.error}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading && (
              <div className={styles.spinner}></div>
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Secure login powered by Ahmad Traders
          </p>
        </div>
      </div>
    </div>
  );
}