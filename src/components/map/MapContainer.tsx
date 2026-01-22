"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import type { Parcelle } from "@/types";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapContainerProps {
  parcelles?: Parcelle[];
  onParcelleCreated?: (data: {
    geometry: { type: "Polygon"; coordinates: number[][][] };
    centroid: { lat: number; lng: number };
    areaHectares: number;
  }) => void;
  onParcelleClick?: (parcelle: Parcelle) => void;
  selectedParcelleId?: string | null;
  isDrawingMode?: boolean;
}

export function MapContainer({
  parcelles = [],
  onParcelleCreated,
  onParcelleClick,
  selectedParcelleId,
  isDrawingMode = false,
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const parcelleLayersRef = useRef<Map<string, L.Polygon>>(new Map());
  const drawHandlerRef = useRef<L.Draw.Polygon | null>(null);

  // Handle polygon creation
  const handlePolygonCreated = useCallback(
    (layer: L.Polygon) => {
      const geoJSON = layer.toGeoJSON() as GeoJSON.Feature<GeoJSON.Polygon>;
      const coordinates = geoJSON.geometry.coordinates;

      // Calculate area in hectares using turf.js
      const area = turf.area(geoJSON);
      const areaHectares = Math.round((area / 10000) * 100) / 100;

      // Calculate centroid
      const centroidFeature = turf.centroid(geoJSON);
      const centroid = {
        lng: centroidFeature.geometry.coordinates[0],
        lat: centroidFeature.geometry.coordinates[1],
      };

      if (onParcelleCreated) {
        onParcelleCreated({
          geometry: { type: "Polygon", coordinates },
          centroid,
          areaHectares,
        });
      }

      // Remove the drawn layer (will be re-added when saved)
      if (drawnItemsRef.current) {
        drawnItemsRef.current.removeLayer(layer);
      }
    },
    [onParcelleCreated]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centered on France
    const map = L.map(containerRef.current).setView([46.603354, 1.888334], 6);
    mapRef.current = map;

    // Base layers
    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
      }
    );

    satelliteLayer.addTo(map); // Default to satellite view for better field visualization

    // Layer control
    L.control
      .layers(
        {
          Satellite: satelliteLayer,
          Carte: osmLayer,
        },
        {},
        { position: "bottomright" }
      )
      .addTo(map);

    // Initialize feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle drawing mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isDrawingMode) {
      // Create and enable polygon draw handler
      const drawHandler = new L.Draw.Polygon(map as L.DrawMap, {
        allowIntersection: false,
        drawError: {
          color: "#ef4444",
          message: "<strong>Erreur</strong> Les lignes ne peuvent pas se croiser !",
        },
        shapeOptions: {
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.4,
          weight: 3,
        },
      });
      drawHandler.enable();
      drawHandlerRef.current = drawHandler;

      // Change cursor
      map.getContainer().style.cursor = "crosshair";
    } else {
      // Disable drawing
      if (drawHandlerRef.current) {
        drawHandlerRef.current.disable();
        drawHandlerRef.current = null;
      }
      // Reset cursor
      map.getContainer().style.cursor = "";
    }

    return () => {
      if (drawHandlerRef.current) {
        drawHandlerRef.current.disable();
        drawHandlerRef.current = null;
      }
    };
  }, [isDrawingMode]);

  // Handle draw events
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      if (event.layer instanceof L.Polygon) {
        handlePolygonCreated(event.layer);
      }
    };

    map.on(L.Draw.Event.CREATED, handleCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
    };
  }, [handlePolygonCreated]);

  // Display existing parcelles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old layers
    parcelleLayersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    parcelleLayersRef.current.clear();

    // Add parcelles to map
    parcelles.forEach((parcelle) => {
      const isSelected = parcelle.id === selectedParcelleId;
      const polygon = L.polygon(
        parcelle.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]),
        {
          color: isSelected ? "#3b82f6" : "#22c55e",
          fillColor: isSelected ? "#3b82f6" : "#22c55e",
          fillOpacity: isSelected ? 0.5 : 0.3,
          weight: isSelected ? 3 : 2,
        }
      );

      // Simple tooltip
      polygon.bindTooltip(parcelle.name, {
        permanent: true,
        direction: "center",
        className: "parcelle-label",
      });

      polygon.on("click", () => {
        if (onParcelleClick) {
          onParcelleClick(parcelle);
        }
      });

      polygon.addTo(map);
      parcelleLayersRef.current.set(parcelle.id, polygon);
    });

    // Fit bounds if parcelles exist and not first load
    if (parcelles.length > 0) {
      const allCoords: L.LatLngTuple[] = [];
      parcelles.forEach((p) => {
        p.geometry.coordinates[0].forEach(([lng, lat]) => {
          allCoords.push([lat, lng]);
        });
      });
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [parcelles, selectedParcelleId, onParcelleClick]);

  // Zoom to selected parcelle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedParcelleId) return;

    const layer = parcelleLayersRef.current.get(selectedParcelleId);
    if (layer) {
      map.fitBounds(layer.getBounds(), { padding: [100, 100], maxZoom: 16 });
    }
  }, [selectedParcelleId]);

  return (
    <>
      <style jsx global>{`
        .parcelle-label {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .parcelle-label::before {
          display: none;
        }
      `}</style>
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
