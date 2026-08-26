// Requires: npm install recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RISK_COLORS = { High: "#dc2626", Moderate: "#eab308", Low: "#22c55e" };

// Groups the 3-hour forecast points into daily averages so the officer can
// see "kis din risk sabse zyada hoga" at a glance.
function buildDailyRisk(points) {
  const buckets = {};
  points.forEach((p) => {
    const key = p.dateTime.slice(0, 10);
    const label = new Date(p.dateTime).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    if (!buckets[key]) buckets[key] = { key, label, scoreSum: 0, count: 0 };
    buckets[key].scoreSum += p.riskScore;
    buckets[key].count += 1;
  });

  return Object.values(buckets).map((b) => {
    const avgScore = b.scoreSum / b.count;
    let level = "Low";
    if (avgScore >= 5) level = "High";
    else if (avgScore >= 3) level = "Moderate";
    return { day: b.label, riskScore: Number(avgScore.toFixed(1)), level };
  });
}

export default function WeatherRiskForecastBar({ points }) {
  const data = buildDailyRisk(points || []);

  if (data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">Forecast unavailable</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} domain={[0, 7]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="riskScore" name="Fungal risk score" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.day} fill={RISK_COLORS[d.level]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}