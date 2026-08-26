import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../axios/analysis.axios";
import { useAuth } from "../../context/Authcontext";
import { normalizeSeverity } from "../../componenet/dashboard/severity";
import AnalysisListTable from "./AnalysisListTable";
import AnalysisDetailModal from "../../componenet/dashboard/AnalysisDetailModal";
// filter -> { title, match(analysis) -> boolean }
const FILTERS = {
  total: {
    title: "Total Reports",
    match: () => true,
  },
  high: {
    title: "High Risk Cases",
    match: (a) => ["High", "Critical"].includes(normalizeSeverity(a)),
  },
  moderate: {
    title: "Moderate Cases",
    match: (a) => normalizeSeverity(a) === "Moderate",
  },
  healthy: {
    title: "Healthy Reports",
    match: (a) => normalizeSeverity(a) === "Healthy",
  },
};

export default function DistrictReports() {
  const { filter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [analyses, setAnalyses] = useState(location.state?.analyses || null);
  const [loading, setLoading] = useState(!location.state?.analyses);
  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const districtName =
    location.state?.districtName ||
    currentUser?.district ||
    currentUser?.assignedDistrict ||
    "District";

  // If the page was opened directly (refresh / shared link), there's no
  // navigation state to reuse — fetch the district data fresh instead.
  useEffect(() => {
    if (analyses) return;
    if (!currentUser?.district && !currentUser?.assignedDistrict) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get(
          `/farmer/district-data/${encodeURIComponent(districtName)}`
        );
        setAnalyses(Array.isArray(data) ? data : data.districtData || []);
      } catch (err) {
        console.error("Failed to load analyses:", err);
        setError("Analyses load nahi ho payin. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const config = FILTERS[filter] || FILTERS.total;

  const filtered = useMemo(() => {
    if (!analyses) return [];
    return analyses.filter(config.match);
  }, [analyses, config]);

  const handleStatusUpdate = (updatedAnalysis) => {
    setAnalyses((prev) =>
      (prev || []).map((a) => (a._id === updatedAnalysis._id ? updatedAnalysis : a))
    );
    setSelectedAnalysis(updatedAnalysis);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-emerald-100">
        <button
          onClick={() => navigate("/command-center")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Command Center
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{config.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {districtName} District {!loading && `· ${filtered.length} report${filtered.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          {loading ? (
            <p className="text-center text-slate-500 py-20">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-600 py-20">{error}</p>
          ) : (
            <AnalysisListTable
              analyses={filtered}
              onSelect={setSelectedAnalysis}
              emptyText={`No ${config.title.toLowerCase()} right now`}
            />
          )}
        </div>
      </div>

      <AnalysisDetailModal
        analysis={selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}