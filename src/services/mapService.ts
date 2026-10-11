export interface PlaceSuggestion {
  displayName: string;
  shortAddress: string;
  city: string;
  lat: number;
  lon: number;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lat, lng] array
  distanceKm: number;
  durationMinutes: number;
}

// Real geocoding using OpenStreetMap Nominatim with debouncing & Morocco bias
export async function searchPlaces(
  query: string,
  tripType: 'city_to_city' | 'local',
  signal?: AbortSignal
): Promise<PlaceSuggestion[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: clean,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      countrycodes: 'ma', // Morocco priority
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      signal,
      headers: {
        'Accept-Language': 'fr-FR,fr;q=0.9,ar;q=0.8,en;q=0.7',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => {
          const city =
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.municipality ||
            item.address?.state ||
            '';

          const street =
            item.address?.road ||
            item.address?.suburb ||
            item.address?.neighbourhood ||
            '';

          const shortAddress =
            street && city
              ? `${street}, ${city}`
              : item.name || city || item.display_name.split(',')[0];

          return {
            displayName: item.display_name,
            shortAddress,
            city: city || shortAddress,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          };
        });
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') return [];
  }

  // Backup search if network timeout or empty response
  return getFallbackSuggestions(clean);
}

// Fallback accurate Moroccan coordinates
function getFallbackSuggestions(query: string): PlaceSuggestion[] {
  const moroccanCities = [
    { name: 'Rabat', lat: 34.020882, lon: -6.84165, full: 'Rabat, Préfecture de Rabat, Maroc' },
    { name: 'Rabat Agdal', lat: 33.9982, lon: -6.8522, full: 'Rabat Agdal, Rabat, Maroc' },
    { name: 'Rabat Centre', lat: 34.015, lon: -6.832, full: 'Rabat Centre, Rabat, Maroc' },
    { name: 'Rabat Souissi', lat: 33.965, lon: -6.831, full: 'Rabat Souissi, Rabat, Maroc' },
    { name: 'Rabat Hay Riad', lat: 33.958, lon: -6.883, full: 'Hay Riad, Rabat, Maroc' },
    { name: 'Casablanca', lat: 33.5731104, lon: -7.5898434, full: 'Casablanca, Préfecture de Casablanca, Maroc' },
    { name: 'Casablanca Maarif', lat: 33.576, lon: -7.638, full: 'Maârif, Casablanca, Maroc' },
    { name: 'Casablanca Anfa', lat: 33.593, lon: -7.652, full: 'Anfa, Casablanca, Maroc' },
    { name: 'Casablanca Sidi Maarouf', lat: 33.535, lon: -7.643, full: 'Sidi Maârouf, Casablanca, Maroc' },
    { name: 'Marrakech', lat: 31.6295, lon: -7.9811, full: 'Marrakech, Maroc' },
    { name: 'Marrakech Guéliz', lat: 31.634, lon: -8.012, full: 'Guéliz, Marrakech, Maroc' },
    { name: 'Tanger', lat: 35.7595, lon: -5.834, full: 'Tanger, Maroc' },
    { name: 'Fès', lat: 34.0331, lon: -5.0003, full: 'Fès, Maroc' },
    { name: 'Meknès', lat: 33.8938, lon: -5.5516, full: 'Meknès, Maroc' },
    { name: 'Agadir', lat: 30.4278, lon: -9.5981, full: 'Agadir, Maroc' },
    { name: 'Kénitra', lat: 34.261, lon: -6.5802, full: 'Kénitra, Maroc' },
    { name: 'Salé', lat: 34.0531, lon: -6.8166, full: 'Salé, Maroc' },
    { name: 'Mohammédia', lat: 33.6861, lon: -7.3828, full: 'Mohammédia, Maroc' },
    { name: 'El Jadida', lat: 33.2316, lon: -8.5007, full: 'El Jadida, Maroc' },
    { name: 'Tétouan', lat: 35.5785, lon: -5.3684, full: 'Tétouan, Maroc' },
    { name: 'Oujda', lat: 34.6814, lon: -1.9086, full: 'Oujda, Maroc' },
  ];

  const q = query.toLowerCase();
  return moroccanCities
    .filter(c => c.name.toLowerCase().includes(q) || c.full.toLowerCase().includes(q))
    .slice(0, 5)
    .map(c => ({
      displayName: c.full,
      shortAddress: c.name,
      city: c.name.split(' ')[0],
      lat: c.lat,
      lon: c.lon,
    }));
}

// Real road route calculation using OSRM (Open Source Routing Machine)
export async function calculateRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<RouteGeometry | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM error');
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.round(route.duration / 60);

      return {
        coordinates: coords,
        distanceKm,
        durationMinutes,
      };
    }
  } catch (err) {
    console.warn('OSRM routing network error, calculating geodesic route', err);
  }

  // Haversine fallback with road factor if external network is temporarily throttled
  const dLat = ((endLat - startLat) * Math.PI) / 180;
  const dLon = ((endLon - startLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDistance = 6371 * c;
  const roadDistance = Math.round(rawDistance * 1.22 * 10) / 10;
  const duration = Math.round((roadDistance / 75) * 60) + 12;

  const coords: [number, number][] = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    coords.push([
      startLat + (endLat - startLat) * ratio,
      startLon + (endLon - startLon) * ratio,
    ]);
  }

  return {
    coordinates: coords,
    distanceKm: roadDistance,
    durationMinutes: Math.max(10, duration),
  };
}

export function formatTripDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} h ${remaining} min` : `${hours} h`;
}
