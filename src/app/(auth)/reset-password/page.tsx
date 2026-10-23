"use client";

import { Suspense, useState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("token", token);
      const result = await resetPasswordAction(formData);
      // success redirects to /dashboard — result only comes back on error
      if (result && !result.ok) {
        if (result.fields) setError(Object.values(result.fields).flat()[0] ?? result.message);
        else setError(result.message);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "digest" in err) throw err;
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-[440px] text-center space-y-4">
          <h1 className="text-xl">Invalid reset link</h1>
          <p className="text-[13px] text-muted-foreground">This link is missing a token.</p>
          <Link href="/forgot-password" className="text-[13px] text-foreground hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl">Set new password</h1>
          <p className="text-[13px] text-muted-foreground">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-[var(--color-status-rejected-bg)] p-3 text-[13px] text-[var(--color-status-rejected)]">{error}</div>
          )}
          <div className="space-y-1">
            <label htmlFor="password" className="text-[13px] text-muted-foreground">New password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required minLength={8}
              className="flex h-9 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]" />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirm" className="text-[13px] text-muted-foreground">Confirm password</label>
            <input id="confirm" name="confirm" type="password" placeholder="••••••••" required minLength={8}
              className="flex h-9 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]" />
          </div>
          <button type="submit" disabled={loading}
            className="flex h-9 w-full items-center justify-center rounded-full bg-primary text-sm text-primary-foreground transition-colors hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
