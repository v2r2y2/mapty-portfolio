import { validCoords, restoreRoute } from './workouts.mjs';

export const ROUTING_CREDIT = 'FOSSGIS / OSRM';
let lastRequest = 0;

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const cancel = () => { clearTimeout(timer); reject(new DOMException('Calcul annulé', 'AbortError')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', cancel); resolve(); }, milliseconds);
    if (signal?.aborted) return cancel();
    signal?.addEventListener('abort', cancel, { once: true });
  });
}

export function routeUrl(start, end, sport) {
  if (!validCoords(start) || !validCoords(end)) throw new Error('Choisissez un départ et une arrivée sur la carte.');
  if (start[0] === end[0] && start[1] === end[1]) throw new Error('Le départ et l’arrivée doivent être différents.');
  if (!['running', 'cycling'].includes(sport)) throw new Error('Choisissez la course à pied ou le vélo.');
  const profile = sport === 'cycling' ? 'bike' : 'foot';
  const points = [start, end].map(([lat, lng]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join(';');
  return `https://routing.openstreetmap.de/routed-${profile}/route/v1/${profile}/${points}?overview=full&geometries=geojson&steps=false`;
}

export function parseRouteResponse(payload, start, end, sport) {
  if (payload?.code !== 'Ok' || !payload.routes?.[0]) {
    throw new Error('Aucun itinéraire trouvé entre ces points. Essayez de les rapprocher d’une rue ou d’un chemin.');
  }
  const route = payload.routes[0];
  if (route.geometry?.type !== 'LineString') throw new Error('Le service a renvoyé un tracé illisible. Réessayez.');
  return restoreRoute({ start, end, coordinates: route.geometry.coordinates, distance: route.distance,
    profile: sport === 'cycling' ? 'bike' : 'foot', startLabel: payload.waypoints?.[0]?.name || '',
    endLabel: payload.waypoints?.[1]?.name || '' });
}

export async function calculateRoute(start, end, sport, { signal, fetcher = fetch } = {}) {
  const url = routeUrl(start, end, sport);
  // Le serveur public autorise au maximum une requête par seconde.
  const slot = Math.max(Date.now(), lastRequest + 1100);
  lastRequest = slot;
  await wait(Math.max(0, slot - Date.now()), signal);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  let timeout = false;
  const timer = setTimeout(() => { timeout = true; controller.abort(); }, 15000);
  try {
    const response = await fetcher(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Le calcul du trajet est temporairement indisponible. Réessayez dans un instant.');
    return parseRouteResponse(await response.json(), start, end, sport);
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Calcul annulé', 'AbortError');
    if (timeout) throw new Error('Le calcul prend trop de temps. Vérifiez la connexion puis réessayez.');
    if (error instanceof TypeError) throw new Error('Impossible de joindre le calcul d’itinéraire. Vérifiez votre connexion.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
