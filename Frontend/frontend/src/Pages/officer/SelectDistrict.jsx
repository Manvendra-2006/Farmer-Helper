import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Search, Sprout, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios/auth.axios";
import { DISTRICTS } from "../../data/districts";
import { useAuth } from "../../context/Authcontext";
import { hasDistrict, isOfficer } from "../../utils/roleRouting";

function getErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 400) return "Please select a valid district.";
  if (status === 401) return "Your session has expired. Please login again.";
  if (status === 403) return "You are not authorized to update the district.";
  if (status === 500) return "Unable to save district. Please try again.";
  if (!error?.response) return "Unable to connect to the server.";
  return "Unable to save district. Please try again.";
}

export default function SelectDistrict() {
  const { currentUser, loading, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isOfficer(currentUser)) {
      navigate("/home", { replace: true });
    } else if (hasDistrict(currentUser)) {
      navigate("/command-center", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const filteredDistricts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return DISTRICTS.filter((district) => district.toLowerCase().includes(query));
  }, [search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDistrict || isSubmitting) return;

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await api.patch("/auth/district-update", { district: selectedDistrict });
      await fetchCurrentUser();
      setSuccess(true);
      window.setTimeout(() => navigate("/command-center", { replace: true }), 700);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isOfficer(currentUser) || hasDistrict(currentUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100 px-4 py-10 sm:py-16">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10 md:grid-cols-[0.85fr_1.15fr]">
          <div className="hidden flex-col justify-between bg-emerald-700 p-10 text-white md:flex">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Sprout className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-100">Agriculture Officer Setup</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Your district, your command center.</h1>
              <p className="mt-5 leading-relaxed text-emerald-100">Connect your officer account to the local crop health reports you are responsible for.</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100"><MapPin className="h-5 w-5" /> One final step before dashboard access</div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium text-emerald-600">Step 2 of 2</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">Select Your District</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">Select the district you are responsible for to continue to your agriculture officer dashboard.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="district-search">District</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input id="district-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search district" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2 sm:grid-cols-2">
                {filteredDistricts.map((district) => (
                  <button key={district} type="button" onClick={() => { setSelectedDistrict(district); setSearch(district); setErrorMsg(""); }} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${selectedDistrict === district ? "bg-emerald-600 font-semibold text-white" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}>
                    {district}{selectedDistrict === district && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                ))}
                {!filteredDistricts.length && <p className="col-span-full px-2 py-3 text-sm text-slate-500">No districts found.</p>}
              </div>

              {errorMsg && <div role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}
              {success && <div role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-5 w-5" /> District assigned successfully</div>}

              <button type="submit" disabled={!selectedDistrict || isSubmitting || success} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving District...</> : <>Continue <ArrowRight className="h-5 w-5" /></>}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}