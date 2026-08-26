// Requires: npm install recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Builds one continuous series: logged past days (real, DB-stored) followed
// by daily-averaged forecast (future, from the API) — so past and future
// sit on the same timeline. History will be sparse until logs accumulate.
export default function WeatherRiskTimeline({ history, forecastPoints }) {
  const pastData = (history || []).map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    past: h.riskScore,
    sortKey: new Date(h.date),
  }));

  const dailyForecast = {};
  (forecastPoints || []).forEach((p) => {
    const key = p.dateTime.slice(0, 10);
    if (!dailyForecast[key]) dailyForecast[key] = { sum: 0, count: 0, sortKey: new Date(p.dateTime) };
    dailyForecast[key].sum += p.riskScore;
    dailyForecast[key].count += 1;
  });
  const futureData = Object.values(dailyForecast).map((d) => ({
    date: d.sortKey.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    future: Number((d.sum / d.count).toFixed(1)),
    sortKey: d.sortKey,
  }));

  const merged = [...pastData, ...futureData].sort((a, b) => a.sortKey - b.sortKey);

  if (merged.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">No timeline data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 7]} allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="past"
          name="Recorded (past)"
          stroke="#0ea5e9"
          strokeWidth={2}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="future"
          name="Forecast (upcoming)"
          stroke="#dc2626"
          strokeWidth={2}
          strokeDasharray="5 4"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}