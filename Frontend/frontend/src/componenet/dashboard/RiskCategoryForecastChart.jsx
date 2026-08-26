// Requires: npm install recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LEVEL_SCORE = { High: 3, Moderate: 2, Low: 1 };

function buildDailyRiskGrid(points) {
  const buckets = {};
  points.forEach((p) => {
    const key = p.dateTime.slice(0, 10);
    const label = new Date(p.dateTime).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    if (!buckets[key]) {
      buckets[key] = {
        label,
        fungal: [],
        insect: [],
        heat: [],
        water: [],
      };
    }
    buckets[key].fungal.push(LEVEL_SCORE[p.riskLevel] || 1);
    buckets[key].insect.push(LEVEL_SCORE[p.insectRiskLevel] || 1);
    buckets[key].heat.push(LEVEL_SCORE[p.heatStressLevel] || 1);
    buckets[key].water.push(LEVEL_SCORE[p.waterStressLevel] || 1);
  });

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return Object.values(buckets).map((b) => ({
    day: b.label,
    Fungal: Number(avg(b.fungal).toFixed(1)),
    "Viral/Pest": Number(avg(b.insect).toFixed(1)),
    Heat: Number(avg(b.heat).toFixed(1)),
    Water: Number(avg(b.water).toFixed(1)),
  }));
}

export default function RiskCategoryForecastChart({ points }) {
  const data = buildDailyRiskGrid(points || []);

  if (data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">Forecast unavailable</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Fungal" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Viral/Pest" fill="#a855f7" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Heat" fill="#f97316" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Water" fill="#14b8a6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}