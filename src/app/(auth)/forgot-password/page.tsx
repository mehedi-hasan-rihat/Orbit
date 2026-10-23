"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await forgotPasswordAction(formData);
      if (!result.ok) setError(result.message);
      else setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-[440px] text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[var(--color-status-approved)] mx-auto" />
          <h1 className="text-xl">Check your inbox</h1>
          <p className="text-[13px] text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a password reset link. It expires in 1 hour.
          </p>
          <Link href="/login" className="text-[13px] text-foreground hover:underline">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
              <Mail className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <h1 className="text-2xl">Forgot password?</h1>
          <p className="text-[13px] text-muted-foreground">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-[var(--color-status-rejected-bg)] p-3 text-[13px] text-[var(--color-status-rejected)]">{error}</div>
          )}
          <div className="space-y-1">
            <label htmlFor="email" className="text-[13px] text-muted-foreground">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required
              className="flex h-9 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]" />
          </div>
          <button type="submit" disabled={loading}
            className="flex h-9 w-full items-center justify-center rounded-full bg-primary text-sm text-primary-foreground transition-colors hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          <Link href="/login" className="text-foreground hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
