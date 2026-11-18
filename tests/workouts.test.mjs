import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Running, Cycling, parseNumber, sessionDate, dateInputValue, readWorkouts,
  mergeWorkouts, weekBounds, weekSummary, visibleWorkouts,
} from '../workouts.mjs';

const coords = [5.3484, -4.0305];
const session = (id, date, type = 'running', distance = 5) => {
  const options = { id, date: sessionDate(date) };
  return type === 'running'
    ? new Running(coords, distance, 30, 170, options)
    : new Cycling(coords, distance, 60, -20, options);
};
const stored = workout => JSON.parse(JSON.stringify(workout));

test('les calculs de course et de vélo du projet initial sont conservés', () => {
  assert.equal(new Running(coords, 5, 25, 170).pace, 5);
  assert.equal(new Cycling(coords, 20, 60, 120).speed, 20);
});

test('la saisie française accepte la virgule et le point, sans convertir le vide en zéro', () => {
  assert.equal(parseNumber(' 5,5 '), 5.5);
  assert.equal(parseNumber('5.5'), 5.5);
  assert.equal(parseNumber('-20'), -20);
  for (const input of ['', ' ', '5,5,5', '1e999', '<script>', 'Infinity', '0xFF']) {
    assert.ok(Number.isNaN(parseNumber(input)), input);
  }
});

test('une date calendrier conserve son jour et rejette les jours impossibles', () => {
  assert.equal(dateInputValue(sessionDate('2024-02-29')), '2024-02-29');
  for (const input of ['2025-02-29', '2026-02-30', '2026-13-01', '', '1', 'invalid', '2026-02-30T12:00:00.000Z']) {
    assert.equal(sessionDate(input), null, input);
  }
});

test('la reprise des anciennes sauvegardes rétablit les modèles et traduit les descriptions', () => {
  const record = stored(session('legacy-1', '2024-11-18'));
  record.description = 'Running on November 18';
  record.pace = 999;
  const [restored] = readWorkouts([record]);
  assert.ok(restored instanceof Running);
  assert.equal(restored.id, 'legacy-1');
  assert.equal(restored.pace, 6);
  assert.equal(restored.description, 'Course à pied du 18 novembre 2024');
  assert.deepEqual(restored.coords, coords);
});

test('un export versionné peut être relu sans perte de valeurs ni de date', () => {
  const workout = session('velo', '2024-11-18', 'cycling', 20.5);
  const [restored] = readWorkouts({ version: 1, workouts: [stored(workout)] });
  assert.ok(restored instanceof Cycling);
  assert.equal(restored.distance, 20.5);
  assert.equal(restored.elevationGain, -20);
  assert.equal(restored.date.getTime(), workout.date.getTime());
});

test('un fichier invalide est rejeté en entier avant toute fusion', () => {
  const record = stored(session('valid', '2024-11-18'));
  for (const patch of [
    { distance: 0 }, { distance: '5' }, { duration: -2 }, { cadence: 0 },
    { coords: [91, 0] }, { coords: [5, 181] }, { coords: [5] },
    { date: 'not-a-date' }, { date: '2999-01-01' }, { type: '__proto__' }, { id: '' },
    { distance: Number.MIN_VALUE, duration: Number.MAX_VALUE },
  ]) {
    assert.throws(() => readWorkouts([record, { ...record, id: 'other', ...patch }]));
  }
  assert.throws(() => readWorkouts({ version: 2, workouts: [] }));
  assert.throws(() => readWorkouts([record, record]), /identifiant/);
  assert.throws(() => readWorkouts(Array(10001).fill(record)), /10 000/);
});

test('l’import fusionne les séances et conserve les versions locales déjà présentes', () => {
  const local = session('same', '2024-11-18');
  const changed = session('same', '2024-11-18', 'running', 10);
  const addition = session('new', '2024-11-19', 'cycling');
  const result = mergeWorkouts([local], [changed, addition]);
  assert.equal(result.added, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.workouts[0], local);
  assert.equal(result.workouts[1], addition);
});

test('la semaine commence le lundi et exclut le lundi suivant', () => {
  const today = sessionDate('2024-11-20');
  const { start, end } = weekBounds(today);
  assert.equal(dateInputValue(start), '2024-11-18');
  assert.equal(dateInputValue(end), '2024-11-25');
  const workouts = [session('before', '2024-11-17'), session('monday', '2024-11-18'),
    session('sunday', '2024-11-24', 'cycling', 20), session('after', '2024-11-25')];
  assert.deepEqual(weekSummary(workouts, today), { count: 2, distance: 25, duration: 90 });
});

test('les bornes hebdomadaires fonctionnent au passage d’année et au changement d’heure', () => {
  assert.equal(dateInputValue(weekBounds(sessionDate('2025-01-01')).start), '2024-12-30');
  const { start, end } = weekBounds(sessionDate('2024-03-31'));
  assert.equal(dateInputValue(start), '2024-03-25');
  assert.equal(dateInputValue(end), '2024-04-01');
  assert.equal(end.getHours(), 0);
});

test('les filtres et tris ne modifient pas le journal source', () => {
  const first = session('a', '2024-11-18', 'running', 5);
  const second = session('b', '2024-11-20', 'cycling', 20);
  const old = session('c', '2024-10-20', 'running', 7);
  const source = [first, second, old];
  const today = sessionDate('2024-11-20');
  assert.deepEqual(visibleWorkouts(source, { type: 'cycling' }, today), [second]);
  assert.deepEqual(visibleWorkouts(source, { period: 'week' }, today), [second, first]);
  assert.deepEqual(visibleWorkouts(source, { period: 'month', sort: 'oldest' }, today), [first, second]);
  assert.deepEqual(visibleWorkouts(source, { sort: 'distance' }, today), [second, old, first]);
  assert.deepEqual(source, [first, second, old]);
});
