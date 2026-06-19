export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clipboard body */}
      <rect x="6" y="5" width="20" height="24" rx="3" stroke="url(#logo-grad)" strokeWidth="2" />
      {/* Clipboard clip */}
      <rect x="11" y="2" width="10" height="5" rx="2" stroke="url(#logo-grad)" strokeWidth="1.5" fill="none" />
      {/* Checkmark line 1 */}
      <path d="M10 15L14 19L22 11" stroke="url(#logo-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Progress line */}
      <rect x="10" y="23" width="12" height="2" rx="1" fill="url(#logo-grad)" opacity="0.4" />
      <defs>
        <linearGradient id="logo-grad" x1="6" y1="2" x2="26" y2="29">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
