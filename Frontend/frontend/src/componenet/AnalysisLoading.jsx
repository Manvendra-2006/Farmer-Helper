import { Loader2, Zap, Eye, Stethoscope, TrendingUp } from "lucide-react";

export default function AnalysisLoading() {
  const stages = [
    { icon: Eye, label: "Examining crop photo..." },
    { icon: Stethoscope, label: "Checking symptoms..." },
    { icon: TrendingUp, label: "Analyzing regional crop risks..." },
    { icon: Zap, label: "Preparing recommendations..." },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
              Analyzing Your Crop
            </h1>
            <p className="text-slate-500 text-lg">
              Please wait while we examine your crop photo and data...
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border-l-4 border-emerald-500 animate-pulse"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <Icon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <p className="text-slate-700 font-medium">{stage.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
            <p className="text-sm text-emerald-900 mb-3">
              ⏱️ <span className="font-semibold">This usually takes 30-60 seconds.</span>
            </p>
            <p className="text-xs text-emerald-700">
              Our AI is analyzing your crop photo and information to provide accurate
              disease identification and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
