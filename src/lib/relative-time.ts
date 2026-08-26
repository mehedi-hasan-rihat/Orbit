// Human "how long ago / how far off" labels.
//
// Every caller passes an explicit `now`. The detail page is server-rendered but
// the tracker below it hydrates, so a `Date.now()` read inside the client would
// disagree with the HTML the server produced. Threading one `now` through both
// keeps the two renders byte-identical.

const DAY_MS = 86_400_000;

// The reference point for a server render.
//
// A Server Component runs once per request, so reading the clock here is
// deterministic for the render it belongs to — but `Date.now()` written inline
// in a component body is flagged by react-hooks/purity, which can't tell the
// two cases apart. Taking it through a function keeps the intent explicit and
// gives client components a single value to be handed instead of reading the
// clock themselves during hydration.
export function renderTimestamp(): number {
  return Date.now();
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// Whole calendar days apart, so an interview eighteen hours out still reads
// "tomorrow" rather than "in 0 days".
export function dayDiff(target: Date | string, now: Date | number): number {
  const t = new Date(target);
  const n = new Date(now);
  const a = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const b = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((a - b) / DAY_MS);
}

export function relativeDay(target: Date | string, now: Date | number): string {
  const diff = dayDiff(target, now);

  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";

  if (diff > 0) {
    if (diff < 7) return `in ${plural(diff, "day")}`;
    if (diff < 30) return `in ${plural(Math.round(diff / 7), "week")}`;
    if (diff < 365) return `in ${plural(Math.round(diff / 30), "month")}`;
    return `in ${plural(Math.round(diff / 365), "year")}`;
  }

  const ago = -diff;
  if (ago < 7) return `${plural(ago, "day")} ago`;
  if (ago < 30) return `${plural(Math.round(ago / 7), "week")} ago`;
  if (ago < 365) return `${plural(Math.round(ago / 30), "month")} ago`;
  return `${plural(Math.round(ago / 365), "year")} ago`;
}
