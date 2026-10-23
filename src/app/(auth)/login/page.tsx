"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/auth";
import Link from "next/link";
import { MailWarning } from "lucide-react";

export default function LoginPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setUnverifiedEmail(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginAction(formData);
      // loginAction redirects on success — if we get a result back it's always an error
      if (!result.ok) {
        if (result.code === "VALIDATION" && result.fields?.email?.[0]?.includes("verify")) {
          setUnverifiedEmail(formData.get("email") as string);
          return;
        }
        if (result.fields) setErrors(result.fields);
        else setErrors({ email: [result.message] });
      }
    } catch (err: unknown) {
      // Next.js redirect() throws internally — let it propagate, don't show error
      if (err && typeof err === "object" && "digest" in err) throw err;
      setErrors({ email: ["Something went wrong. Please try again."] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl">Sign in to Orbit</h1>
          <p className="text-[13px] text-muted-foreground">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unverified account banner */}
          {unverifiedEmail && (
            <div className="rounded-xl border border-[var(--color-status-pending-bg)] bg-[var(--color-status-pending-bg)] p-4 space-y-2">
              <div className="flex items-start gap-3">
                <MailWarning className="w-5 h-5 text-[var(--color-status-pending)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] text-[var(--color-status-pending)]">
                    Your account isn&apos;t verified yet
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    We sent a verification link to <strong>{unverifiedEmail}</strong>. Check your inbox (and spam folder) and click the link to activate your account.
                  </p>
                </div>
              </div>
              <div className="pl-8">
                <Link
                  href={`/verify-email/resend?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="text-[13px] text-[var(--color-status-pending)] underline underline-offset-2 hover:opacity-80"
                >
                  Didn&apos;t receive it? Resend verification email →
                </Link>
              </div>
            </div>
          )}

          {errors.email && (
            <div className="rounded-xl bg-[var(--color-status-rejected-bg)] p-3 text-[13px] text-[var(--color-status-rejected)]">{errors.email[0]}</div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-[13px] text-muted-foreground">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required
              className="flex h-9 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[13px] text-muted-foreground">Password</label>
              <Link href="/forgot-password" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>
            <input id="password" name="password" type="password" placeholder="••••••••" required
              className="flex h-9 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]" />
          </div>

          <button type="submit" disabled={loading}
            className="flex h-9 w-full items-center justify-center rounded-full bg-primary text-sm text-primary-foreground transition-colors hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
