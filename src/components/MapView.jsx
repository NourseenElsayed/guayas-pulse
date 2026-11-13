import {
  MapContainer,
  TileLayer,
  LayersControl,
  CircleMarker,
  Popup,
  ScaleControl,
  GeoJSON
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const isFeatureCollection = (value) =>
  value?.type === "FeatureCollection" &&
  Array.isArray(value.features);

export default function MapView({
  areas,
  inundation,
  height = "100%"
}) {
  const areaData = isFeatureCollection(areas)
    ? areas
    : null;

  const floodData = isFeatureCollection(inundation)
    ? inundation
    : null;

  return (
    <div className="real-map" style={{ height }}>
      <MapContainer
        center={[6.0, -76.8]}
        zoom={8}
        scrollWheelZoom
        className="leaflet-map"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite Imagery">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {areaData && (
            <LayersControl.Overlay checked name="Study Areas">
              <GeoJSON
                key={JSON.stringify(areaData)}
                data={areaData}
                style={{
                  color: "#48d6d0",
                  weight: 2,
                  fillOpacity: 0.08
                }}
              />
            </LayersControl.Overlay>
          )}

          {floodData && (
            <LayersControl.Overlay checked name="Inundation Areas">
              <GeoJSON
                key={JSON.stringify(floodData)}
                data={floodData}
                style={{
                  color: "#55a9db",
                  weight: 2,
                  fillColor: "#2389c7",
                  fillOpacity: 0.35
                }}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {!areaData && (
          <CircleMarker
            center={[6.0, -76.8]}
            radius={7}
            pathOptions={{
              color: "#48d6d0",
              fillColor: "#48d6d0",
              fillOpacity: 0.85
            }}
          >
            <Popup>
              Atrato River Basin.
              Approximate map focus only.
              Official study boundaries are pending.
            </Popup>
          </CircleMarker>
        )}

        <ScaleControl position="bottomleft" />
      </MapContainer>

      <div className="map-data-status">
        <span className="status-dot" />
        Basemap available · Scientific layers {
          areaData || floodData ? "loaded" : "awaiting data"
        }
      </div>
    </div>
  );
}
