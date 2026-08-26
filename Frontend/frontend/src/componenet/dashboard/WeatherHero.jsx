import {
  Droplets,
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  Cloud,
  Sunrise,
  Sunset,
  AlertTriangle,
} from "lucide-react";

const RISK_CLASSES = {
  High: "bg-red-50 border-red-200 text-red-700",
  Moderate: "bg-amber-50 border-amber-200 text-amber-700",
  Low: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export default function WeatherHero({ current, district }) {
  if (!current) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">{district} District · Right now</p>
          <p className="text-3xl font-bold text-slate-800">
            {Math.round(current.temperature)}°C
          </p>
          <p className="text-sm text-slate-500 capitalize">
            {current.description} · feels like {Math.round(current.feelsLike)}°C
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${
            RISK_CLASSES[current.riskLevel] || RISK_CLASSES.Low
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {current.riskLevel} fungal risk
        </span>
      </div>

      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-4">{current.reason}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
        <Stat icon={CloudRain} label="Rainfall" value={`${current.rainfall} mm`} />
        <Stat
          icon={Thermometer}
          label="Min / Max"
          value={`${Math.round(current.tempMin)}° / ${Math.round(current.tempMax)}°`}
        />
        <Stat icon={Wind} label="Wind speed" value={`${current.windSpeed} m/s`} />
        <Stat icon={Gauge} label="Pressure" value={`${current.pressure} hPa`} />
        <Stat icon={Cloud} label="Cloud cover" value={`${current.cloudCover}%`} />
        <Stat
          icon={Sunrise}
          label="Sunrise"
          value={
            current.sunrise
              ? new Date(current.sunrise).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
        />
        <Stat
          icon={Sunset}
          label="Sunset"
          value={
            current.sunset
              ? new Date(current.sunset).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
        />
      </div>
    </div>
  );
}