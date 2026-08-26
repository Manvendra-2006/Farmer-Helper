// Requires: npm install recharts
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function WeatherForecastChart({ points }) {
  if (!points || points.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">Forecast unavailable</p>;
  }

  const data = points.map((p) => ({
    time: new Date(p.dateTime).toLocaleString("en-IN", {
      weekday: "short",
      hour: "2-digit",
    }),
    temperature: p.temperature,
    humidity: p.humidity,
    rainfall: p.rainfall,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#38bdf8" radius={[3, 3, 0, 0]} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temperature"
          name="Temperature (°C)"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="humidity"
          name="Humidity (%)"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}