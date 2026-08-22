import { useNavigate } from "react-router-dom";
import { LogOut, Sprout, Zap } from "lucide-react";
import { useAuth } from "../context/Authcontext";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-600" />
          <span className="font-semibold text-slate-800">AI Farm Assistant</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""} 👋
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            You're logged in as a <span className="font-medium capitalize text-emerald-700">{currentUser?.role}</span>.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Crop Health Analysis Card */}
          <button
            onClick={() => navigate("/analysis")}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-emerald-100 hover:border-emerald-400 text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg flex items-center justify-center mb-4 transition-colors">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Crop Health Analysis</h2>
            <p className="text-slate-600 text-sm mb-4">
              Upload a crop photo and get AI-powered disease diagnosis, treatment recommendations,
              and prevention tips.
            </p>
            <span className="text-emerald-600 font-semibold text-sm">Start Analysis →</span>
          </button>

          {/* Placeholder for future features */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 opacity-50 text-left">
            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">More Features Coming Soon</h2>
            <p className="text-slate-600 text-sm">
              Additional tools and features to help you manage your farm better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}