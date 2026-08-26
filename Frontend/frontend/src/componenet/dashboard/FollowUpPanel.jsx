import { useState } from "react";
import { Loader2, Plus, X, CalendarClock } from "lucide-react";
import api from "../../../axios/analysis.axios";

const IMPROVEMENT_CLASSES = {
  Improved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "No Change": "bg-amber-50 text-amber-700 border-amber-200",
  Worsened: "bg-red-50 text-red-700 border-red-200",
};

function isOverdue(followUp) {
  return (
    followUp.status === "Scheduled" &&
    new Date(followUp.scheduledDate) < new Date().setHours(0, 0, 0, 0)
  );
}

function ScheduleForm({ onSubmit, onCancel, submitting, error }) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-2">
      <input
        type="date"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
      />
      <textarea
        placeholder="Notes — optional (e.g. what to check on revisit)"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({ scheduledDate, notes })}
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Schedule
        </button>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 px-3.5 py-1.5 rounded-lg hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CompleteForm({ onSubmit, onCancel, submitting, error }) {
  const [improvementStatus, setImprovementStatus] = useState("Improved");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  return (
    <div className="bg-slate-50 rounded-lg p-3 mt-2 space-y-2">
      <div className="flex gap-2">
        {["Improved", "No Change", "Worsened"].map((opt) => (
          <button
            key={opt}
            onClick={() => setImprovementStatus(opt)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              improvementStatus === opt
                ? IMPROVEMENT_CLASSES[opt]
                : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <textarea
        placeholder="What did you observe on revisit?"
        rows={2}
        value={outcomeNotes}
        onChange={(e) => setOutcomeNotes(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({ improvementStatus, outcomeNotes })}
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Outcome
        </button>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 px-3.5 py-1.5 rounded-lg hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function FollowUpPanel({ analysis, onStatusUpdate, readOnly = false }) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const followUps = [...(analysis.followUps || [])].sort(
    (a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)
  );

  const handleSchedule = async ({ scheduledDate, notes }) => {
    if (!scheduledDate) {
      setError("Date required hai");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post(`/farmer/analysis/${analysis._id}/followup`, {
        scheduledDate,
        notes,
      });
      onStatusUpdate?.(data.analysis);
      setShowScheduleForm(false);
    } catch (err) {
      console.error("Failed to schedule follow-up:", err);
      setError("Schedule nahi ho paya. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (followupId, { improvementStatus, outcomeNotes }) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.patch(
        `/farmer/analysis/${analysis._id}/followup/${followupId}`,
        { improvementStatus, outcomeNotes }
      );
      onStatusUpdate?.(data.analysis);
      setCompletingId(null);
    } catch (err) {
      console.error("Failed to complete follow-up:", err);
      setError("Outcome save nahi hua. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Follow-up / Revisit
        </h4>
        {!showScheduleForm && !readOnly && (
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule Follow-up
          </button>
        )}
      </div>

      {showScheduleForm && (
        <ScheduleForm
          onSubmit={handleSchedule}
          onCancel={() => {
            setShowScheduleForm(false);
            setError("");
          }}
          submitting={submitting}
          error={error}
        />
      )}

      {followUps.length === 0 && !showScheduleForm ? (
        <p className="text-xs text-slate-400">No follow-up scheduled yet</p>
      ) : (
        <div className="space-y-2">
          {followUps.map((f) => {
            const overdue = isOverdue(f);
            return (
              <div key={f._id} className="bg-slate-50 rounded-lg p-3 text-sm">
                <div className="flex items-start justify-between mb-1">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {new Date(f.scheduledDate).toLocaleDateString("en-IN")}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      f.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : overdue
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {f.status === "Scheduled" && overdue ? "Overdue" : f.status}
                  </span>
                </div>
                {f.notes && <p className="text-xs text-slate-500">{f.notes}</p>}

                {f.status === "Completed" ? (
                  <div className="mt-1.5">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${
                        IMPROVEMENT_CLASSES[f.improvementStatus]
                      }`}
                    >
                      {f.improvementStatus}
                    </span>
                    {f.outcomeNotes && (
                      <p className="text-xs text-slate-500 mt-1">{f.outcomeNotes}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Recorded {new Date(f.completedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ) : completingId === f._id ? (
                  <CompleteForm
                    onSubmit={(vals) => handleComplete(f._id, vals)}
                    onCancel={() => setCompletingId(null)}
                    submitting={submitting}
                    error={error}
                  />
                ) : readOnly ? (
                  <p className="text-xs text-slate-400 mt-1">Officer revisit pending</p>
                ) : (
                  <button
                    onClick={() => setCompletingId(f._id)}
                    className="text-xs font-medium text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1 mt-2 hover:bg-emerald-50"
                  >
                    Record revisit outcome
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}