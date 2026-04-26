/**
 * Computes a non-blocking travel-fee quote for an event address.
 *
 * Why this exists:
 * Earlier the booking flow attempted distance calc inline and could hang
 * indefinitely (Google Maps Geocoder has no built-in timeout). This hook:
 *  - debounces address changes (600ms)
 *  - bounds geocoding with a 5s timeout
 *  - runs the Haversine distance + fee math purely on the client
 *  - never throws — failure cleanly returns null so checkout still proceeds
 */
import { useEffect, useState } from 'react';
import {
  geocodeLocation,
  calculateDistance,
  type GeocodedLocation,
} from '@/lib/geocoding';

interface QuoteInput {
  addressString: string;          // full formatted "line1, city, state zip"
  vendorLat?: number | null;
  vendorLng?: number | null;
  includedMiles?: number | null;  // miles included for free
  feePerMile?: number | null;     // $/mile beyond included
  maxTravelMiles?: number | null; // hard cap; out-of-range surfaces a warning
  enabled: boolean;
}

export interface TravelFeeQuote {
  status: 'idle' | 'loading' | 'ready' | 'error' | 'out_of_range';
  distanceMiles: number | null;
  billableMiles: number | null;
  fee: number;          // dollars
  formattedAddress: string | null;
  error?: string;
}

const GEOCODE_TIMEOUT_MS = 5_000;
const DEBOUNCE_MS = 600;

const IDLE: TravelFeeQuote = {
  status: 'idle',
  distanceMiles: null,
  billableMiles: null,
  fee: 0,
  formattedAddress: null,
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('geocode_timeout')), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

export function useTravelFeeQuote({
  addressString,
  vendorLat,
  vendorLng,
  includedMiles,
  feePerMile,
  maxTravelMiles,
  enabled,
}: QuoteInput): TravelFeeQuote {
  const [quote, setQuote] = useState<TravelFeeQuote>(IDLE);

  useEffect(() => {
    if (!enabled || !addressString.trim() || vendorLat == null || vendorLng == null) {
      setQuote(IDLE);
      return;
    }

    let cancelled = false;
    setQuote((prev) => ({ ...prev, status: 'loading' }));

    const handle = setTimeout(async () => {
      try {
        const geo = (await withTimeout(
          geocodeLocation(addressString),
          GEOCODE_TIMEOUT_MS,
        )) as GeocodedLocation | null;

        if (cancelled) return;
        if (!geo) {
          setQuote({ ...IDLE, status: 'error', error: 'Could not locate address' });
          return;
        }

        const distance = calculateDistance(vendorLat, vendorLng, geo.lat, geo.lng);

        if (maxTravelMiles && distance > maxTravelMiles) {
          setQuote({
            status: 'out_of_range',
            distanceMiles: distance,
            billableMiles: null,
            fee: 0,
            formattedAddress: geo.formattedAddress,
            error: `This event is ${distance.toFixed(0)} mi away — outside the ${maxTravelMiles} mi service radius.`,
          });
          return;
        }

        const free = includedMiles ?? 0;
        const rate = feePerMile ?? 0;
        const billable = Math.max(0, distance - free);
        const fee = +(billable * rate).toFixed(2);

        setQuote({
          status: 'ready',
          distanceMiles: distance,
          billableMiles: billable,
          fee,
          formattedAddress: geo.formattedAddress,
        });
      } catch (err) {
        if (cancelled) return;
        const isTimeout = err instanceof Error && err.message === 'geocode_timeout';
        setQuote({
          ...IDLE,
          status: 'error',
          error: isTimeout
            ? 'Distance lookup timed out — you can still book; fees will be confirmed by the Event Pro.'
            : 'Could not calculate travel fee — you can still book.',
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [addressString, vendorLat, vendorLng, includedMiles, feePerMile, maxTravelMiles, enabled]);

  return quote;
}
