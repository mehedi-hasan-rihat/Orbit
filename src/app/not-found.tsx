import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center text-center max-w-sm gap-6">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl select-none">
          🔭
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">404</h1>
          <p className="text-base font-medium">Page not found</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-5 rounded-md border text-sm font-medium hover:bg-accent transition-colors"
          >
            Home
          </Link>
        </div>

      </div>
    </div>
  );
}
