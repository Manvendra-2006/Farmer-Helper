// Requires: npm install react-leaflet leaflet
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { normalizeSeverity, SEVERITY_COLORS } from "./severity";

const DEFAULT_CENTER = [21.2787, 81.8661]; // Chhattisgarh, used when no analyses have a location yet

export default function HotspotMap({ analyses }) {
  const withLocation = analyses.filter(
    (a) => a.addLocation?.coordinates?.length === 2
  );

  const center =
    withLocation.length > 0
      ? [
          withLocation.reduce(
            (sum, a) => sum + a.addLocation.coordinates[1],
            0
          ) / withLocation.length,
          withLocation.reduce(
            (sum, a) => sum + a.addLocation.coordinates[0],
            0
          ) / withLocation.length,
        ]
      : DEFAULT_CENTER;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 h-80">
      <MapContainer
        center={center}
        zoom={withLocation.length > 0 ? 10 : 7}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withLocation.map((a) => {
          const severity = normalizeSeverity(a);
          const [lng, lat] = a.addLocation.coordinates;
          return (
            <CircleMarker
              key={a._id}
              center={[lat, lng]}
              radius={severity === "Critical" || severity === "High" ? 9 : 6}
              pathOptions={{
                color: SEVERITY_COLORS[severity],
                fillColor: SEVERITY_COLORS[severity],
                fillOpacity: 0.7,
              }}
            >
              <Popup>
                <p className="font-semibold">{a.cropName}</p>
                <p className="text-sm">
                  {a.aianalysis?.summary?.primaryDiagnosis || "No diagnosis"}
                </p>
                <p className="text-xs text-slate-500">
                  {a.addLocation.formattedAddress}
                </p>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}