"use client";

import { useState } from "react";
import { registerAction } from "@/lib/actions/auth";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerAction(formData);
      if (!result.ok) {
        if (result.fields) setErrors(result.fields);
        else setErrors({ _form: [result.message] });
      } else if (result.ok) {
        setSentTo(result.data?.email ?? "");
      }
    } catch {
      setErrors({ _form: ["Something went wrong. Please try again."] });
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to <strong className="text-foreground">{sentTo}</strong>.
              Click it to activate your account.
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground space-y-1">
            <p>Didn't receive it? Check your spam folder.</p>
            <Link href={`/verify-email/resend?email=${encodeURIComponent(sentTo)}`} className="font-medium text-foreground hover:underline">
              Resend verification email
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start tracking your job applications with Orbit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(errors.email || errors.name || errors.password) && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {(errors.name?.[0] || errors.email?.[0] || errors.password?.[0])}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input id="name" name="name" type="text" placeholder="Your name" required
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required minLength={8}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
          </div>

          <button type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
