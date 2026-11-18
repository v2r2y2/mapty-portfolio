import test from 'node:test';
import assert from 'node:assert/strict';
import { routeUrl, parseRouteResponse, calculateRoute } from '../routing.mjs';
import { readWorkouts, restoreRoute } from '../workouts.mjs';

const start = [5.3484, -4.0305], end = [5.357, -4.041];
const payload = { code: 'Ok', routes: [{ distance: 2194.9, geometry: { type: 'LineString', coordinates: [[-4.0305, 5.3484], [-4.034, 5.35], [-4.041, 5.357]] } }], waypoints: [{ name: 'Départ' }, { name: 'Arrivée' }] };

test('A/B utilise longitude/latitude et le profil propre à chaque sport', () => {
  assert.match(routeUrl(start, end, 'running'), /routed-foot\/route\/v1\/foot\/-4\.030500,5\.348400;-4\.041000,5\.357000/);
  assert.match(routeUrl(start, end, 'cycling'), /routed-bike\/route\/v1\/bike/);
  assert.throws(() => routeUrl(start, start, 'running'), /différents/);
  assert.throws(() => routeUrl([91, 0], end, 'running'));
});

test('la géométrie suit la réponse routière, sans inventer de segment direct', () => {
  const route = parseRouteResponse(payload, start, end, 'running');
  assert.equal(route.coordinates.length, 3);
  assert.equal(route.distance, 2194.9);
  assert.equal(route.startLabel, 'Départ');
  assert.throws(() => parseRouteResponse({ code: 'NoRoute' }, start, end, 'running'), /Aucun itinéraire/);
  assert.throws(() => parseRouteResponse({ code: 'Ok', routes: [{ geometry: { type: 'Point' } }] }, start, end, 'running'), /illisible/);
});

test('les routes importées sont bornées et ne correspondent qu’au bon sport', () => {
  const route = parseRouteResponse(payload, start, end, 'running');
  const record = { id: 'route', type: 'running', title: 'Course du matin', date: '2024-11-18', distance: 2.2, duration: 15, route, coords: null };
  const [restored] = readWorkouts({ version: 2, workouts: [record] });
  assert.equal(restored.cadence, null);
  assert.deepEqual(restored.route.coordinates, payload.routes[0].geometry.coordinates);
  assert.deepEqual(restored.coords, start);
  assert.equal(restored.title, 'Course du matin');
  assert.throws(() => readWorkouts([{ ...record, type: 'cycling' }]), /sport/);
  assert.throws(() => restoreRoute({ ...route, coordinates: [[181, 0], [0, 0]] }));
  assert.throws(() => restoreRoute({ ...route, coordinates: Array(20001).fill([0, 0]) }));
  assert.throws(() => readWorkouts([{ ...record, title: 'x'.repeat(81) }]));
});

test('une séance libre n’invente ni position, ni métrique facultative', () => {
  const [workout] = readWorkouts({ version: 2, workouts: [{ id: 'manual', type: 'cycling', date: '2024-11-18', distance: 20, duration: 60 }] });
  assert.equal(workout.coords, null);
  assert.equal(workout.route, null);
  assert.equal(workout.elevationGain, null);
  assert.equal(workout.speed, 20);
});

test('le réseau et le rythme public sont gérés, y compris les appels concurrents', async () => {
  const requests = [];
  const fetcher = async () => { requests.push(Date.now()); return { ok: true, json: async () => payload }; };
  const routes = await Promise.all([calculateRoute(start, end, 'running', { fetcher }), calculateRoute(start, end, 'running', { fetcher })]);
  assert.equal(routes.length, 2);
  assert.ok(requests[1] - requests[0] >= 1000);
  await assert.rejects(calculateRoute(start, end, 'running', { fetcher: async () => { throw new TypeError('offline'); } }), /connexion/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(calculateRoute(start, end, 'running', { signal: controller.signal, fetcher }), { name: 'AbortError' });
});
