import clsx from "clsx";

const statusConfig: Record<string, { label: string; className: string }> = {
  WISHLIST: {
    label: "Wishlist",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  APPLIED: {
    label: "Applied",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  INTERVIEW: {
    label: "Interview",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  OFFER: {
    label: "Offer",
    className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.WISHLIST;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
