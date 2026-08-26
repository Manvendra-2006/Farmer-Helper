import { useEffect, useState } from "react";
import { CloudRain, Droplets, AlertTriangle, Bug, Flame, Waves } from "lucide-react";
import api from "../../../axios/analysis.axios";

const RISK_CLASSES = {
  High: "bg-red-50 border-red-200 text-red-700",
  Moderate: "bg-amber-50 border-amber-200 text-amber-700",
  Low: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

function MiniRiskBadge({ icon: Icon, label, level }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
        RISK_CLASSES[level] || RISK_CLASSES.Low
      }`}
    >
      <Icon className="w-3 h-3" />
      {label}: {level}
    </span>
  );
}

export default function WeatherRiskCard({ district }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!district) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get(
          `/farmer/weather-risk/${encodeURIComponent(district)}`
        );
        setRisk(data);
      } catch (err) {
        console.error("Failed to load weather risk:", err);
        setError("Weather data load nahi ho paya");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [district]);

  if (loading) {
    return <p className="text-xs text-slate-400 py-4">Loading weather risk...</p>;
  }
  if (error || !risk) {
    return <p className="text-xs text-slate-400 py-4">{error || "Weather data unavailable"}</p>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700 mb-2">
        {district} District — Weather Risk Overview
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        <MiniRiskBadge icon={AlertTriangle} label="Fungal" level={risk.riskLevel} />
        <MiniRiskBadge icon={Bug} label="Viral/Pest" level={risk.insectRiskLevel} />
        <MiniRiskBadge icon={Flame} label="Heat" level={risk.heatStressLevel} />
        <MiniRiskBadge icon={Waves} label="Water" level={risk.waterStressLevel} />
      </div>

      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5" /> {risk.humidity}% humidity
        </span>
        <span className="flex items-center gap-1">
          <CloudRain className="w-3.5 h-3.5" /> {risk.rainfall}mm rain
        </span>
        <span>{Math.round(risk.temperature)}°C</span>
      </div>
    </div>
  );
}