import { Droplets, CloudRain, Thermometer } from "lucide-react";

const LEVEL_BADGE = {
  High: "bg-red-50 text-red-700 border-red-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function LevelBadge({ level }) {
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${
        LEVEL_BADGE[level] || LEVEL_BADGE.Low
      }`}
    >
      {level}
    </span>
  );
}

// Groups the raw forecast points (one every 3 hours) by calendar day so
// every single data point the API returned is visible, organized by date.
function groupByDay(points) {
  const days = {};
  points.forEach((p) => {
    const key = p.dateTime.slice(0, 10);
    if (!days[key]) {
      days[key] = {
        key,
        label: new Date(key).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "2-digit",
          month: "short",
        }),
        points: [],
      };
    }
    days[key].points.push(p);
  });
  return Object.values(days).sort((a, b) => new Date(a.key) - new Date(b.key));
}

export default function WeatherDailyBreakdown({ points }) {
  const days = groupByDay(points || []);

  if (days.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-10">No forecast data</p>;
  }

  return (
    <div className="space-y-5">
      {days.map((day) => (
        <div key={day.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{day.label}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 pr-3 font-medium">Condition</th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" /> Temp
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" /> Humidity
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5" /> Rain
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">Wind</th>
                  <th className="py-2 pr-3 font-medium">Fungal</th>
                  <th className="py-2 pr-3 font-medium">Viral/Pest</th>
                  <th className="py-2 pr-3 font-medium">Heat</th>
                  <th className="py-2 pr-3 font-medium">Water</th>
                </tr>
              </thead>
              <tbody>
                {day.points.map((p) => (
                  <tr key={p.dateTime} className="border-b border-slate-50">
                    <td className="py-2 pr-3 font-medium text-slate-700 whitespace-nowrap">
                      {new Date(p.dateTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-3 text-slate-600 capitalize whitespace-nowrap">
                      {p.description}
                    </td>
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">
                      {Math.round(p.temperature)}°C
                    </td>
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{p.humidity}%</td>
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">{p.rainfall} mm</td>
                    <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">
                      {p.windSpeed} m/s
                    </td>
                    <td className="py-2 pr-3">
                      <LevelBadge level={p.riskLevel} />
                    </td>
                    <td className="py-2 pr-3">
                      <LevelBadge level={p.insectRiskLevel} />
                    </td>
                    <td className="py-2 pr-3">
                      <LevelBadge level={p.heatStressLevel} />
                    </td>
                    <td className="py-2 pr-3">
                      <LevelBadge level={p.waterStressLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}