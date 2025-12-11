"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useMemo, useRef } from "react";

// Fix Leaflet's default icon path issues in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: string, lng: string) => void;
}

function DraggableMarker({ onLocationChange, position }: { onLocationChange: (lat: string, lng: string) => void; position: [number, number] }) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onLocationChange(lat.toString(), lng.toString());
        }
      },
    }),
    [onLocationChange]
  );

  return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={customIcon} />;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LeafletMap({ latitude, longitude, onLocationChange }: MapProps) {
  const center: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      className="w-full h-full z-0"
      dragging={false} // Disable map dragging as requested
      doubleClickZoom={false} // Disable double click zoom
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DraggableMarker onLocationChange={onLocationChange} position={center} />
      <MapUpdater center={center} />
    </MapContainer>
  );
}
