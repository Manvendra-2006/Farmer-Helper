import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Loader2 } from "lucide-react";
import { useAuth } from "../context/Authcontext";

function getErrorMessage(error) {
  const code = error?.code; 
  const status = error?.response?.status; 

  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Google sign-in was cancelled. Please try again.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error during Google sign-in. Check your connection.";
  }
  if (code && code.startsWith("auth/")) {
    return "Google authentication failed. Please try again.";
  }
  if (status === 400) return "Invalid request. Please try again.";
  if (status === 401) return "Authentication failed. Please try again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 500) return "Something went wrong on our end. Please try again shortly.";
  if (error?.request && !error?.response) return "Network error. Please check your connection.";

  return "Something went wrong. Please try again.";
}

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const { user } = await loginWithGoogle();

      if (user?.role) {
        navigate("/home", { replace: true });
      } else {
        navigate("/select-role", { replace: true });
      }
    } catch (error) {
      console.error("Google login failed:", error);
      setErrorMsg(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-5">
              <Sprout className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              AI Farm Assistant
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Your intelligent farming companion
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md text-slate-700 font-medium py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            ) : (
              <GoogleIcon />
            )}
            <span>{isSubmitting ? "Signing you in..." : "Continue with Google"}</span>
          </button>

          {errorMsg && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-center">
              {errorMsg}
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-6">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 34.9 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.7 36.2 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}