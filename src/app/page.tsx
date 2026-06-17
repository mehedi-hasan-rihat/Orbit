import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold">Orbit</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-8 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Free to use · No credit card required
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Track every step of your<br className="hidden sm:block" /> job search
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Orbit keeps all your applications organized — from the first wishlist to a signed offer. Stop losing track in spreadsheets.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start Tracking Free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md border px-6 text-sm font-medium hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold">Everything you need to run your job search</h2>
            <p className="text-muted-foreground">
              Built around the real workflow of finding, applying, and landing a job.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="border rounded-lg p-5 space-y-2">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold">How it works</h2>
            <p className="text-muted-foreground">
              Simple by design. Powerful when you need it.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="space-y-1 pt-0.5">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20 px-6">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">Ready to get organized?</h2>
          <p className="text-muted-foreground">
            Create a free account and start tracking your applications in under a minute.
          </p>
          <Link
            href="/register"
            className="inline-flex h-10 items-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Orbit</span>
            <span>· Job Application Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://mehedi-hasan-rihat.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Built by Mehedi
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📋",
    title: "Application Tracking",
    description: "Log every job application with company, role, URL, dates, and notes all in one place.",
  },
  {
    icon: "📊",
    title: "Kanban Pipeline",
    description: "Drag and drop applications across Wishlist, Applied, Interview, Offer, and Rejected columns.",
  },
  {
    icon: "📈",
    title: "Analytics",
    description: "See your interview rate, offer rate, and application volume at a glance with clear charts.",
  },
  {
    icon: "📅",
    title: "Follow-up Reminders",
    description: "Set follow-up dates and get notified when they're overdue so nothing slips through.",
  },
  {
    icon: "🏷️",
    title: "Tags",
    description: "Label applications as Remote, Referral, High Priority, Startup, and more. Filter instantly.",
  },
  {
    icon: "🏢",
    title: "Company Profiles",
    description: "See all applications per company with interview and offer rates to spot patterns.",
  },
  {
    icon: "📦",
    title: "Archive",
    description: "Archive old applications to keep your active list clean without losing history.",
  },
  {
    icon: "📤",
    title: "CSV Export",
    description: "Download all your application data as a CSV anytime. Your data, always accessible.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description: "Each account is fully isolated. Only you can see your applications.",
  },
];

const steps = [
  {
    title: "Create a free account",
    description: "Sign up in seconds with just your name, email, and password. No credit card needed.",
  },
  {
    title: "Add your applications",
    description: "Log jobs you've applied to, plan to apply, or are interviewing for. Add notes, dates, and tags as you go.",
  },
  {
    title: "Move them through the pipeline",
    description: "Drag cards on the Kanban board or use quick actions to update status as things progress.",
  },
  {
    title: "Track follow-ups and stay on top",
    description: "Set follow-up dates, check your analytics, and see which companies and strategies work best for you.",
  },
];
