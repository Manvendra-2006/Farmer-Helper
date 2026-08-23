// Requires: npm install recharts
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";
import { normalizeSeverity } from "./severity";

// Groups analyses by calendar day so the officer can see exactly how many
// reports (and how severe) came in on any given date.
function buildDailySeries(analyses) {
  const buckets = {};

  analyses.forEach((a) => {
    const date = new Date(a.createdAt);
    const key = date.toLocaleDateString("en-CA"); // yyyy-mm-dd, stable sort key
    const label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

    if (!buckets[key]) {
      buckets[key] = {
        key,
        day: label,
        sortKey: date,
        total: 0,
        healthy: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        highRisk: 0,
      };
    }
    buckets[key].total += 1;

    const severity = normalizeSeverity(a);
    if (severity === "Critical") buckets[key].critical += 1;
    else if (severity === "High") buckets[key].high += 1;
    else if (severity === "Moderate") buckets[key].moderate += 1;
    else if (severity === "Healthy") buckets[key].healthy += 1;

    buckets[key].highRisk = buckets[key].critical + buckets[key].high;
  });

  return Object.values(buckets).sort((a, b) => a.sortKey - b.sortKey);
}

function DayBreakdownModal({ day, onClose }) {
  if (!day) return null;
  const rows = [
    { label: "Total reports", value: day.total, color: "text-slate-800" },
    { label: "Healthy", value: day.healthy, color: "text-emerald-600" },
    { label: "Moderate", value: day.moderate, color: "text-amber-600" },
    { label: "High risk (High + Critical)", value: day.highRisk, color: "text-red-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{day.day}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{r.label}</span>
              <span className={`text-lg font-bold ${r.color}`}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiseaseTrendChart({ analyses }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const data = buildDailySeries(analyses);

  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-16">
        No analyses yet to chart
      </p>
    );
  }

  const handleChartClick = (e) => {
    if (!e || !e.activeLabel) return;
    const day = data.find((d) => d.day === e.activeLabel);
    if (day) setSelectedDay(day);
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} onClick={handleChartClick} style={{ cursor: "pointer" }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total cases"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 4, cursor: "pointer" }}
            activeDot={{ r: 6, cursor: "pointer" }}
          />
          <Line
            type="monotone"
            dataKey="highRisk"
            name="High risk"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ r: 4, cursor: "pointer" }}
            activeDot={{ r: 6, cursor: "pointer" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <DayBreakdownModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </>
  );
}