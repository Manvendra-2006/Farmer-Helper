import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, LogOut, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import api from "../../axios/analysis.axios";
import CropImageUpload from "../componenet/CropImageUpload";
import CropInformationForm from "../componenet/CropInformationForm";
import CropConditionForm from "../componenet/CropConditionForm";
import SymptomsSelector from "../componenet/SymptomsSelector";
import LocationPicker from "../componenet/LocationPicker";
import AnalysisLoading from "../componenet/AnalysisLoading";
import AnalysisResult from "../componenet/AnalysisResult";

export default function CropHealthAnalysis() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [cropName, setCropName] = useState("");
  const [cropTypeUse, setCropTypeUse] = useState("");
  const [cropTypeSeason, setCropTypeSeason] = useState("");
  const [soilType, setSoilType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [locationError, setLocationError] = useState("");
  const [additionalDescription, setAdditionalDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const handleImageSelect = (file, err = null) => {
    if (err) {
      setImageError(err);
      return;
    }
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setImageError("");
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
  };


  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };


  const handleLocationSelect = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!imageFile) errors.image = "Please upload a crop photo.";
    if (!cropName) errors.cropName = "Please select a crop name.";
    if (!cropTypeUse) errors.cropTypeUse = "Please select crop use.";
    if (!cropTypeSeason) errors.cropTypeSeason = "Please select growing season.";
    if (!soilType) errors.soilType = "Please select soil type.";
    if (!growthStage) errors.growthStage = "Please select growth stage.";
    if (!affectedArea) errors.affectedArea = "Please select affected area.";
    if (selectedSymptoms.length === 0) errors.symptoms = "Please select at least one symptom.";
    if (!latitude || !longitude) errors.location = "Please provide your farm location.";
    if (!formattedAddress) errors.address = "Please enter or use your location.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("cropName", cropName);
      formData.append("cropTypeUse", cropTypeUse);
      formData.append("cropTypeSeason", cropTypeSeason);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("soilType", soilType);
      formData.append("growthStage", growthStage);
      formData.append("symptoms", selectedSymptoms.join(", "));
      formData.append("affectedArea", affectedArea);
      formData.append("description", additionalDescription || description);
      formData.append("formattedAddress", formattedAddress);

      console.log("Submitting crop analysis...");
      const response = await api.post("/farmer/analysis", formData, {
        withCredentials: true,
        headers: {
        },
      });

      console.log("Analysis response:", response.data);
      setAnalysisResult(response.data.analysis);
    } catch (err) {
      console.error("Analysis error:", err.response?.data || err.message);
      const status = err.response?.status;

      if (status === 400) {
        setError(
          "Please provide the crop information. " +
          (err.response?.data?.message || "")
        );
      } else if (status === 401) {
        setError("Session expired. Please log in again.");
      } else if (status === 403) {
        setError("You don't have permission to analyze crops.");
      } else if (status === 500) {
        setError("Crop analysis could not be completed right now. Please try again.");
      } else if (!err.response) {
        setError("We could not connect to the analysis service. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const handleNewAnalysis = () => {
    setImageFile(null);
    setImagePreview(null);
    setCropName("");
    setCropTypeUse("");
    setCropTypeSeason("");
    setSoilType("");
    setGrowthStage("");
    setAffectedArea("");
    setSelectedSymptoms([]);
    setDescription("");
    setLatitude(null);
    setLongitude(null);
    setFormattedAddress("");
    setAdditionalDescription("");
    setAnalysisResult(null);
    setValidationErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (analysisResult) {
    return <AnalysisResult analysis={analysisResult} onNewAnalysis={handleNewAnalysis} />;
  }

  if (loading) {
    return <AnalysisLoading />;
  }


  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-green-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-emerald-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-600" />
          <span className="font-semibold text-slate-800">Crop Health Analysis</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-10">      
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
            AI Crop Health Analysis
          </h1>
          <p className="text-slate-600 text-lg">
            Get instant diagnosis and recommendations for your crop health issues
          </p>
        </div>
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Unable to analyze crop</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8 mb-10">       
          <CropImageUpload
            imageFile={imageFile}
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            error={imageError || validationErrors.image}
          />
       
          <CropInformationForm
            cropName={cropName}
            cropTypeUse={cropTypeUse}
            cropTypeSeason={cropTypeSeason}
            onCropNameChange={setCropName}
            onCropUseChange={setCropTypeUse}
            onSeasonChange={setCropTypeSeason}
            errors={validationErrors}
          />
      
          <CropConditionForm
            soilType={soilType}
            growthStage={growthStage}
            affectedArea={affectedArea}
            onSoilTypeChange={setSoilType}
            onGrowthStageChange={setGrowthStage}
            onAffectedAreaChange={setAffectedArea}
            errors={validationErrors}
          />
       
          <SymptomsSelector
            selectedSymptoms={selectedSymptoms}
            onSymptomToggle={handleSymptomToggle}
            description={description}
            onDescriptionChange={setDescription}
            errors={validationErrors}
          />
        
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            formattedAddress={formattedAddress}
            onLocationSelect={handleLocationSelect}
            onAddressChange={setFormattedAddress}
            error={locationError || validationErrors.location || validationErrors.address}
          />
        
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Anything Else You Noticed?
            </h2>
            <p className="text-slate-500 mb-6">
              This helps us provide more accurate analysis
            </p>

            <textarea
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              placeholder="Tell us when the problem started, whether it is spreading, recent rainfall, irrigation changes, fertilizer use, pesticide use, or anything else you noticed."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all resize-none"
              rows="5"
            />
          </div>         
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-colors text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze My Crop"
              )}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-900">
                ✓ Your data is secure and encrypted
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
