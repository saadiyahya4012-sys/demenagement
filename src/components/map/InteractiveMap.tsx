import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteGeometry } from '../../services/mapService';

interface InteractiveMapProps {
  pickupLocation?: { lat: number; lon: number; label: string } | null;
  dropoffLocation?: { lat: number; lon: number; label: string } | null;
  routeData?: RouteGeometry | null;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickupLocation,
  dropoffLocation,
  routeData,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Avoid double initialization in React StrictMode
    if ((mapContainerRef.current as any)._leaflet_id) {
      return;
    }

    // Center Morocco: [31.7917, -7.0926], zoom: 6
    const map = L.map(mapContainerRef.current, {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after layout renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Helper for pin icons
    const createCustomIcon = (bgColor: string, text: string) => {
      return L.divIcon({
        className: 'leaflet-custom-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: ${bgColor}; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; gap: 4px;">
              <span>${text}</span>
            </div>
            <div style="width: 14px; height: 14px; background-color: ${bgColor}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.35); margin-top: -2px;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });
    };

    // 1. Pickup Marker (Green)
    if (pickupLocation) {
      const latlng: L.LatLngExpression = [pickupLocation.lat, pickupLocation.lon];
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(latlng);
      } else {
        pickupMarkerRef.current = L.marker(latlng, {
          icon: createCustomIcon('#00A86B', '🟢 Départ'),
        }).addTo(map);
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // 2. Dropoff Marker (Red)
    if (dropoffLocation) {
      const latlng: L.LatLngExpression = [dropoffLocation.lat, dropoffLocation.lon];
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng(latlng);
      } else {
        dropoffMarkerRef.current = L.marker(latlng, {
          icon: createCustomIcon('#E11D48', '🔴 Arrivée'),
        }).addTo(map);
      }
    } else if (dropoffMarkerRef.current) {
      map.removeLayer(dropoffMarkerRef.current);
      dropoffMarkerRef.current = null;
    }

    // 3. Real Road Route Polyline
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      const polyline = L.polyline(routeData.coordinates, {
        color: '#00A86B',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), {
        padding: [60, 60],
        maxZoom: 14,
        animate: true,
      });
    } else {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      // Smooth camera to markers if available
      if (pickupLocation && dropoffLocation) {
        const bounds = L.latLngBounds(
          [pickupLocation.lat, pickupLocation.lon],
          [dropoffLocation.lat, dropoffLocation.lon]
        );
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
      } else if (pickupLocation) {
        map.flyTo([pickupLocation.lat, pickupLocation.lon], 12, { duration: 1.2 });
      } else if (dropoffLocation) {
        map.flyTo([dropoffLocation.lat, dropoffLocation.lon], 12, { duration: 1.2 });
      }
    }
  }, [pickupLocation, dropoffLocation, routeData]);

  return (
    <div className={`map-container ${className}`}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '450px',
          minHeight: '400px',
        }}
      />

      {/* Floating Status & OSRM Info */}
      {routeData && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/90 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#111111]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse" />
            <span>{routeData.distanceKm} km</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-xs font-bold text-slate-700">
            {Math.floor(routeData.durationMinutes / 60) > 0 ? (
              <span>
                {Math.floor(routeData.durationMinutes / 60)} h{' '}
                {routeData.durationMinutes % 60} min
              </span>
            ) : (
              <span>{routeData.durationMinutes} min</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
