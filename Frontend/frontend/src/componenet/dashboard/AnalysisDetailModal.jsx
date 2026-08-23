import { X, MapPin, Calendar, Layers } from "lucide-react";
import { SeverityBadge, normalizeSeverity } from "./severity";

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
  if (!items || items.length === 0) return <p className="text-sm text-slate-400">—</p>;
  return (
    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function AnalysisDetailModal({ analysis, onClose }) {
  if (!analysis) return null;

  const ai = analysis.aianalysis || {};
  const severity = normalizeSeverity(analysis);
  const details = ai.primaryDiagnosisDetails;
  const location = ai.locationAnalysis;
  const treatment = ai.treatmentDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{analysis.cropName}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {analysis.addLocation?.formattedAddress || "—"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(analysis.createdAt).toLocaleDateString("en-IN")}
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
            alt={analysis.cropName}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <SeverityBadge severity={severity} />
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
              {ai.summary?.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
              {analysis.cropTypeUse} · {analysis.cropTypeSeason}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
              {analysis.soilType} soil · {analysis.growthStage}
            </span>
            {ai.summary?.confidence != null && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200">
                {ai.summary.confidence}% AI confidence
              </span>
            )}
          </div>

          <Section title="Diagnosis">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              {ai.summary?.primaryDiagnosis || "—"}{" "}
              {ai.summary?.category && (
                <span className="font-normal text-slate-500">
                  ({ai.summary.category})
                </span>
              )}
            </p>
            <p className="text-sm text-slate-600">{ai.summary?.shortExplanation}</p>
            {details?.simpleExplanation && (
              <p className="text-sm text-slate-500 mt-1">{details.simpleExplanation}</p>
            )}
          </Section>

          {details && (
            <Section title="Why this diagnosis">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Supporting signs</p>
                  <BulletList items={details.whyLikely} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Supporting evidence</p>
                  <BulletList items={details.supportingEvidence} />
                </div>
                {details.evidenceAgainst?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Evidence against</p>
                    <BulletList items={details.evidenceAgainst} />
                  </div>
                )}
              </div>
            </Section>
          )}

          <Section title="Reported symptoms">
            <p className="text-sm text-slate-600 mb-1">
              {analysis.symptoms} · affected area reported {analysis.affectedArea}%
              {ai.cropHealth?.affectedArea && ` (AI estimate ${ai.cropHealth.affectedArea})`}
            </p>
            <BulletList items={ai.cropHealth?.visibleSymptoms} />
          </Section>

          {analysis.description && (
            <Section title="Farmer's description">
              <p className="text-sm text-slate-600">{analysis.description}</p>
            </Section>
          )}

          {ai.possibleCauses?.length > 0 && (
            <Section title="Possible causes">
              <BulletList items={ai.possibleCauses} />
            </Section>
          )}

          {ai.alternativeDiagnoses?.length > 0 && (
            <Section title="Alternative possibilities">
              <div className="space-y-2">
                {ai.alternativeDiagnoses.map((alt, i) => (
                  <div key={i} className="text-sm bg-slate-50 rounded-lg p-3">
                    <p className="font-medium text-slate-700">
                      {alt.name} <span className="text-slate-400">({alt.probability}%)</span>
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{alt.whyPossible}</p>
                    {alt.howToDifferentiate && (
                      <p className="text-slate-400 text-xs mt-1">
                        How to tell apart: {alt.howToDifferentiate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {location && (
            <Section title="Location & climate context">
              <p className="text-sm text-slate-600 mb-1">{location.agriculturalContext}</p>
              {location.climateFactors?.length > 0 && (
                <p className="text-xs text-slate-500 mb-1">
                  Climate factors: {location.climateFactors.join(", ")}
                </p>
              )}
              {location.locationSpecificRisks?.length > 0 && (
                <BulletList items={location.locationSpecificRisks} />
              )}
            </Section>
          )}

          <Section title="Recommended actions">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Immediate
                </p>
                <BulletList items={ai.recommendedActions?.immediate} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Treatment</p>
                <BulletList items={ai.recommendedActions?.treatment} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Prevention</p>
                <BulletList items={ai.recommendedActions?.prevention} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Monitoring</p>
                <BulletList items={ai.recommendedActions?.monitoring} />
              </div>
            </div>
          </Section>

          {treatment && (
            <Section title="Treatment plan detail">
              {treatment.recommendedApproach && (
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Approach: {treatment.recommendedApproach}
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {treatment.biologicalControl?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Biological control</p>
                    <BulletList items={treatment.biologicalControl} />
                  </div>
                )}
                {treatment.chemicalControl?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Chemical control</p>
                    <BulletList items={treatment.chemicalControl} />
                  </div>
                )}
                {treatment.culturalPractices?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Cultural practices</p>
                    <BulletList items={treatment.culturalPractices} />
                  </div>
                )}
                {treatment.soilAndWaterManagement?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Soil &amp; water management
                    </p>
                    <BulletList items={treatment.soilAndWaterManagement} />
                  </div>
                )}
              </div>
              {treatment.precautions?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Precautions</p>
                  <BulletList items={treatment.precautions} />
                </div>
              )}
            </Section>
          )}

          {ai.farmerChecks?.length > 0 && (
            <Section title="Checks for the farmer">
              <div className="space-y-2">
                {ai.farmerChecks.map((c, i) => (
                  <div key={i} className="text-sm bg-slate-50 rounded-lg p-3">
                    <p className="font-medium text-slate-700">{c.check}</p>
                    <p className="text-slate-500 text-xs mt-1">Look for: {c.whatToLookFor}</p>
                    <p className="text-slate-400 text-xs mt-1">{c.whyItMatters}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {ai.whenToSeekExpertHelp && (
            <Section title="When to escalate">
              <p className="text-sm text-slate-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                {ai.whenToSeekExpertHelp}
              </p>
            </Section>
          )}

          {ai.additionalInformationNeeded?.length > 0 && (
            <Section title="Additional info that would help">
              <BulletList items={ai.additionalInformationNeeded} />
            </Section>
          )}

          {ai.researchBasis?.length > 0 && (
            <Section title="Reference basis">
              <div className="space-y-1">
                {ai.researchBasis.map((r, i) => (
                  <p key={i} className="text-xs text-slate-500">
                    <span className="font-medium">{r.source}:</span> {r.keyFinding}
                  </p>
                ))}
              </div>
            </Section>
          )}

          {ai.diagnosticLimitations && (
            <p className="text-xs text-slate-400 italic">{ai.diagnosticLimitations}</p>
          )}
        </div>
      </div>
    </div>
  );
}