import { useState } from "react";
import { X, MapPin, Calendar, Layers, Loader2 } from "lucide-react";

import { SeverityBadge, normalizeSeverity } from "./severity";
import { StatusBadge, STATUS_FLOW } from "./status";
import ReferralPanel from "./ReferralPanel";
import FollowUpPanel from "./FollowUpPanel";

import api from "../../../axios/analysis.axios";

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {title}
      </h4>

      {children}
    </div>
  );
}

function BulletList({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-slate-400">—</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
      {items.map((item, i) => (
        <li key={i}>
          {typeof item === "string" ? item : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Converts confidence/probability values:
 *
 * 0.85 -> 85
 * 0.10 -> 10
 * 85   -> 85
 */
function normalizePercentage(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  if (numericValue >= 0 && numericValue <= 1) {
    return Math.round(numericValue * 100);
  }

  return Math.round(numericValue);
}

/**
 * Human friendly status labels
 */
function formatStatus(value) {
  if (!value) return "—";

  const statusMap = {
    "diagnosis provided": "Diagnosis Provided",
    "possible disease detected": "Possible Disease Detected",
    "insufficient evidence": "Insufficient Evidence",
  };

  const normalized = String(value).toLowerCase();

  return (
    statusMap[normalized] ||
    String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

// Which button label to show for each possible next status
const STATUS_ACTION_LABELS = {
  Verified: "Confirm Diagnosis",
  "False Positive": "Mark False Positive",
  "Action Taken": "Mark Action Taken",
  Resolved: "Mark Resolved",
  "Pending Review": "Reopen Case",
};

function StatusWorkflow({ analysis, onStatusUpdate, readOnly }) {
  const [note, setNote] = useState(analysis.officerNote || "");
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const currentStatus = analysis.status || "Pending Review";

  const nextOptions = STATUS_FLOW[currentStatus] || [];

  const handleUpdate = async (nextStatus) => {
    setUpdating(nextStatus);
    setError("");

    try {
      const { data } = await api.patch(
        `/farmer/analysis/${analysis._id}/status`,
        {
          status: nextStatus,
          officerNote: note || undefined,
        }
      );

      onStatusUpdate?.(data.analysis);
    } catch (err) {
      console.error("Status update failed:", err);

      setError("Status update nahi ho paya. Try again.");
    } finally {
      setUpdating(null);
    }
  };

  if (readOnly) {
    return (
      <Section title="Case status">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={currentStatus} />

          {analysis.reviewedAt && (
            <span className="text-xs text-slate-400">
              Officer ne last update kiya{" "}
              {new Date(analysis.reviewedAt).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>

        {analysis.officerNote && (
          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
            {analysis.officerNote}
          </p>
        )}
      </Section>
    );
  }

  return (
    <Section title="Case status">
      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={currentStatus} />

        {analysis.reviewedAt && (
          <span className="text-xs text-slate-400">
            Last updated{" "}
            {new Date(analysis.reviewedAt).toLocaleDateString("en-IN")}
          </span>
        )}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Officer note (optional) — reason, field observation, etc."
        rows={2}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />

      <div className="flex flex-wrap gap-2">
        {nextOptions.map((nextStatus) => (
          <button
            key={nextStatus}
            onClick={() => handleUpdate(nextStatus)}
            disabled={updating !== null}
            className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
              nextStatus === "False Positive"
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {updating === nextStatus && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}

            {STATUS_ACTION_LABELS[nextStatus] || nextStatus}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </Section>
  );
}

export default function AnalysisDetailModal({
  analysis,
  onClose,
  onStatusUpdate,
  readOnly = false,
}) {
  if (!analysis) return null;

  const ai = analysis.aianalysis || {};

  const severity = normalizeSeverity(analysis);

  const details = ai.primaryDiagnosisDetails || {};
  const location = ai.locationAnalysis || {};
  const treatment = ai.treatmentDetails || {};
  const cropHealth = ai.cropHealth || {};
  const summary = ai.summary || {};

  const confidence = normalizePercentage(summary.confidence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">


        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {analysis.cropName || "Crop Analysis"}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />

                {analysis.addLocation?.formattedAddress || "Location unavailable"}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />

                {analysis.createdAt
                  ? new Date(analysis.createdAt).toLocaleDateString("en-IN")
                  : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {analysis.photoURL && (
          <img
            src={analysis.photoURL}
            alt={analysis.cropName || "Crop"}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-6">
    

          <div className="flex flex-wrap items-center gap-2 mb-5">
    
            <SeverityBadge severity={severity} />

          
            {cropHealth.overallCondition && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                {cropHealth.overallCondition}
              </span>
            )}

          
            {summary.status && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                {formatStatus(summary.status)}
              </span>
            )}

            {(analysis.cropTypeUse || analysis.cropTypeSeason) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                {analysis.cropTypeUse || "—"} ·{" "}
                {analysis.cropTypeSeason || "—"}
              </span>
            )}

   
            {(analysis.soilType || analysis.growthStage) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                {analysis.soilType || "—"} soil ·{" "}
                {analysis.growthStage || "—"}
              </span>
            )}

          
            {confidence !== null && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200">
                {confidence}% AI confidence
              </span>
            )}
          </div>

          <StatusWorkflow
            analysis={analysis}
            onStatusUpdate={onStatusUpdate}
            readOnly={readOnly}
          />

          {(severity === "High" || severity === "Critical") && (
            <ReferralPanel
              analysisId={analysis._id}
              readOnly={readOnly}
            />
          )}



          <FollowUpPanel
            analysis={analysis}
            onStatusUpdate={onStatusUpdate}
            readOnly={readOnly}
          />


          <Section title="AI Analysis Summary">
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              {summary.status && (
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Status
                  </p>

                  <p className="text-sm text-slate-700 mt-1">
                    {formatStatus(summary.status)}
                  </p>
                </div>
              )}

              {summary.primaryDiagnosis && (
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Primary Diagnosis
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {summary.primaryDiagnosis}
                  </p>
                </div>
              )}

              {summary.category && (
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Category
                  </p>

                  <p className="text-sm text-slate-700 mt-1">
                    {summary.category}
                  </p>
                </div>
              )}

              {summary.shortExplanation && (
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Explanation
                  </p>

                  <p className="text-sm text-slate-600 mt-1">
                    {summary.shortExplanation}
                  </p>
                </div>
              )}

              {confidence !== null && (
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    AI Confidence
                  </p>

                  <p className="text-sm font-semibold text-sky-700 mt-1">
                    {confidence}%
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Crop Health">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500">
                  Overall Condition
                </p>

                <p className="text-sm text-slate-700 mt-1">
                  {cropHealth.overallCondition || "—"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500">
                  Severity
                </p>

                <div className="mt-1">
                  <SeverityBadge severity={severity} />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500">
                  Farmer Reported Affected Area
                </p>

                <p className="text-sm text-slate-700 mt-1">
                  {analysis.affectedArea != null
                    ? `${analysis.affectedArea}%`
                    : "—"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500">
                  AI Estimated Affected Area
                </p>

                <p className="text-sm text-slate-700 mt-1">
                  {cropHealth.affectedArea || "—"}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Visible Symptoms
              </p>

              <BulletList items={cropHealth.visibleSymptoms} />
            </div>
          </Section>


          <Section title="Diagnosis">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              {summary.primaryDiagnosis || "—"}

              {summary.category && (
                <span className="font-normal text-slate-500">
                  {" "}
                  ({summary.category})
                </span>
              )}
            </p>

            {summary.shortExplanation && (
              <p className="text-sm text-slate-600">
                {summary.shortExplanation}
              </p>
            )}

            {details.simpleExplanation && (
              <p className="text-sm text-slate-500 mt-1">
                {details.simpleExplanation}
              </p>
            )}
          </Section>

 

          {(details.name ||
            details.simpleExplanation ||
            details.whyLikely?.length ||
            details.supportingEvidence?.length ||
            details.evidenceAgainst?.length) && (
            <Section title="Why this diagnosis">
              <div className="space-y-3">
                {details.name && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Diagnosis
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {details.name}
                    </p>
                  </div>
                )}

                {details.simpleExplanation && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Simple explanation
                    </p>

                    <p className="text-sm text-slate-600">
                      {details.simpleExplanation}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Supporting signs
                  </p>

                  <BulletList items={details.whyLikely} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Supporting evidence
                  </p>

                  <BulletList items={details.supportingEvidence} />
                </div>

                {details.evidenceAgainst?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Evidence against
                    </p>

                    <BulletList items={details.evidenceAgainst} />
                  </div>
                )}
              </div>
            </Section>
          )}

         

          <Section title="Reported Symptoms">
            <p className="text-sm text-slate-600 mb-2">
              Reported symptom:{" "}
              <span className="font-medium">
                {analysis.symptoms || "—"}
              </span>
            </p>

            <p className="text-sm text-slate-600 mb-2">
              Farmer reported affected area:{" "}
              <span className="font-medium">
                {analysis.affectedArea != null
                  ? `${analysis.affectedArea}%`
                  : "—"}
              </span>
            </p>

            {cropHealth.affectedArea && (
              <p className="text-sm text-slate-600 mb-2">
                AI estimated affected area:{" "}
                <span className="font-medium">
                  {cropHealth.affectedArea}
                </span>
              </p>
            )}

            <div className="mt-2">
              <p className="text-xs font-medium text-slate-500 mb-1">
                AI detected visible symptoms
              </p>

              <BulletList items={cropHealth.visibleSymptoms} />
            </div>
          </Section>

          {/* =========================================================
              FARMER DESCRIPTION
          ========================================================== */}

          {analysis.description && (
            <Section title="Farmer's Description">
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {analysis.description}
              </p>
            </Section>
          )}

          {/* =========================================================
              POSSIBLE CAUSES
          ========================================================== */}

          {ai.possibleCauses?.length > 0 && (
            <Section title="Possible Causes">
              <BulletList items={ai.possibleCauses} />
            </Section>
          )}

          {/* =========================================================
              ALTERNATIVE DIAGNOSES
          ========================================================== */}

          {ai.alternativeDiagnoses?.length > 0 && (
            <Section title="Alternative Possibilities">
              <div className="space-y-2">
                {ai.alternativeDiagnoses.map((alt, i) => {
                  const probability = normalizePercentage(
                    alt.probability
                  );

                  return (
                    <div
                      key={i}
                      className="text-sm bg-slate-50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-700">
                          {alt.name || "Unknown diagnosis"}
                        </p>

                        {probability !== null && (
                          <span className="text-slate-400 text-xs font-medium">
                            {probability}%
                          </span>
                        )}
                      </div>

                      {alt.category && (
                        <p className="text-xs text-slate-400 mt-1">
                          Category: {alt.category}
                        </p>
                      )}

                      {alt.whyPossible && (
                        <p className="text-slate-500 text-xs mt-1">
                          Why possible: {alt.whyPossible}
                        </p>
                      )}

                      {alt.howToDifferentiate && (
                        <p className="text-slate-400 text-xs mt-1">
                          How to tell apart:{" "}
                          {alt.howToDifferentiate}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* =========================================================
              LOCATION & CLIMATE
          ========================================================== */}

          {(location.region ||
            location.agriculturalContext ||
            location.climateFactors?.length ||
            location.locationSpecificRisks?.length) && (
            <Section title="Location & Climate Context">
              {location.region && (
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Region: {location.region}
                </p>
              )}

              {location.agriculturalContext && (
                <p className="text-sm text-slate-600 mb-2">
                  {location.agriculturalContext}
                </p>
              )}

              {location.climateFactors?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Climate factors
                  </p>

                  <BulletList items={location.climateFactors} />
                </div>
              )}

              {location.locationSpecificRisks?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Location specific risks
                  </p>

                  <BulletList
                    items={location.locationSpecificRisks}
                  />
                </div>
              )}
            </Section>
          )}

          {/* =========================================================
              RECOMMENDED ACTIONS
          ========================================================== */}

          <Section title="Recommended Actions">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Immediate
                </p>

                <BulletList
                  items={ai.recommendedActions?.immediate}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Treatment
                </p>

                <BulletList
                  items={ai.recommendedActions?.treatment}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Prevention
                </p>

                <BulletList
                  items={ai.recommendedActions?.prevention}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Monitoring
                </p>

                <BulletList
                  items={ai.recommendedActions?.monitoring}
                />
              </div>
            </div>
          </Section>

          {/* =========================================================
              TREATMENT DETAILS
          ========================================================== */}

          {(treatment.recommendedApproach ||
            treatment.biologicalControl?.length ||
            treatment.chemicalControl?.length ||
            treatment.culturalPractices?.length ||
            treatment.soilAndWaterManagement?.length ||
            treatment.precautions?.length) && (
            <Section title="Treatment Plan Detail">
              {treatment.recommendedApproach && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-emerald-700 mb-1">
                    Recommended approach
                  </p>

                  <p className="text-sm text-emerald-800">
                    {treatment.recommendedApproach}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {treatment.biologicalControl?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Biological control
                    </p>

                    <BulletList
                      items={treatment.biologicalControl}
                    />
                  </div>
                )}

                {treatment.chemicalControl?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Chemical control
                    </p>

                    <BulletList
                      items={treatment.chemicalControl}
                    />
                  </div>
                )}

                {treatment.culturalPractices?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Cultural practices
                    </p>

                    <BulletList
                      items={treatment.culturalPractices}
                    />
                  </div>
                )}

                {treatment.soilAndWaterManagement?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Soil &amp; water management
                    </p>

                    <BulletList
                      items={treatment.soilAndWaterManagement}
                    />
                  </div>
                )}
              </div>

              {treatment.precautions?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Precautions
                  </p>

                  <BulletList items={treatment.precautions} />
                </div>
              )}
            </Section>
          )}

          {/* =========================================================
              FARMER CHECKS
          ========================================================== */}

          {ai.farmerChecks?.length > 0 && (
            <Section title="Checks for the Farmer">
              <div className="space-y-2">
                {ai.farmerChecks.map((check, i) => (
                  <div
                    key={i}
                    className="text-sm bg-slate-50 rounded-lg p-3"
                  >
                    {check.check && (
                      <p className="font-medium text-slate-700">
                        {check.check}
                      </p>
                    )}

                    {check.whatToLookFor && (
                      <p className="text-slate-500 text-xs mt-1">
                        Look for: {check.whatToLookFor}
                      </p>
                    )}

                    {check.whyItMatters && (
                      <p className="text-slate-400 text-xs mt-1">
                        Why it matters: {check.whyItMatters}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* =========================================================
              EXPERT VERIFICATION
          ========================================================== */}

          {ai.whenToSeekExpertHelp && (
            <Section title="When to Seek Expert Help">
              <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                {ai.whenToSeekExpertHelp}
              </p>
            </Section>
          )}

          {/* =========================================================
              ADDITIONAL INFORMATION NEEDED
          ========================================================== */}

          {ai.additionalInformationNeeded?.length > 0 && (
            <Section title="Additional Information Needed">
              <BulletList
                items={ai.additionalInformationNeeded}
              />
            </Section>
          )}

          {/* =========================================================
              RESEARCH BASIS
          ========================================================== */}

          {ai.researchBasis?.length > 0 && (
            <Section title="Reference Basis">
              <div className="space-y-2">
                {ai.researchBasis.map((research, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      {research.source || "Source"}
                    </p>

                    {research.keyFinding && (
                      <p className="text-xs text-slate-500 mt-1">
                        {research.keyFinding}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* =========================================================
              DIAGNOSTIC LIMITATIONS
          ========================================================== */}

          {ai.diagnosticLimitations && (
            <Section title="Diagnostic Limitations">
              <p className="text-sm text-slate-500 italic bg-slate-50 rounded-lg p-3">
                {ai.diagnosticLimitations}
              </p>
            </Section>
          )}

          {/* =========================================================
              RAW AI DATA - OPTIONAL DEBUG SECTION
          ========================================================== */}

          {import.meta.env.DEV && (
            <Section title="Developer Debug — AI Output">
              <details className="bg-slate-900 rounded-lg overflow-hidden">
                <summary className="cursor-pointer text-xs text-white px-4 py-3">
                  View raw AI JSON
                </summary>

                <pre className="text-xs text-slate-200 p-4 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(ai, null, 2)}
                </pre>
              </details>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}