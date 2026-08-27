import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./componenet/ProtectedRoute";
import Login from "./Pages/Login";
import SelectRole from "./Pages/SelectRole";
import Home from "./Pages/Home";
import CropHealthAnalysis from "./Pages/CropHealthAnalysis";
import CommandCenter from "./Pages/officer/CommandCenter";
import SelectDistrict from "./Pages/officer/SelectDistrict";
import DistrictReports from "./Pages/officer/DistrictReports"
import WeatherAnalytics from "./Pages/officer/WeatherAnalytics";
import MyReports from "./Pages/farmer/MyReports";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route
            path="/select-role"
            element={
              <ProtectedRoute requireRole={false}>
                <SelectRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
<Route
  path="/my-reports"
  element={
    <ProtectedRoute allowedRoles={["Farmer"]}>
      <MyReports />
    </ProtectedRoute>
  }
/>
          <Route
            path="/farmer"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
<Route
  path="/command-center/reports/:filter"
  element={
    <ProtectedRoute allowedRoles={["Officer"]}>
      <DistrictReports />
    </ProtectedRoute>
  }
/>
<Route
  path="/command-center/weather"
  element={
    <ProtectedRoute allowedRoles={["Officer","Farmer"]}>
      <WeatherAnalytics />
    </ProtectedRoute>
  }
/>
          <Route
            path="/expert"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/command-center" element={<ProtectedRoute allowedRoles={["Officer"]} requireDistrict><CommandCenter /></ProtectedRoute>} />
          <Route path="/officer/dashboard" element={<Navigate to="/command-center" replace />} />
          <Route path="/officer/select-district" element={<ProtectedRoute allowedRoles={["Officer"]}><SelectDistrict /></ProtectedRoute>} />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <CropHealthAnalysis />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}