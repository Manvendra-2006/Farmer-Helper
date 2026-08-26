import { AlertCircle, Check } from "lucide-react";

const SYMPTOMS_LIST = [
  "Yellow leaves",
  "Brown spots",
  "Black spots",
  "White patches",
  "Leaf curling",
  "Leaf holes",
  "Wilting",
  "Dry leaves",
  "Leaf dropping",
  "Stunted growth",
  "Stem damage",
  "Fruit damage",
  "Root damage",
  "Insects visible",
  "Webbing visible",
  "Powder-like coating",
  "Rotten parts",
  "Unusual color",
  "Other",
];

export default function SymptomsSelector({
  selectedSymptoms,
  onSymptomToggle,
  description,
  onDescriptionChange,
  errors,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Symptoms</h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          Select all that apply
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SYMPTOMS_LIST.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => onSymptomToggle(symptom)}
                className={`relative px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 text-left ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                }`}
              >
                {isSelected && (
                  <Check className="absolute top-2 right-2 w-4 h-4 text-emerald-600" />
                )}
                <span className="pr-4">{symptom}</span>
              </button>
            );
          })}
        </div>
        {errors?.symptoms && (
          <p className="text-xs text-red-600 mt-2">{errors.symptoms}</p>
        )}
      </div>

      <div className="mt-8">
        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
          Describe what you see
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Example: Leaves are turning yellow from the edges and small brown spots are appearing."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all resize-none"
          rows="4"
        />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <span className="font-semibold">Tip:</span> The more symptoms you describe, the
          more accurate our analysis will be.
        </p>
      </div>
    </div>
  );
}
