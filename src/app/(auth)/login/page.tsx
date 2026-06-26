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
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Sign in to Orbit</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unverified account banner */}
          {unverifiedEmail && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4 space-y-2">
              <div className="flex items-start gap-3">
                <MailWarning className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Your account isn&apos;t verified yet
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    We sent a verification link to <strong>{unverifiedEmail}</strong>. Check your inbox (and spam folder) and click the link to activate your account.
                  </p>
                </div>
              </div>
              <div className="pl-8">
                <Link
                  href={`/verify-email/resend?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="text-xs font-medium text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-300"
                >
                  Didn&apos;t receive it? Resend verification email →
                </Link>
              </div>
            </div>
          )}

          {errors.email && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors.email[0]}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>
            <input id="password" name="password" type="password" placeholder="••••••••" required
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>

          <button type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
