/**
 * Geocoding utilities for location-based search
 */

// Haversine formula to calculate distance between two coordinates in miles
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  city?: string;
  state?: string;
}

/**
 * Geocode a location string using Google Maps Geocoding API
 * Returns coordinates and parsed address components
 */
export async function geocodeLocation(
  locationString: string
): Promise<GeocodedLocation | null> {
  // Check if Google Maps is loaded
  if (!window.google?.maps?.Geocoder) {
    console.warn('[Geocoding] Google Maps Geocoder not available');
    return null;
  }

  try {
    const geocoder = new window.google.maps.Geocoder();
    
    const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { 
          address: locationString,
          componentRestrictions: { country: 'US' }
        },
        (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });

    const result = response[0];
    const location = result.geometry.location;
    
    // Extract city and state from address components
    let city: string | undefined;
    let state: string | undefined;
    
    for (const component of result.address_components) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
    }

    return {
      lat: location.lat(),
      lng: location.lng(),
      formattedAddress: result.formatted_address,
      city,
      state
    };
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
}

/**
 * Check if a Event Pro can service a location based on their base location and travel radius
 */
export function isWithinServiceRadius(
  vendorLat: number,
  vendorLng: number,
  vendorTravelRadius: number,
  targetLat: number,
  targetLng: number
): boolean {
  const distance = calculateDistance(vendorLat, vendorLng, targetLat, targetLng);
  return distance <= vendorTravelRadius;
}

/**
 * Get the distance from a Event Pro to a target location
 * Returns null if Event Pro doesn't have coordinates
 */
export function getDistanceToVendor(
  vendorLat: number | null,
  vendorLng: number | null,
  targetLat: number,
  targetLng: number
): number | null {
  if (vendorLat === null || vendorLng === null) {
    return null;
  }
  return calculateDistance(vendorLat, vendorLng, targetLat, targetLng);
}
