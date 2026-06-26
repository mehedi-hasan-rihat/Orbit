import Link from "next/link";
import { XCircle, Clock, CheckCircle2 } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;

  // No error param means the user navigated here directly (no token in URL)
  // The actual verification happens via GET /api/auth/verify-email?token=...
  if (!error) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your email address. Click the link to activate your account.
          </p>
          <Link href="/login" className="text-sm text-muted-foreground hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = error === "expired";
  const isInvalid = error === "invalid" || error === "missing";

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        {isExpired ? (
          <Clock className="w-12 h-12 text-amber-500 mx-auto" />
        ) : (
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
        )}

        <h1 className="text-xl font-bold">
          {isExpired ? "Link expired" : "Verification failed"}
        </h1>

        <p className="text-sm text-muted-foreground">
          {isExpired
            ? "This verification link has expired. Request a new one below."
            : "This link is invalid or has already been used."}
        </p>

        <div className="flex flex-col gap-2">
          {isExpired && email ? (
            <Link
              href={`/verify-email/resend?email=${encodeURIComponent(email)}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Resend verification email
            </Link>
          ) : null}
          {isInvalid && (
            <Link
              href="/register"
              className="text-sm font-medium hover:underline"
            >
              Sign up again
            </Link>
          )}
          <Link href="/login" className="text-sm text-muted-foreground hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
