import { AlertCircle, CheckCircle, Zap, Leaf, Bug, Droplet, Shield, MapPin, RefreshCw, Eye } from "lucide-react";

// Result Card Components
export function DiagnosisCard({ diagnosis }) {
  const severityColors = {
    Critical: "bg-red-50 border-red-200 text-red-900",
    High: "bg-orange-50 border-orange-200 text-orange-900",
    Medium: "bg-yellow-50 border-yellow-200 text-yellow-900",
    Low: "bg-green-50 border-green-200 text-green-900",
  };

  const severityClass =
    severityColors[diagnosis.severity] || severityColors.Medium;

  return (
    <div className={`border-2 rounded-2xl p-6 sm:p-8 ${severityClass}`}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">{diagnosis.primaryDiagnosis}</h2>
      <div className="grid sm:grid-cols-3 gap-4 text-sm font-semibold mb-4">
        <div>
          <p className="opacity-75">Category</p>
          <p className="text-lg">{diagnosis.category}</p>
        </div>
        <div>
          <p className="opacity-75">Severity</p>
          <p className="text-lg">{diagnosis.severity}</p>
        </div>
        <div>
          <p className="opacity-75">Confidence</p>
          <p className="text-lg">{diagnosis.confidence}%</p>
        </div>
      </div>
      <div className="bg-white/40 rounded-lg p-3 backdrop-blur">
        <p className="text-sm">{diagnosis.shortExplanation}</p>
      </div>
    </div>
  );
}

