import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout } from "lucide-react";
import api from "../../../axios/analysis.axios";
import ReportCard from "../../componenet/dashboard/ReportCard";
import AnalysisDetailModal from "../../componenet/dashboard/AnalysisDetailModal";

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/farmer/analysis/mine");
        setReports(data.myAnalyses || []);
      } catch (err) {
        console.error("Failed to load my reports:", err);
        setError("Reports load nahi ho paye. Try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusUpdate = (updated) => {
    setReports((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setSelected(updated);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-emerald-100">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Sprout className="w-5 h-5 text-emerald-600" />
          My Reports
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-center text-slate-500 py-20">Loading your reports...</p>
        ) : error ? (
          <p className="text-center text-red-600 py-20">{error}</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">Aapne abhi tak koi report submit nahi ki hai.</p>
            <button
              onClick={() => navigate("/analysis")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Submit your first analysis
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((r) => (
              <ReportCard key={r._id} analysis={r} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </div>

      <AnalysisDetailModal
        analysis={selected}
        onClose={() => setSelected(null)}
        onStatusUpdate={handleStatusUpdate}
        readOnly
      />
    </div>
  );
}