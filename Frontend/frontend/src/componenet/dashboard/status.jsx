export const STATUSES = [
  "Pending Review",
  "Verified",
  "False Positive",
  "Action Taken",
  "Resolved",
];

// What an officer can move a case to FROM its current status —
// keeps the workflow linear but allows reopening a closed case.
export const STATUS_FLOW = {
  "Pending Review": ["Verified", "False Positive"],
  Verified: ["Action Taken", "False Positive"],
  "Action Taken": ["Resolved"],
  "False Positive": ["Pending Review"],
  Resolved: ["Pending Review"],
};

export const STATUS_BADGE_CLASSES = {
  "Pending Review": "bg-slate-50 text-slate-600 border-slate-200",
  Verified: "bg-sky-50 text-sky-700 border-sky-200",
  "False Positive": "bg-slate-100 text-slate-400 border-slate-300",
  "Action Taken": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }) {
  const value = status || "Pending Review";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
        STATUS_BADGE_CLASSES[value] || STATUS_BADGE_CLASSES["Pending Review"]
      }`}
    >
      {value}
    </span>
  );
}