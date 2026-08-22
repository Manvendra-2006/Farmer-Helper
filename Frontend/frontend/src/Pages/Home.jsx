import { useNavigate } from "react-router-dom";
import { LogOut, Sprout } from "lucide-react";
import { useAuth } from "../context/Authcontext";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
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

      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""} 👋
        </h1>
        <p className="text-slate-500 mt-3">
          You're logged in as a <span className="font-medium capitalize text-emerald-700">{currentUser?.role}</span>.
        </p>
      </div>
    </div>
  );
}