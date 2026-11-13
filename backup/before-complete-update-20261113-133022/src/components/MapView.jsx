import {
  MapContainer,
  TileLayer,
  LayersControl,
  CircleMarker,
  Popup,
  ScaleControl
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function MapView() {
  return (
    <div className="real-map">
      <MapContainer
        center={[6.0, -76.8]}
        zoom={8}
        scrollWheelZoom={true}
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
        </LayersControl>

        <CircleMarker
          center={[6.0, -76.8]}
          radius={7}
          pathOptions={{
            color: "#48d6d0",
            fillColor: "#48d6d0",
            fillOpacity: 0.85,
            weight: 2
          }}
        >
          <Popup>
            <strong>Atrato River Basin</strong>
            <br />
            Approximate map focus.
            <br />
            Official study boundaries are pending.
          </Popup>
        </CircleMarker>

        <ScaleControl position="bottomleft" />
      </MapContainer>

      <div className="map-data-status">
        <span className="status-dot" />
        Basemap available · Scientific layers pending
      </div>
    </div>
  );
}
