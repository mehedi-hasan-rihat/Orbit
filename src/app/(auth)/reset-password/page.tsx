"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("token", token);
      const result = await resetPasswordAction(formData);
      // If we get a result back it's an error — success redirects to /dashboard
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
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">Invalid reset link</h1>
          <Link href="/forgot-password" className="text-sm font-medium hover:underline">Request a new one</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold">Password updated</h1>
          <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
          <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">New password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required minLength={8}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
            <input id="confirm" name="confirm" type="password" placeholder="••••••••" required minLength={8}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>
          <button type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
