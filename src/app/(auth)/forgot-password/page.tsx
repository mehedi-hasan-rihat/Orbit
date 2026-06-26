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
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold">Check your inbox</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a password reset link. It expires in 1 hour.
          </p>
          <Link href="/login" className="text-sm font-medium hover:underline">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>
          <button type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
