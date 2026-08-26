import { useState } from "react";
import { ChevronDown } from "lucide-react";

const CROP_OPTIONS = [
  "Wheat",
  "Rice",
  "Maize",
  "Tomato",
  "Potato",
  "Soybean",
  "Cotton",
  "Chilli",
  "Mustard",
  "Other",
];

const CROP_USE_OPTIONS = ["Food", "Fodder", "Fiber", "Oilseed", "Commercial", "Other"];

const SEASON_OPTIONS = ["Kharif", "Rabi", "Zaid", "Summer", "Winter", "Other"];

export default function CropInformationForm({
  cropName,
  cropTypeUse,
  cropTypeSeason,
  onCropNameChange,
  onCropUseChange,
  onSeasonChange,
  errors,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchCrop, setSearchCrop] = useState("");

  const filteredCrops = CROP_OPTIONS.filter((crop) =>
    crop.toLowerCase().includes(searchCrop.toLowerCase())
  );

  const CustomDropdown = ({ label, value, options, onChange, error, fieldName }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
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
            {fieldName === "crop" && (
              <input
                type="text"
                placeholder="Search crops..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full px-4 py-2 border-b border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-t-lg"
              />
            )}
            {(fieldName === "crop" ? filteredCrops : options).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpenDropdown(null);
                  setSearchCrop("");
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
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Crop Information</h2>

      <div className="space-y-6">
        <CustomDropdown
          label="Crop Name"
          value={cropName}
          options={filteredCrops}
          onChange={onCropNameChange}
          error={errors?.cropName}
          fieldName="crop"
        />

        <CustomDropdown
          label="Crop Use"
          value={cropTypeUse}
          options={CROP_USE_OPTIONS}
          onChange={onCropUseChange}
          error={errors?.cropTypeUse}
          fieldName="use"
        />

        <CustomDropdown
          label="Growing Season"
          value={cropTypeSeason}
          options={SEASON_OPTIONS}
          onChange={onSeasonChange}
          error={errors?.cropTypeSeason}
          fieldName="season"
        />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ℹ️ <span className="font-semibold">Info:</span> This helps us provide region and
          season-specific crop disease analysis.
        </p>
      </div>
    </div>
  );
}
