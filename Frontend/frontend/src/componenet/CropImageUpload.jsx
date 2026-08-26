import { useState, useRef } from "react";
import { Upload, X, AlertCircle } from "lucide-react";

export default function CropImageUpload({
  imageFile,
  imagePreview,
  onImageSelect,
  onImageRemove,
  error,
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return "Please upload JPG, PNG, or WEBP image only.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size should be less than 5MB.";
    }
    return null;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        onImageSelect(null, validationError);
      } else {
        onImageSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        onImageSelect(null, validationError);
      } else {
        onImageSelect(file);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Crop Photo</h2>
      <p className="text-slate-500 mb-6">
        Take or upload a clear photo of the affected leaf, stem, fruit, or plant.
      </p>

      {imagePreview ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
            <img
              src={imagePreview}
              alt="Crop preview"
              className="w-full h-64 sm:h-80 object-cover"
            />
            <button
              type="button"
              onClick={() => onImageRemove()}
              className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 mb-2">
              <span className="font-semibold">File name:</span> {imageFile.name}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">File size:</span> {formatFileSize(imageFile.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 border-2 border-slate-300 hover:border-emerald-400 text-slate-600 hover:text-emerald-600 font-medium rounded-xl transition-colors"
          >
            Change Image
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-emerald-500 bg-emerald-50/50"
              : "border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-700 mb-2">
            Drag and drop your image here
          </p>
          <p className="text-sm text-slate-500 mb-4">or click to select a file</p>
          <p className="text-xs text-slate-400">
            Supported formats: JPG, PNG, WEBP (Max 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileInput}
        className="hidden"
        aria-label="Upload crop image"
      />

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <span className="font-semibold">Tip:</span> Take a clear photo in good lighting. Make sure the
          affected area is visible.
        </p>
      </div>
    </div>
  );
}
