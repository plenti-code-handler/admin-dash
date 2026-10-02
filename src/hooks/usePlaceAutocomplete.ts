import { useEffect, useState, type RefObject } from 'react';

export type SelectedPlace = {
  address: string;
  addressUrl: string;
  latitude: number;
  longitude: number;
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type Autocomplete = {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    url?: string;
    geometry?: { location?: { lat: () => number; lng: () => number } };
  };
};

declare global {
  interface Window {
    google?: {
      maps: {
        event: { clearInstanceListeners: (instance: unknown) => void };
        places: { Autocomplete: new (input: HTMLInputElement, opts: object) => Autocomplete };
      };
    };
  }
}

let placesLoader: Promise<void> | null = null;

function loadPlaces(apiKey: string) {
  if (window.google?.maps?.places) return Promise.resolve();
  if (!placesLoader) {
    placesLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        placesLoader = null;
        reject(new Error('Failed to load Google Maps'));
      };
      document.head.appendChild(script);
    });
  }
  return placesLoader;
}

function placeFromAutocomplete(autocomplete: Autocomplete): SelectedPlace | null {
  const place = autocomplete.getPlace();
  const latitude = place.geometry?.location?.lat();
  const longitude = place.geometry?.location?.lng();
  const address = place.formatted_address;
  if (latitude == null || longitude == null || !address) return null;

  return {
    address,
    latitude,
    longitude,
    addressUrl:
      place.url ||
      `https://www.google.com/maps/place/${encodeURIComponent(address)}/@${latitude},${longitude},15z`,
  };
}

/** Keep the suggestions list usable inside a focus-trapped dialog. */
function watchSuggestionList() {
  const lift = () => {
    document.querySelectorAll<HTMLElement>('.pac-container').forEach((el) => {
      if (el.hasAttribute('inert')) el.removeAttribute('inert');
      el.style.zIndex = '10000';
      el.style.pointerEvents = 'auto';
    });
  };
  lift();
  const observer = new MutationObserver(lift);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['inert'] });
  return () => observer.disconnect();
}

export function suggestionListHovered() {
  return Boolean(document.querySelector('.pac-container:hover'));
}

export function usePlaceAutocomplete(
  inputRef: RefObject<HTMLInputElement | null>,
  enabled: boolean,
  onPlace: (place: SelectedPlace) => void,
) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!API_KEY) {
      setError('Google Maps key is not configured');
      return;
    }

    let autocomplete: Autocomplete | null = null;
    let cancelled = false;
    const stopWatch = watchSuggestionList();

    loadPlaces(API_KEY)
      .then(() => {
        const input = inputRef.current;
        const maps = window.google?.maps;
        if (cancelled || !input || !maps?.places) return;

        autocomplete = new maps.places.Autocomplete(input, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'IN' },
          fields: ['formatted_address', 'geometry', 'url'],
        });
        autocomplete.addListener('place_changed', () => {
          if (!autocomplete) return;
          const selected = placeFromAutocomplete(autocomplete);
          if (selected) onPlace(selected);
        });
        setReady(true);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load address search');
      });

    return () => {
      cancelled = true;
      stopWatch();
      if (autocomplete) window.google?.maps.event.clearInstanceListeners(autocomplete);
      document.querySelectorAll('.pac-container').forEach((el) => el.remove());
    };
  }, [enabled, inputRef, onPlace]);

  return { ready, error };
}
