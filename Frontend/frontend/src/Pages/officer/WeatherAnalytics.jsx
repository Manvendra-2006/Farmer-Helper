import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudSun } from "lucide-react";
import api from "../../../axios/analysis.axios";
import { useAuth } from "../../context/Authcontext";
import WeatherHero from "../../componenet/dashboard/WeatherHero";
import WeatherForecastChart from "../../componenet/dashboard/WeatherForecastChart";
import WeatherRiskForecastBar from "../../componenet/dashboard/WeatherRiskForecastBar";
import WeatherDailyBreakdown from "../../componenet/dashboard/WeatherDailyBreakdown";
import RiskCategoryForecastChart from "../../componenet/dashboard/RiskCategoryForecastChart";

export default function WeatherAnalytics() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const districtName =
    currentUser?.district || currentUser?.assignedDistrict || "District";

  const [current, setCurrent] = useState(null);
  const [forecastPoints, setForecastPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser?.district && !currentUser?.assignedDistrict) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [currentRes, forecastRes] = await Promise.all([
          api.get(`/farmer/weather-risk/${encodeURIComponent(districtName)}`),
          api.get(`/farmer/weather-forecast/${encodeURIComponent(districtName)}`),
        ]);
        setCurrent(currentRes.data);
        setForecastPoints(forecastRes.data.points || []);
      } catch (err) {
        console.error("Failed to load weather analytics:", err);
        setError("Weather data load nahi ho paya. Try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtName]);

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-white to-emerald-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-slate-100">
        <button
          onClick={() => navigate("/command-center")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Command Center
        </button>
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <CloudSun className="w-5 h-5 text-sky-500" />
          Weather Analytics
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-slate-500 py-20">Loading weather data...</p>
        ) : error ? (
          <p className="text-center text-red-600 py-20">{error}</p>
        ) : (
          <>
            <div className="mb-6">
              <WeatherHero current={current} district={districtName} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  Next 5 days — temperature, humidity, rainfall
                </h2>
                <WeatherForecastChart points={forecastPoints} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  Daily fungal risk forecast
                </h2>
                <WeatherRiskForecastBar points={forecastPoints} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                All risks — 5 day forecast (Fungal, Viral/Pest, Heat, Water)
              </h2>
              <RiskCategoryForecastChart points={forecastPoints} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Full forecast — day by day, every 3 hours
              </h2>
              <WeatherDailyBreakdown points={forecastPoints} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}