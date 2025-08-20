"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./loginForm.module.css";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const username = form.get("username");
      const password = form.get("password");

      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      setLoading(false);

      if (res?.error) {
        setError(res.error || "Invalid credentials");
        return;
      }

      // Ensure session is updated before redirect
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-live="polite">
      <h1>Login</h1>
      <input type="text" placeholder="username" name="username" required />
      <input type="password" placeholder="password" name="password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
}
