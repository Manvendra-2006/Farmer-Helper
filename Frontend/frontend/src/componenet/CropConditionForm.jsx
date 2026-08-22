import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SOIL_TYPE_OPTIONS = [
  "Sandy",
  "Clay",
  "Loamy",
  "Black Soil",
  "Red Soil",
  "Alluvial",
  "Laterite",
  "Other",
  "Don't Know",
];

const GROWTH_STAGE_OPTIONS = [
  "Seedling",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Grain Formation",
  "Maturity",
  "Harvest",
  "Don't Know",
];

const AFFECTED_AREA_OPTIONS = [
  "One plant",
  "Few plants",
  "Small area",
  "Large area",
  "Most of the field",
  "Entire field",
];

export default function CropConditionForm({
  soilType,
  growthStage,
  affectedArea,
  onSoilTypeChange,
  onGrowthStageChange,
  onAffectedAreaChange,
  errors,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const CustomDropdown = ({ label, value, options, onChange, error, fieldName, helperText }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {!fieldName.includes("area") && (
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        )}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
          className={`w-full px-4 py-3 text-left bg-white border-2 rounded-lg font-medium transition-all flex items-center justify-between ${
            error ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-emerald-400"
          }`}
        >
          <span className={value ? "text-slate-800" : "text-slate-400"}>
            {value || "Select..."}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${
              openDropdown === fieldName ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown === fieldName && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors font-medium ${
                  value === option ? "bg-emerald-100 text-emerald-700" : "text-slate-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      {helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Crop Condition</h2>

      <div className="space-y-6">
        <CustomDropdown
          label="Soil Type"
          value={soilType}
          options={SOIL_TYPE_OPTIONS}
          onChange={onSoilTypeChange}
          error={errors?.soilType}
          fieldName="soil"
          helperText="Don't know your soil type? Select 'Don't Know' and we'll provide general guidance."
        />

        <CustomDropdown
          label="Growth Stage"
          value={growthStage}
          options={GROWTH_STAGE_OPTIONS}
          onChange={onGrowthStageChange}
          error={errors?.growthStage}
          fieldName="growth"
          helperText="Select 'Don't Know' if you're unsure."
        />

        <CustomDropdown
          label="Affected Area"
          value={affectedArea}
          options={AFFECTED_AREA_OPTIONS}
          onChange={onAffectedAreaChange}
          error={errors?.affectedArea}
          fieldName="area"
          helperText="How much of your field is affected?"
        />
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          ⚠️ <span className="font-semibold">Note:</span> If you don't know some information,
          you can select "Don't Know" and we'll still provide helpful analysis.
        </p>
      </div>
    </div>
  );
}