export function SymptomCard({ symptoms }) {
  if (!symptoms || symptoms.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Eye className="w-6 h-6 text-emerald-600" />
        Visible Symptoms
      </h3>
      <div className="flex flex-wrap gap-2">
        {symptoms.map((symptom, idx) => (
          <span
            key={idx}
            className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium"
          >
            {symptom}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ExplanationCard({ explanation }) {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-blue-900 mb-4">Why We Think This</h3>
      <p className="text-blue-800 leading-relaxed">{explanation}</p>
    </div>
  );
}

export function CausesCard({ causes }) {
  if (!causes || causes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Zap className="w-6 h-6 text-amber-600" />
        Possible Causes
      </h3>
      <ul className="space-y-3">
        {causes.map((cause, idx) => (
          <li key={idx} className="flex gap-3 text-slate-700">
            <span className="text-amber-600 font-bold shrink-0 w-6">•</span>
            <span>{cause}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ImmediateActionsCard({ actions }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
        <AlertCircle className="w-6 h-6" />
        Immediate Actions
      </h3>
      <ol className="space-y-3">
        {actions.map((action, idx) => (
          <li key={idx} className="flex gap-3 text-red-900">
            <span className="font-bold bg-red-200 text-red-900 rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
              {idx + 1}
            </span>
            <span className="pt-0.5">{action}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TreatmentCard({ treatment }) {
  if (!treatment) return null;

  const sections = [
    { key: "biologicalControl", icon: Leaf, label: "Biological Control", color: "green" },
    { key: "chemicalControl", icon: Bug, label: "Chemical Control", color: "orange" },
    { key: "culturalPractices", icon: Droplet, label: "Cultural Practices", color: "blue" },
    { key: "soilAndWaterManagement", icon: Droplet, label: "Soil & Water Management", color: "cyan" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Treatment Options</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((section) => {
          const content = treatment[section.key];
          if (!content || (Array.isArray(content) && content.length === 0)) {
            return null;
          }

          const Icon = section.icon;
          const colorClasses = {
            green: "bg-green-50 border-green-200",
            orange: "bg-orange-50 border-orange-200",
            blue: "bg-blue-50 border-blue-200",
            cyan: "bg-cyan-50 border-cyan-200",
          };

          return (
            <div
              key={section.key}
              className={`border-2 rounded-lg p-4 ${colorClasses[section.color]}`}
            >
              <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5" />
                {section.label}
              </h4>
              {Array.isArray(content) ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {content.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-emerald-600 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-700">{content}</p>
              )}
            </div>
          );
        })}
      </div>
      {treatment.precautions && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900 font-semibold mb-2">⚠️ Precautions:</p>
          <p className="text-sm text-yellow-800">{treatment.precautions}</p>
        </div>
      )}
    </div>
  );
}

export function PreventionCard({ prevention }) {
  if (!prevention || prevention.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-green-600" />
        Prevention
      </h3>
      <div className="space-y-3">
        {prevention.map((step, idx) => (
          <div key={idx} className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-slate-700">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FarmerChecksCard({ checks }) {
  if (!checks || checks.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Eye className="w-6 h-6 text-indigo-600" />
        What To Check Next
      </h3>
      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div key={idx} className="flex gap-3 p-3 bg-indigo-50 rounded-lg">
            <span className="text-indigo-600 font-bold shrink-0">→</span>
            <div className="text-slate-700">
              <p className="font-medium">{check.check}</p>
              {check.whatToLookFor && <p className="text-sm mt-1">{check.whatToLookFor}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpertHelpCard({ message }) {
  if (!message) return null;

  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-6 h-6" />
        When To Contact An Expert
      </h3>
      <p className="text-purple-800 mb-4">{message}</p>
      <div className="bg-white/50 rounded-lg p-3 text-sm text-purple-900">
        <p className="font-semibold mb-2">You can contact:</p>
        <ul className="space-y-1 text-sm">
          <li>• Agriculture Officer</li>
          <li>• Agricultural Expert</li>
          <li>• Plant Pathologist</li>
          <li>• Local Extension Worker</li>
          <li>• Laboratory</li>
        </ul>
      </div>
    </div>
  );
}

export function LocationAnalysisCard({ locationAnalysis, formattedAddress }) {
  if (!locationAnalysis) return null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-emerald-600" />
        Region Analysis
      </h3>
      <div className="space-y-3">
        {formattedAddress && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-slate-600">Your Region</p>
            <p className="font-semibold text-emerald-900">{formattedAddress}</p>
          </div>
        )}
        {locationAnalysis.climate && (
          <div>
            <p className="font-semibold text-slate-800 mb-2">Climate Information</p>
            <p className="text-slate-700 text-sm">{locationAnalysis.climate}</p>
          </div>
        )}
        {locationAnalysis.regionalRisks && (
          <div>
            <p className="font-semibold text-slate-800 mb-2">Regional Crop Risks</p>
            <p className="text-slate-700 text-sm">{locationAnalysis.regionalRisks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function DiagnosticLimitationsCard({ limitations }) {
  if (!limitations) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-amber-900 mb-3">Important Note</h3>
      <p className="text-amber-800 text-sm leading-relaxed">{limitations}</p>
    </div>
  );
}

export default function AnalysisResult({ analysis, onNewAnalysis }) {
  const ai = analysis?.aianalysis;

  if (!ai) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <p className="text-red-900 font-semibold">No analysis data available.</p>
      </div>
    );
  }

  const summary = ai.summary || {};
  const cropHealth = ai.cropHealth || {};

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
            Your Crop Health Report
          </h1>
          <p className="text-slate-600 text-lg">
            Detailed analysis for {analysis.cropName} on{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Primary Diagnosis */}
        {summary && <DiagnosisCard diagnosis={summary} />}

        {/* Explanation */}
        {summary.shortExplanation && (
          <ExplanationCard explanation={summary.shortExplanation} />
        )}

        {/* Visible Symptoms */}
        {cropHealth.visibleSymptoms && (
          <SymptomCard symptoms={cropHealth.visibleSymptoms} />
        )}

        {/* Possible Causes */}
        {ai.possibleCauses && <CausesCard causes={ai.possibleCauses} />}

        {/* Immediate Actions */}
        {ai.recommendedActions?.immediate && (
          <ImmediateActionsCard actions={ai.recommendedActions.immediate} />
        )}

        {/* Treatment */}
        {ai.treatmentDetails && <TreatmentCard treatment={ai.treatmentDetails} />}

        {/* Prevention */}
        {ai.recommendedActions?.prevention && (
          <PreventionCard prevention={ai.recommendedActions.prevention} />
        )}

        {/* Farmer Checks */}
        {ai.farmerChecks && <FarmerChecksCard checks={ai.farmerChecks} />}

        {/* Location Analysis */}
        {(ai.locationAnalysis || analysis.addLocation?.formattedAddress) && (
          <LocationAnalysisCard
            locationAnalysis={ai.locationAnalysis}
            formattedAddress={analysis.addLocation?.formattedAddress}
          />
        )}

        {/* Expert Help */}
        {ai.whenToSeekExpertHelp && (
          <ExpertHelpCard message={ai.whenToSeekExpertHelp} />
        )}

        {/* Limitations */}
        {ai.diagnosticLimitations && (
          <DiagnosticLimitationsCard limitations={ai.diagnosticLimitations} />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNewAnalysis}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Analyze Another Crop
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-colors"
          >
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
