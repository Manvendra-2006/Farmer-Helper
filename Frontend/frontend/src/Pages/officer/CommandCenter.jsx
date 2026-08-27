import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  Sprout,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Gauge,
  Target,
  CalendarClock,
  CloudSun,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios/analysis.axios";
import { useAuth } from "../../context/Authcontext";
import StatCard from "../../componenet/dashboard/StatCard";
import HotspotMap from "../../componenet/dashboard/HotspotMap";
import WeatherRiskCard from "../../componenet/dashboard/WeatherRiskCard";
import CropHealthDonut from "../../componenet/dashboard/CropHealthDonut";
import DiseaseTrendChart from "../../componenet/dashboard/DiseaseTrendChart";
import CategoryBarChart from "../../componenet/dashboard/CategoryBarChart";
import HighRiskTable from "../../componenet/dashboard/HighRiskTable";
import AnalysisDetailModal from "../../componenet/dashboard/AnalysisDetailModal";
import { normalizeSeverity } from "../../componenet/dashboard/severity";
import AnalysisListTable from "./AnalysisListTable";
export default function CommandCenter() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [dueFollowUps, setDueFollowUps] = useState([]);
  const [showDueModal, setShowDueModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const districtName =
    currentUser?.district || currentUser?.assignedDistrict || "District";

  const loadAnalyses = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const { data } = await api.get(
        `/farmer/district-data/${districtName}`
      );
      const list = Array.isArray(data) ? data : data.districtData || [];
      console.log(data)
      setAnalyses(list);
      setError("");
    } catch (err) {
      console.error("Failed to load analyses:", err);
      setError("Analyses load nahi ho payin. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.district && !currentUser?.assignedDistrict) {
      setLoading(false);
      return;
    }
    loadAnalyses();

    const loadDueFollowUps = async () => {
      try {
        const { data } = await api.get(
          `/farmer/followups/due/${districtName}`
        );
        setDueFollowUps(data.analyses || []);
      } catch (err) {
        console.error("Failed to load due follow-ups:", err);
      }
    };
    loadDueFollowUps();
  }, [districtName, currentUser?.district, currentUser?.assignedDistrict]);

  const stats = useMemo(() => {
    const total = analyses.length;
    let critical = 0,
      high = 0,
      moderate = 0,
      healthy = 0,
      confidenceSum = 0,
      confidenceCount = 0;

    analyses.forEach((a) => {
      const severity = normalizeSeverity(a);
      if (severity === "Critical") critical += 1;
      else if (severity === "High") high += 1;
      else if (severity === "Moderate") moderate += 1;
      else if (severity === "Healthy") healthy += 1;

      const confidence = a.aianalysis?.summary?.confidence;
      if (typeof confidence === "number") {
        confidenceSum += confidence;
        confidenceCount += 1;
      }
    });

    return {
      total,
      highRisk: critical + high,
      moderate,
      healthy,
      avgConfidence: confidenceCount
        ? Math.round(confidenceSum / confidenceCount)
        : 0,
    };
  }, [analyses]);

  const handleLogout = async () => {
    await logout();
  };

  const goToReports = (filter) => {
    navigate(`/command-center/reports/${filter}`, {
      state: { analyses, districtName },
    });
  };

  const handleStatusUpdate = (updatedAnalysis) => {
    setAnalyses((prev) =>
      prev.map((a) => (a._id === updatedAnalysis._id ? updatedAnalysis : a))
    );
    setDueFollowUps((prev) =>
      prev
        .map((a) => (a._id === updatedAnalysis._id ? updatedAnalysis : a))
        .filter((a) =>
          (a.followUps || []).some(
            (f) => f.status === "Scheduled" && new Date(f.scheduledDate) <= new Date()
          )
        )
    );
    setSelectedAnalysis(updatedAnalysis);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-slate-800 leading-tight">
            AgriSentinel
            </p>
            <p className="text-xs text-slate-500 leading-tight">
              {districtName} District
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/command-center/weather")}
            title="Weather Analytics"
            className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 transition-colors"
          >
            <CloudSun className="w-5 h-5" />
            Weather
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-slate-500 py-20">Loading district data...</p>
        ) : error ? (
          <p className="text-center text-red-600 py-20">{error}</p>
        ) : (
          <>
            {stats.highRisk > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">
                  <span className="font-semibold">
                    {stats.highRisk} high-risk case{stats.highRisk > 1 ? "s" : ""}
                  </span>{" "}
                  detected across the district — review the table below.
                </p>
              </div>
            )}

            {dueFollowUps.length > 0 && (
              <button
                onClick={() => setShowDueModal(true)}
                className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-left hover:bg-amber-100 transition-colors"
              >
                <CalendarClock className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">
                    {dueFollowUps.length} follow-up{dueFollowUps.length > 1 ? "s" : ""} due or overdue
                  </span>{" "}
                  — tap to review.
                </p>
              </button>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <StatCard
                label="Total Reports"
                value={stats.total}
                Icon={Activity}
                onClick={() => goToReports("total")}
              />
              <StatCard
                label="High Risk Cases"
                value={stats.highRisk}
                tone="danger"
                Icon={AlertTriangle}
                onClick={() => goToReports("high")}
              />
              <StatCard
                label="Moderate Cases"
                value={stats.moderate}
                tone="warning"
                Icon={Gauge}
                onClick={() => goToReports("moderate")}
              />
              <StatCard
                label="Healthy Reports"
                value={stats.healthy}
                tone="success"
                Icon={ShieldCheck}
                onClick={() => goToReports("healthy")}
              />
              <StatCard
                label="Avg AI Confidence"
                value={`${stats.avgConfidence}%`}
                Icon={Target}
              />
            </div>

            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={() => loadAnalyses(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh reports
              </button>
            </div>

            <div className="mb-6">
              <button
                onClick={() => navigate("/command-center/weather")}
                className="w-full text-left"
              >
                <WeatherRiskCard district={districtName} />
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  District Hotspot Map
                </h2>
                <HotspotMap analyses={analyses} />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  Crop Health Distribution
                </h2>
                <CropHealthDonut analyses={analyses} />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  Disease Progression Trend
                </h2>
                <DiseaseTrendChart analyses={analyses} />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">
                  Cases by Category
                </h2>
                <CategoryBarChart analyses={analyses} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                High-Risk Farmer Cases
              </h2>
              <HighRiskTable analyses={analyses} onSelect={setSelectedAnalysis} />
            </div>
          </>
        )}
      </div>

      <AnalysisDetailModal
        analysis={selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        onStatusUpdate={handleStatusUpdate}
      />

      {showDueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Due &amp; Overdue Follow-ups</h3>
              <button
                onClick={() => setShowDueModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <AnalysisListTable
              analyses={dueFollowUps}
              onSelect={(a) => {
                setShowDueModal(false);
                setSelectedAnalysis(a);
              }}
              emptyText="No due follow-ups"
            />
          </div>
        </div>
      )}
    </div>
  );
}