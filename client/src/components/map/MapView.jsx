import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's broken default icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored marker by resource type
export const getMarkerIcon = (type) => {
  const colors = {
    therapist: "#14b8a6",
    hotline:   "#f43f5e",
    hospital:  "#6366f1",
    ngo:       "#f59e0b",
    online:    "#8b5cf6",
  };
  const color = colors[type] || "#14b8a6";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px; height:32px; border-radius:50% 50% 50% 0;
      background:${color}; transform:rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
};

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 13); }, [center]);
  return null;
}

export default function MapView({ resources = [], center, onResourceClick }) {
  return (
    <MapContainer
      center={center || [20.5937, 78.9629]} // India default
      zoom={5}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <RecenterMap center={center} />}
      {resources.map((r) => (
        <Marker
          key={r._id}
          position={[r.location.coordinates[1], r.location.coordinates[0]]}
          icon={getMarkerIcon(r.type)}
        >
          <Popup>
            <div className="p-1 min-w-[160px]">
              <p className="font-semibold text-sm">{r.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{r.type}</p>
              <button
                onClick={() => onResourceClick(r._id)}
                className="mt-2 text-xs text-primary-600 font-medium hover:underline"
              >
                View details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}