import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import api from "../../../axios/analysis.axios";

const REFERRAL_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];

const REFERRAL_STATUS_CLASSES = {
  Pending: "bg-slate-50 text-slate-600 border-slate-200",
  "In Progress": "bg-sky-50 text-sky-700 border-sky-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-500 border-red-200",
};

function ReferralStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        REFERRAL_STATUS_CLASSES[status] || REFERRAL_STATUS_CLASSES.Pending
      }`}
    >
      {status}
    </span>
  );
}

const EMPTY_FORM = {
  type: "Field Visit",
  assigneeName: "",
  assigneeContact: "",
  dueDate: "",
  notes: "",
};

export default function ReferralPanel({ analysisId, readOnly = false }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/farmer/referral/analysis/${analysisId}`,
      );
      setReferrals(data.referrals || []);
    } catch (err) {
      console.error("Failed to load referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  const handleSubmit = async () => {
    if (!form.assigneeName || !form.dueDate) {
      setError("Assignee aur due date required hai");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/farmer/referral", {
        analysisId,
        ...form,
      });
      setReferrals((prev) => [data.referral, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create referral:", err);
      setError("Referral create nahi ho paya. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (referralId, status) => {
    setUpdatingId(referralId);
    try {
      const { data } = await api.patch(`/farmer/referral/${referralId}/status`, {
        status,
      });
      setReferrals((prev) =>
        prev.map((r) => (r._id === referralId ? data.referral : r))
      );
    } catch (err) {
      console.error("Failed to update referral status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Referral &amp; Follow-up
        </h4>
        {!readOnly && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            {showForm ? (
              <>
                <X className="w-3.5 h-3.5" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Refer to Lab / Assign Field Visit
              </>
            )}
          </button>
        )}
      </div>

      {!readOnly && showForm && (
        <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="Field Visit">Field Visit</option>
              <option value="Lab Referral">Lab Referral</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
            />
          </div>
          <input
            type="text"
            placeholder="Assignee name (extension worker / lab)"
            value={form.assigneeName}
            onChange={(e) => setForm({ ...form, assigneeName: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
          />
          <input
            type="text"
            placeholder="Contact (phone/email) — optional"
            value={form.assigneeContact}
            onChange={(e) => setForm({ ...form, assigneeContact: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
          />
          <textarea
            placeholder="Notes — optional"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Referral
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading referrals...</p>
      ) : referrals.length === 0 ? (
        <p className="text-xs text-slate-400">No referrals raised yet</p>
      ) : (
        <div className="space-y-2">
          {referrals.map((r) => (
            <div key={r._id} className="bg-slate-50 rounded-lg p-3 text-sm">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-slate-700">
                  {r.type} — {r.assigneeName}
                </p>
                <ReferralStatusBadge status={r.status} />
              </div>
              {r.assigneeContact && (
                <p className="text-xs text-slate-500">{r.assigneeContact}</p>
              )}
              <p className="text-xs text-slate-500">
                Due {new Date(r.dueDate).toLocaleDateString("en-IN")}
                {r.completedAt &&
                  ` · Completed ${new Date(r.completedAt).toLocaleDateString("en-IN")}`}
              </p>
              {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}

              {!readOnly && r.status !== "Completed" && r.status !== "Cancelled" && (
                <div className="flex gap-2 mt-2">
                  {REFERRAL_STATUSES.filter((s) => s !== r.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(r._id, s)}
                      disabled={updatingId === r._id}
                      className="text-xs font-medium text-slate-600 border border-slate-200 rounded-full px-2.5 py-1 hover:bg-white disabled:opacity-50"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}