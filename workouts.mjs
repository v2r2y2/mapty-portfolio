// Modèles issus de Mapty, de Jonas Schmedtmann, étendus pour le journal personnel.
export const SPORT_LABELS = { running: 'Course à pied', cycling: 'Vélo' };
export const numberFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
});
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric',
});

export function dateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sessionDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!calendarDate && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const calendar = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (!Number.isFinite(calendar.getTime()) || dateInputValue(calendar) !== value.slice(0, 10)) return null;
  const date = new Date(calendarDate ? `${value}T12:00:00` : value);
  if (!Number.isFinite(date.getTime())) return null;
  if (calendarDate && dateInputValue(date) !== value) return null;
  return date;
}

export function parseNumber(value) {
  if (typeof value !== 'string' || !value.trim()) return NaN;
  const normalized = value.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return NaN;
  return Number(normalized);
}

export class Workout {
  constructor(coords, distance, duration, options = {}) {
    this.coords = [...coords];
    this.distance = distance;
    this.duration = duration;
    this.date = options.date || new Date();
    this.id = options.id || crypto.randomUUID();
  }

  _setDescription() {
    this.description = `${SPORT_LABELS[this.type]} du ${dateFormat.format(this.date)}`;
  }
}

export class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence, options) {
    super(coords, distance, duration, options);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

export class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain, options) {
    super(coords, distance, duration, options);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

export function restoreWorkout(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error('Une séance est illisible.');
  }
  const { id, type, coords, distance, duration } = record;
  const date = sessionDate(record.date);
  if (typeof id !== 'string' || !id.trim() || id.length > 100) {
    throw new Error('Une séance possède un identifiant invalide.');
  }
  if (!Object.hasOwn(SPORT_LABELS, type)) throw new Error('Sport inconnu dans le fichier.');
  if (!Array.isArray(coords) || coords.length !== 2 ||
    !coords.every(Number.isFinite) || Math.abs(coords[0]) > 90 || Math.abs(coords[1]) > 180) {
    throw new Error('Les coordonnées d’une séance sont invalides.');
  }
  if (![distance, duration].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('La distance et la durée doivent être des nombres supérieurs à zéro.');
  }
  if (!date || dateInputValue(date) > dateInputValue()) {
    throw new Error('La date d’une séance est invalide ou située dans le futur.');
  }
  const options = { id, date };
  if (type === 'running') {
    if (!Number.isFinite(record.cadence) || record.cadence <= 0) {
      throw new Error('La cadence doit être supérieure à zéro.');
    }
    const workout = new Running(coords, distance, duration, record.cadence, options);
    if (!Number.isFinite(workout.pace)) throw new Error('Les valeurs de la séance sont trop grandes ou trop petites.');
    return workout;
  }
  if (!Number.isFinite(record.elevationGain)) throw new Error('Le dénivelé est invalide.');
  const workout = new Cycling(coords, distance, duration, record.elevationGain, options);
  if (!Number.isFinite(workout.speed)) throw new Error('Les valeurs de la séance sont trop grandes ou trop petites.');
  return workout;
}

export function readWorkouts(payload) {
  let records;
  if (Array.isArray(payload)) records = payload; // Sauvegardes de la version du cours.
  else if (payload && payload.version === 1 && Array.isArray(payload.workouts)) {
    records = payload.workouts;
  } else throw new Error('Ce fichier n’est pas une sauvegarde Mapty reconnue.');
  if (records.length > 10000) throw new Error('La sauvegarde dépasse 10 000 séances.');
  const workouts = records.map(restoreWorkout);
  if (new Set(workouts.map(workout => workout.id)).size !== workouts.length) {
    throw new Error('Plusieurs séances possèdent le même identifiant.');
  }
  return workouts;
}

export function mergeWorkouts(current, incoming) {
  const existingIds = new Set(current.map(workout => workout.id));
  const additions = incoming.filter(workout => !existingIds.has(workout.id));
  return { workouts: [...current, ...additions], added: additions.length,
    skipped: incoming.length - additions.length };
}

export function weekBounds(today = new Date()) {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

export function weekSummary(workouts, today = new Date()) {
  const { start, end } = weekBounds(today);
  const sessions = workouts.filter(workout => workout.date >= start && workout.date < end);
  return {
    count: sessions.length,
    distance: sessions.reduce((total, workout) => total + workout.distance, 0),
    duration: sessions.reduce((total, workout) => total + workout.duration, 0),
  };
}

export function visibleWorkouts(workouts, { type = 'all', period = 'all', sort = 'recent' }, today = new Date()) {
  const { start, end } = weekBounds(today);
  const sessions = workouts.filter(workout => {
    if (type !== 'all' && workout.type !== type) return false;
    if (period === 'week') return workout.date >= start && workout.date < end;
    if (period === 'month') return workout.date.getMonth() === today.getMonth() &&
      workout.date.getFullYear() === today.getFullYear();
    return true;
  });
  return sessions.sort((first, second) => {
    if (sort === 'oldest') return first.date - second.date;
    if (sort === 'distance') return second.distance - first.distance || second.date - first.date;
    return second.date - first.date;
  });
}
