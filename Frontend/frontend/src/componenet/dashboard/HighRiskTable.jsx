import { SeverityBadge, normalizeSeverity } from "./severity";

// userId may come back as a plain string or, if the backend populates it,
// an object with the farmer's name/village — this handles either shape.
function farmerLabel(userId) {
  if (!userId) return "Unknown farmer";
  if (typeof userId === "string") return userId.slice(-6);
  return userId.firstName
    ? `${userId.firstName} ${userId.lastName || ""}`.trim()
    : userId._id?.slice(-6) || "Unknown farmer";
}

export default function HighRiskTable({ analyses, onSelect }) {
  const cases = analyses
    .filter((a) => {
      const s = normalizeSeverity(a);
      return s === "High" || s === "Critical";
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (cases.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-10">
        No high-risk cases right now
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
            <th className="py-2 pr-4 font-medium">Farmer</th>
            <th className="py-2 pr-4 font-medium">Crop</th>
            <th className="py-2 pr-4 font-medium">Diagnosis</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">Location</th>
            <th className="py-2 pr-4 font-medium">Severity</th>
            <th className="py-2 pr-4 font-medium">Reported</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((a) => (
            <tr
              key={a._id}
              onClick={() => onSelect?.(a)}
              className="border-b border-slate-50 hover:bg-emerald-50/50 cursor-pointer transition-colors"
            >
              <td className="py-3 pr-4 font-medium text-slate-700">
                {farmerLabel(a.userId)}
              </td>
              <td className="py-3 pr-4 text-slate-600">{a.cropName}</td>
              <td className="py-3 pr-4 text-slate-600">
                {a.aianalysis?.summary?.primaryDiagnosis || "—"}
              </td>
              <td className="py-3 pr-4 text-slate-500">
                {a.aianalysis?.summary?.category || "—"}
              </td>
              <td className="py-3 pr-4 text-slate-500 max-w-[160px] truncate">
                {a.addLocation?.formattedAddress || "—"}
              </td>
              <td className="py-3 pr-4">
                <SeverityBadge severity={normalizeSeverity(a)} />
              </td>
              <td className="py-3 pr-4 text-slate-500">
                {new Date(a.createdAt).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}