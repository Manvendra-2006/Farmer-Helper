import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, UserRound, Check, Loader2 } from "lucide-react";
import api from "../../axios/auth.axios";
import { useAuth } from "../context/Authcontext";
import { officerRouteFor, homeRouteFor, isOfficer } from "../utils/roleRouting";
import { setAuthToken } from "../context/authToken";

const ROLES = [
  {
    id: "farmer",
    title: "Farmer",
    Icon: Sprout,
    description:
      "Get AI-powered crop disease and pest analysis, crop recommendations and farming assistance.",
  },
  {
    id: "expert",
    title: "Expert",
    Icon: UserRound,
    description:
      "Help farmers with expert advice, diagnosis and agricultural guidance.",
  },
];

const API_ROLES = {
  farmer: "Farmer",
  expert: "Officer",
};

// Where each role lands after selecting / on repeat visits
export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { fetchCurrentUser, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role) {
      navigate(isOfficer(currentUser) ? officerRouteFor(currentUser) : homeRouteFor(currentUser), { replace: true });
    }
  }, [currentUser, navigate]);

  const handleContinue = async () => {
    if (!selectedRole) {
      setErrorMsg("Please select a role");
      return;
    }
    if (isSubmitting) return;

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const role = API_ROLES[selectedRole];
      console.log("Selected role:", selectedRole);
      console.log("Calling role update API");

      const response = await api.patch(
        "/auth/role-update",
        { role },
        { withCredentials: true }
      );
      console.log("Role update response:", response.data);
      if (response.data.token) setAuthToken(response.data.token);

      const user = await fetchCurrentUser();
      navigate(isOfficer(user) ? officerRouteFor(user) : homeRouteFor(user), { replace: true });
    } catch (error) {
      console.error(
        "Role update error:",
        error.response?.data || error.message
      );
      const status = error?.response?.status;
      if (status === 400) setErrorMsg("Invalid role selected. Please try again.");
      else if (status === 401) setErrorMsg("Session expired. Please log in again.");
      else if (status === 403) setErrorMsg("You don't have permission to update your role.");
      else if (status === 500) setErrorMsg("Unable to update role. Please try again.");
      else if (!error?.response) setErrorMsg("Network error. Please check your connection.");
      else setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
            Choose your role
          </h1>
          <p className="text-slate-500 mt-3 text-sm sm:text-base">
            Tell us how you want to use the platform
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {ROLES.map(({ id, title, Icon, description }) => {
            const isSelected = selectedRole === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedRole(id)}
                className={`relative text-left rounded-2xl p-6 sm:p-7 border-2 transition-all duration-200 bg-white hover:shadow-lg ${
                  isSelected
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-100"
                    : "border-slate-200 hover:border-emerald-200"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? "bg-emerald-600" : "bg-emerald-50"
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${isSelected ? "text-white" : "text-emerald-600"}`}
                  />
                </div>

                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  {title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div className="mt-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-10 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}