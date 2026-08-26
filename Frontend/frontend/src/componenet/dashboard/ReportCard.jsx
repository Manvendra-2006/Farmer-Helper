import { MapPin, Calendar } from "lucide-react";
import { SeverityBadge, normalizeSeverity } from "./severity";
import { StatusBadge } from "./status";

export default function ReportCard({ analysis, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all"
    >
      {analysis.photoURL && (
        <img
          src={analysis.photoURL}
          alt={analysis.cropName}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-800">{analysis.cropName}</h3>
          <SeverityBadge severity={normalizeSeverity(analysis)} />
        </div>
        <p className="text-xs text-slate-500 mb-2">
          {analysis.aianalysis?.summary?.primaryDiagnosis || "—"}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(analysis.createdAt).toLocaleDateString("en-IN")}
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {analysis.addLocation?.formattedAddress?.split(",")[0] || "—"}
          </span>
        </div>
        <StatusBadge status={analysis.status} />
      </div>
    </button>
  );
}