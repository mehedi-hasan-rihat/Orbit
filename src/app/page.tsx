import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Orbit
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Track your career journey from application to offer. Manage
            applications, visualize your pipeline, and land your next role.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md border px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
          <div className="space-y-2 p-4 rounded-lg border">
            <h3 className="font-semibold">Track Applications</h3>
            <p className="text-sm text-muted-foreground">
              Keep all your job applications organized in one place with
              statuses, notes, and dates.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border">
            <h3 className="font-semibold">Kanban Board</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your pipeline with drag-and-drop columns from Wishlist
              to Offer.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border">
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              See your conversion rates, track progress, and identify patterns
              in your job search.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
