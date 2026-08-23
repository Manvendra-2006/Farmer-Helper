// Normalizes whatever severity/condition string the AI analysis returned
// into one of four buckets so colors stay consistent across the map,
// charts and table. Order matters — checked most-severe-first so strings
// like "Moderate to Severe" land in the right bucket.
export function normalizeSeverity(analysis) {
  const raw =
    analysis?.aianalysis?.cropHealth?.severity ||
    analysis?.aianalysis?.cropHealth?.overallCondition ||
    "Unknown";
  const value = String(raw).toLowerCase();

  if (value.includes("critical")) return "Critical";
  if (
    value.includes("severe") ||
    value.includes("high") ||
    value.includes("unhealthy") ||
    value.includes("poor")
  )
    return "High";
  if (value.includes("moderate")) return "Moderate";
  if (
    value.includes("mild") ||
    value.includes("low") ||
    value.includes("healthy") ||
    value === "none"
  )
    return "Healthy";
  return "Unknown";
}

export const SEVERITY_COLORS = {
  Critical: "#dc2626", // red-600
  High: "#f97316", // orange-500
  Moderate: "#eab308", // yellow-500
  Healthy: "#22c55e", // green-500
  Unknown: "#94a3b8", // slate-400
};

export const SEVERITY_BADGE_CLASSES = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Moderate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unknown: "bg-slate-50 text-slate-600 border-slate-200",
};

export function SeverityBadge({ severity }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
        SEVERITY_BADGE_CLASSES[severity] || SEVERITY_BADGE_CLASSES.Unknown
      }`}
    >
      {severity}
    </span>
  );
}