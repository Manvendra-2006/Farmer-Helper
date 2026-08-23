// Requires: npm install recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BAR_COLORS = [
  "#059669", // emerald-600
  "#0ea5e9", // sky-500
  "#f97316", // orange-500
  "#a855f7", // purple-500
  "#dc2626", // red-600
  "#eab308", // yellow-500
];

// Groups analyses by aianalysis.summary.category (e.g. "Fungal Disease",
// "Viral Disease", "Insect/Pest Damage", "Healthy Plant")
export default function CategoryBarChart({ analyses }) {
  const counts = analyses.reduce((acc, a) => {
    const category = a.aianalysis?.summary?.category || "Unclassified";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-16">
        No analyses yet to chart
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="category"
          width={140}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar dataKey="count" name="Cases" radius={[0, 6, 6, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.category} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}