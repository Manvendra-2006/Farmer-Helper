import { useState, useEffect } from "react";
import { MapPin, Loader2, AlertCircle, MapPinOff } from "lucide-react";

export default function LocationPicker({
  latitude,
  longitude,
  formattedAddress,
  onLocationSelect,
  onAddressChange,
  error,
}) {
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [manualEntry, setManualEntry] = useState(!latitude || !longitude);

  const getLocation = () => {
    setLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        onLocationSelect(lat, lon);
        reverseGeocode(lat, lon);
        setManualEntry(false);
        setLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission was denied. Please enable it in your browser settings.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError("Location information is not available. Please try again.");
        } else {
          setLocationError("Unable to get your location. Please try again.");
        }
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();      
      const address = data.address?.city || data.address?.town || data.address?.county || "Location detected";
      
      onAddressChange(address);
    } catch (err) {
      console.error("Geocoding failed:", err);
      // Keep coordinates without address name
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Farm Location</h2>

      {!manualEntry && latitude && longitude ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 flex gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Location detected successfully</p>
              <p className="text-sm text-emerald-700 mt-1">
                {formattedAddress || `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setManualEntry(true)}
            className="w-full py-3 px-4 border-2 border-slate-300 hover:border-emerald-400 text-slate-600 hover:text-emerald-600 font-medium rounded-xl transition-colors"
          >
            Enter Location Manually
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={getLocation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Getting your location...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                Use My Current Location
              </>
            )}
          </button>

          {(locationError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Location error</p>
                <p className="text-sm text-red-700 mt-1">{locationError || error}</p>
              </div>
            </div>
          )}

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-300"></div>
            <span className="text-sm text-slate-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-300"></div>
          </div>

          <input
            type="text"
            value={formattedAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Enter your location or district name"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
          />
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ℹ️ <span className="font-semibold">Info:</span> Location helps us provide
          region-specific crop disease risks and recommendations.
        </p>
      </div>
    </div>
  );
}
