'use strict';

import {
  Running, Cycling, SPORT_LABELS, numberFormat, dateInputValue, sessionDate,
  parseNumber, readWorkouts, mergeWorkouts, weekBounds, weekSummary, visibleWorkouts,
} from './workouts.mjs';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('#workout-type');
const inputDate = document.querySelector('#workout-date');
const inputDistance = document.querySelector('#workout-distance');
const inputDuration = document.querySelector('#workout-duration');
const inputCadence = document.querySelector('#workout-cadence');
const inputElevation = document.querySelector('#workout-elevation');
const DEFAULT_COORDS = [5.3484, -4.0305];
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

class App {
  #map;
  #mapZoomLevel = 13;
  #coords = DEFAULT_COORDS;
  #workouts = [];
  #editingId = null;
  #markers;
  #workoutMarkers = new Map();
  #selectionMarker;
  #tiles;
  #tileTimer;
  #tileErrors = false;
  #storageBlocked = false;
  #recoveryRaw = null;
  #dialog = document.querySelector('#confirm-dialog');

  constructor() {
    this._getLocalStorage();
    this._loadMap();
    this._render();
    this._attachEvents();
    inputDate.max = dateInputValue();
  }

  _attachEvents() {
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    document.querySelector('#new-workout').addEventListener('click', () => this._showForm());
    document.querySelector('#cancel-workout').addEventListener('click', () => this._hideForm());
    document.querySelector('#locate-me').addEventListener('click', () => this._getPosition());
    document.querySelector('#use-map-center').addEventListener('click', () => {
      const center = this.#map?.getCenter().wrap();
      const coords = center ? [center.lat, center.lng] : DEFAULT_COORDS;
      if (form.hidden) return this._showForm(coords);
      this.#coords = coords;
      this._updateSelection();
      this._focusForm();
    });
    document.querySelector('#retry-map').addEventListener('click', () => {
      if (!this.#tiles) return this._loadMap();
      this.#tileErrors = false;
      this.#tiles.redraw();
    });
    containerWorkouts.addEventListener('click', this._handleWorkoutAction.bind(this));
    for (const selector of ['#filter-type', '#filter-period', '#sort-workouts']) {
      document.querySelector(selector).addEventListener('change', () => this._render());
    }
    document.querySelector('#reset-filters').addEventListener('click', () => {
      this._resetFilters();
      this._render();
      document.querySelector('#filter-type').focus();
    });
    document.querySelector('#export-workouts').addEventListener('click', () => this._exportWorkouts());
    document.querySelector('#import-workouts').addEventListener('click', () => document.querySelector('#import-file').click());
    document.querySelector('#import-file').addEventListener('change', event => this._importWorkouts(event));
    document.querySelector('#download-recovery').addEventListener('click', () => {
      this._download(this.#recoveryRaw, 'mapty-historique-a-recuperer.json');
      this._announce('Historique brut exporté. Conservez ce fichier avant toute réinitialisation.');
    });
    document.querySelector('#reset-storage').addEventListener('click', () => this._resetStorage());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        inputDate.max = dateInputValue();
        this._render();
      }
    });
  }

  _loadMap() {
    try {
      if (typeof L === 'undefined') throw new Error('Leaflet indisponible');
      const savedView = this._getMapView();
      const coords = savedView?.coords || DEFAULT_COORDS;
      this.#coords = coords;
      this.#map = L.map('map', { zoomControl: false }).setView(coords, savedView?.zoom || this.#mapZoomLevel);
      L.control.zoom({ zoomInTitle: 'Zoom avant', zoomOutTitle: 'Zoom arrière' }).addTo(this.#map);
      document.querySelectorAll('.leaflet-control-zoom a').forEach(control => control.setAttribute('aria-label', control.title));
      this.#markers = L.layerGroup().addTo(this.#map);
      this.#tiles = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs, tuiles <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a>',
      });
      this.#tiles.on('loading', () => {
        this.#tileErrors = false;
        this._mapStatus('Chargement du fond de carte…');
        clearTimeout(this.#tileTimer);
        this.#tileTimer = setTimeout(() => this._mapStatus('Le fond de carte tarde à répondre. Vérifiez votre connexion.', true), 8000);
      });
      this.#tiles.on('tileerror', () => { this.#tileErrors = true; });
      this.#tiles.on('load', () => {
        clearTimeout(this.#tileTimer);
        if (this.#tileErrors) this._mapStatus('Une partie du fond de carte est indisponible. Vos séances restent accessibles.', true);
        else document.querySelector('#map-status').hidden = true;
      });
      this.#tiles.addTo(this.#map);
      this.#map.on('click', event => {
        const point = event.latlng.wrap();
        this.#coords = [point.lat, point.lng];
        if (form.hidden) this._showForm(this.#coords);
        else {
          this._updateSelection();
          this._focusForm();
        }
      });
      this.#map.on('moveend', () => {
        try {
          const center = this.#map.getCenter().wrap();
          localStorage.setItem('mapty-view', JSON.stringify({ coords: [center.lat, center.lng], zoom: this.#map.getZoom() }));
        } catch { /* La mémorisation de la vue ne doit jamais bloquer la carte. */ }
      });
      if (savedView) document.querySelector('#map-caption').textContent = 'Dernière vue restaurée. La localisation reste facultative.';
    } catch {
      this._mapStatus('La carte n’a pas pu démarrer. Votre journal reste accessible.', true);
    }
  }

  _getMapView() {
    try {
      const view = JSON.parse(localStorage.getItem('mapty-view'));
      if (Array.isArray(view?.coords) && view.coords.length === 2 && view.coords.every(Number.isFinite) &&
        Math.abs(view.coords[0]) <= 90 && Math.abs(view.coords[1]) <= 180 &&
        Number.isInteger(view.zoom) && view.zoom >= 1 && view.zoom <= 19) return view;
    } catch { /* Une vue invalide utilise simplement la vue par défaut. */ }
    return null;
  }

  _mapStatus(message, retry = false) {
    document.querySelector('#map-status').hidden = false;
    document.querySelector('#map-status-text').textContent = message;
    document.querySelector('#retry-map').hidden = !retry;
  }

  _getPosition() {
    if (!navigator.geolocation) return this._locationMessage('Ce navigateur ne propose pas la localisation. Vous pouvez choisir un lieu sur la carte.', true);
    const button = document.querySelector('#locate-me');
    button.disabled = true;
    button.textContent = 'Localisation…';
    let finished = false;
    const finish = () => {
      finished = true;
      clearTimeout(timer);
      button.disabled = false;
      button.textContent = 'Me localiser';
    };
    // Le délai applicatif couvre aussi une demande d’autorisation restée sans réponse.
    const timer = setTimeout(() => {
      if (finished) return;
      finish();
      this._locationMessage('Localisation trop longue. Choisissez un lieu sur la carte ou réessayez.', true);
    }, 9000);
    navigator.geolocation.getCurrentPosition(position => {
      if (finished) return;
      finish();
      const coords = [position.coords.latitude, position.coords.longitude];
      this.#map?.setView(coords, this.#mapZoomLevel);
      this._locationMessage(this.#map
        ? 'Carte centrée sur votre position. Choisissez le lieu de votre séance.'
        : 'Position trouvée, mais carte indisponible. Réessayez le chargement de la carte.', !this.#map);
    }, error => {
      if (finished) return;
      finish();
      const messages = {
        1: 'Localisation refusée. Vous pouvez autoriser l’accès dans le navigateur ou choisir un lieu sur la carte.',
        2: 'Position indisponible. Choisissez un lieu sur la carte ou réessayez.',
        3: 'Localisation trop longue. Choisissez un lieu sur la carte ou réessayez.',
      };
      this._locationMessage(messages[error.code] || messages[2], true);
    }, { timeout: 7000, maximumAge: 60000, enableHighAccuracy: false });
  }

  _locationMessage(message, error = false) {
    document.querySelector('#map-caption').textContent = message;
    this._announce(message, error);
  }

  _showForm(coords) {
    if (!form.hidden) return;
    this.#editingId = null;
    const center = this.#map?.getCenter().wrap();
    this.#coords = coords || (center ? [center.lat, center.lng] : DEFAULT_COORDS);
    form.reset();
    inputDate.value = dateInputValue();
    document.querySelector('#form-title').textContent = 'Nouvelle séance';
    document.querySelector('#save-workout').textContent = 'Enregistrer la séance';
    this._openForm();
  }

  _openForm() {
    this._clearErrors();
    this._toggleElevationField();
    form.hidden = false;
    document.querySelector('#new-workout').disabled = true;
    document.querySelector('#use-map-center').textContent = 'Choisir ce lieu';
    this._updateSelection();
    this._focusForm();
  }

  _focusForm() {
    document.querySelector('#form-title').focus();
    form.scrollIntoView({ block: 'nearest' });
  }

  _updateSelection() {
    const coords = this.#coords.map(value => value.toLocaleString('fr-FR', { maximumFractionDigits: 4 }));
    document.querySelector('#form-location').textContent = `Lieu sélectionné : ${coords.join(' ; ')}. Cliquez sur la carte pour le déplacer.`;
    if (!this.#map) return;
    if (!this.#selectionMarker) {
      this.#selectionMarker = L.circleMarker(this.#coords, { radius: 9, color: '#193f2b', fillColor: '#00c46a', fillOpacity: 1, weight: 2 }).addTo(this.#map);
    } else this.#selectionMarker.setLatLng(this.#coords);
  }

  _hideForm(restoreFocus = true) {
    form.hidden = true;
    this.#editingId = null;
    if (this.#selectionMarker) this.#selectionMarker.remove();
    this.#selectionMarker = null;
    document.querySelector('#new-workout').disabled = false;
    document.querySelector('#use-map-center').textContent = 'Ajouter ici';
    if (restoreFocus) document.querySelector('#new-workout').focus();
  }

  _toggleElevationField() {
    const running = inputType.value === 'running';
    document.querySelector('#cadence-row').hidden = !running;
    document.querySelector('#elevation-row').hidden = running;
    inputCadence.disabled = !running;
    inputElevation.disabled = running;
  }

  _clearErrors() {
    document.querySelector('#form-error').textContent = '';
    form.querySelectorAll('.field-error').forEach(element => { element.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  }

  _fieldError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    const errorId = input.getAttribute('aria-describedby');
    if (errorId) document.getElementById(errorId).textContent = message;
    else document.querySelector('#form-error').textContent = message;
  }

  _newWorkout(event) {
    event.preventDefault();
    this._clearErrors();
    const distance = parseNumber(inputDistance.value);
    const duration = parseNumber(inputDuration.value);
    const cadence = parseNumber(inputCadence.value);
    const elevation = parseNumber(inputElevation.value);
    const date = sessionDate(inputDate.value);
    if (!Number.isFinite(distance) || distance <= 0) this._fieldError(inputDistance, 'Saisissez une distance supérieure à 0.');
    if (!Number.isFinite(duration) || duration <= 0) this._fieldError(inputDuration, 'Saisissez une durée supérieure à 0.');
    if (!date || inputDate.value > dateInputValue()) this._fieldError(inputDate, 'Choisissez une date valide, aujourd’hui ou dans le passé.');
    if (inputType.value === 'running' && (!Number.isFinite(cadence) || cadence <= 0)) this._fieldError(inputCadence, 'Saisissez une cadence supérieure à 0.');
    if (inputType.value === 'cycling' && !Number.isFinite(elevation)) this._fieldError(inputElevation, 'Saisissez un dénivelé, y compris 0 ou une valeur négative.');
    const computed = inputType.value === 'running' ? duration / distance : distance / (duration / 60);
    if (Number.isFinite(distance) && Number.isFinite(duration) && distance > 0 && duration > 0 && !Number.isFinite(computed)) {
      this._fieldError(inputDistance, 'Ces valeurs sont trop grandes ou trop petites pour calculer la séance.');
    }
    const invalid = form.querySelector('[aria-invalid="true"]');
    if (invalid) return invalid.focus();
    const editedId = this.#editingId;
    const options = { date, id: editedId || undefined };
    const workout = inputType.value === 'running'
      ? new Running(this.#coords, distance, duration, cadence, options)
      : new Cycling(this.#coords, distance, duration, elevation, options);
    if (editedId) this.#workouts = this.#workouts.map(current => current.id === editedId ? workout : current);
    else this.#workouts.push(workout);
    const saved = this._setLocalStorage();
    this._hideForm(false);
    this._resetFilters();
    this._render();
    this._renderWorkoutMarkerFocus(workout.id);
    this._announce(`${editedId ? 'Séance modifiée.' : 'Séance ajoutée.'}${saved ? '' : ' Non sauvegardée : exportez votre journal avant de fermer cet onglet.'}`, !saved);
  }

  _filters() {
    return { type: document.querySelector('#filter-type').value,
      period: document.querySelector('#filter-period').value,
      sort: document.querySelector('#sort-workouts').value };
  }

  _resetFilters() {
    document.querySelector('#filter-type').value = 'all';
    document.querySelector('#filter-period').value = 'all';
    document.querySelector('#sort-workouts').value = 'recent';
  }

  _render() {
    const summary = weekSummary(this.#workouts);
    document.querySelector('#summary-count').textContent = numberFormat.format(summary.count);
    document.querySelector('#summary-distance').textContent = numberFormat.format(summary.distance);
    document.querySelector('#summary-duration').textContent = numberFormat.format(summary.duration);
    const { start, end } = weekBounds();
    end.setDate(end.getDate() - 1);
    const rangeFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    document.querySelector('#week-range').textContent = `${rangeFormat.format(start)} – ${rangeFormat.format(end)}`;
    const sessions = visibleWorkouts(this.#workouts, this._filters());
    containerWorkouts.replaceChildren(...sessions.map(workout => this._renderWorkout(workout)));
    document.querySelector('#session-count').textContent = `${sessions.length} séance${sessions.length === 1 ? '' : 's'}`;
    document.querySelector('#empty-state').hidden = sessions.length > 0;
    const hasWorkouts = this.#workouts.length > 0;
    document.querySelector('#empty-title').textContent = hasWorkouts ? 'Aucune séance pour ces filtres.' : 'Votre journal commence ici.';
    document.querySelector('#empty-description').textContent = hasWorkouts ? 'Essayez un autre sport ou une autre période.' : 'Ajoutez une séance, puis choisissez son emplacement sur la carte.';
    document.querySelector('#reset-filters').hidden = !hasWorkouts;
    this.#markers?.clearLayers();
    this.#workoutMarkers.clear();
    sessions.forEach(workout => this._renderWorkoutMarker(workout));
  }

  _renderWorkout(workout) {
    const item = document.createElement('li');
    item.className = `workout workout--${workout.type}`;
    item.dataset.id = workout.id;
    const running = workout.type === 'running';
    const metrics = [
      ['Distance', workout.distance, 'km'], ['Durée', workout.duration, 'min'],
      [running ? 'Allure' : 'Vitesse', running ? workout.pace : workout.speed, running ? 'min/km' : 'km/h'],
      [running ? 'Cadence' : 'Dénivelé', running ? workout.cadence : workout.elevationGain, running ? 'pas/min' : 'm'],
    ];
    item.innerHTML = `<div class="workout-heading"><h3 class="sport-label">${SPORT_LABELS[workout.type]}</h3><time datetime="${dateInputValue(workout.date)}">${shortDate.format(workout.date)}</time></div>
      <dl class="workout-metrics">${metrics.map(([label, value, unit]) => `<div><dt>${label}</dt><dd>${numberFormat.format(value)} <small>${unit}</small></dd></div>`).join('')}</dl>
      <div class="workout-actions"><button type="button" class="text-button" data-action="view">Voir sur la carte</button><button type="button" class="text-button" data-action="edit">Modifier</button><button type="button" class="text-button" data-action="delete">Supprimer</button></div>`;
    item.querySelectorAll('button').forEach(button => button.setAttribute('aria-label', `${button.textContent} : ${workout.description}`));
    return item;
  }

  _renderWorkoutMarker(workout) {
    if (!this.#map) return;
    const content = document.createElement('span');
    content.textContent = `${workout.description} · ${numberFormat.format(workout.distance)} km`;
    const marker = L.marker(workout.coords, { title: workout.description, alt: workout.description })
      .bindPopup(content).addTo(this.#markers);
    this.#workoutMarkers.set(workout.id, marker);
  }

  _renderWorkoutMarkerFocus(id) {
    const item = [...containerWorkouts.children].find(element => element.dataset.id === id);
    item?.querySelector('[data-action="view"]').focus();
  }

  _handleWorkoutAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const workout = this.#workouts.find(current => current.id === button.closest('.workout').dataset.id);
    if (!workout) return;
    if (button.dataset.action === 'view') return this._moveToPopup(workout);
    if (button.dataset.action === 'delete') return this._deleteWorkout(workout);
    this._editWorkout(workout);
  }

  _moveToPopup(workout) {
    if (!this.#map) return this._announce('La carte est indisponible. Réessayez depuis la zone de carte.', true);
    this.#map.setView(workout.coords, this.#mapZoomLevel, { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    this.#workoutMarkers.get(workout.id)?.openPopup();
    document.querySelector('#map').scrollIntoView({ block: 'center' });
  }

  _editWorkout(workout) {
    if (!form.hidden) {
      this._announce('Enregistrez ou annulez la saisie en cours avant de modifier une autre séance.', true);
      return document.querySelector('#form-title').focus();
    }
    this.#editingId = workout.id;
    this.#coords = [...workout.coords];
    inputType.value = workout.type;
    inputDate.value = dateInputValue(workout.date);
    inputDistance.value = String(workout.distance).replace('.', ',');
    inputDuration.value = String(workout.duration).replace('.', ',');
    inputCadence.value = workout.cadence ?? '';
    inputElevation.value = workout.elevationGain ?? '';
    document.querySelector('#form-title').textContent = 'Modifier la séance';
    document.querySelector('#save-workout').textContent = 'Enregistrer les modifications';
    this._openForm();
    this.#map?.setView(workout.coords, this.#mapZoomLevel);
  }

  _confirm(title, description, action) {
    if (this.#dialog.open) return Promise.resolve(false);
    document.querySelector('#confirm-title').textContent = title;
    document.querySelector('#confirm-description').textContent = description;
    document.querySelector('#confirm-action').textContent = action;
    this.#dialog.returnValue = 'cancel';
    this.#dialog.showModal();
    return new Promise(resolve => this.#dialog.addEventListener('close', () => resolve(this.#dialog.returnValue === 'confirm'), { once: true }));
  }

  async _deleteWorkout(workout) {
    if (!form.hidden) return this._announce('Enregistrez ou annulez la saisie en cours avant de supprimer une séance.', true);
    const confirmed = await this._confirm('Supprimer cette séance ?', `${workout.description}, ${numberFormat.format(workout.distance)} km. Cette suppression est définitive dans ce journal.`, 'Supprimer');
    if (!confirmed) return;
    this.#workouts = this.#workouts.filter(current => current.id !== workout.id);
    const saved = this._setLocalStorage();
    this._render();
    document.querySelector('#new-workout').focus();
    this._announce(saved ? 'Séance supprimée.' : 'Séance retirée de cet onglet uniquement. La sauvegarde locale a échoué.', !saved);
  }

  _announce(message, error = false) {
    const status = document.querySelector('#status');
    status.textContent = message;
    status.classList.toggle('is-error', error);
  }

  _storageWarning(message) {
    document.querySelector('#storage-warning').hidden = false;
    document.querySelector('#storage-warning-text').textContent = message;
    document.querySelector('#download-recovery').hidden = this.#recoveryRaw === null;
    document.querySelector('#reset-storage').hidden = this.#recoveryRaw === null;
  }

  _getLocalStorage() {
    try {
      const raw = localStorage.getItem('workouts');
      if (raw === null) return;
      this.#recoveryRaw = raw;
      this.#workouts = readWorkouts(JSON.parse(raw));
      this.#recoveryRaw = null;
    } catch {
      this.#storageBlocked = this.#recoveryRaw !== null;
      this._storageWarning(this.#storageBlocked
        ? 'Historique illisible, conservé sans modification. Récupérez-le avant de réinitialiser. Les nouvelles séances resteront dans cet onglet : exportez-les avant de le fermer.'
        : 'Sauvegarde locale inaccessible. Exportez votre journal avant de fermer cet onglet.');
    }
  }

  _setLocalStorage() {
    if (this.#storageBlocked) return false;
    try {
      localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      document.querySelector('#storage-warning').hidden = true;
      return true;
    } catch {
      this._storageWarning('La sauvegarde locale a échoué. Les changements restent dans cet onglet : exportez votre journal avant de le fermer.');
      return false;
    }
  }

  async _resetStorage() {
    const confirmed = await this._confirm('Réinitialiser la sauvegarde locale ?', 'Vérifiez que vous avez récupéré l’historique brut. Il sera remplacé par les séances actuellement visibles dans ce journal.', 'Réinitialiser');
    if (!confirmed) return;
    this.#storageBlocked = false;
    if (!this._setLocalStorage()) {
      this.#storageBlocked = true;
      return this._announce('Réinitialisation impossible. Exportez votre journal pour conserver vos séances.', true);
    }
    this.#recoveryRaw = null;
    this._announce('Sauvegarde locale réinitialisée avec les séances de ce journal.');
  }

  _download(content, filename) {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  _exportWorkouts() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), workouts: this.#workouts };
    this._download(JSON.stringify(payload, null, 2), `mapty-journal-${dateInputValue()}.json`);
    this._announce('Export du journal lancé. Conservez le fichier JSON pour retrouver vos séances.');
  }

  async _importWorkouts(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (!form.hidden) throw new Error('Enregistrez ou annulez la saisie en cours avant d’importer.');
      if (file.size > 10 * 1024 * 1024) throw new Error('Le fichier dépasse la limite de 10 Mo.');
      let payload;
      try { payload = JSON.parse(await file.text()); }
      catch { throw new Error('Le fichier JSON est illisible. Choisissez un export Mapty valide.'); }
      const incoming = readWorkouts(payload);
      const merged = mergeWorkouts(this.#workouts, incoming);
      if (merged.workouts.length > 10000) throw new Error('Votre journal dépasserait 10 000 séances.');
      this.#workouts = merged.workouts;
      const saved = this._setLocalStorage();
      this._resetFilters();
      this._render();
      this._announce(`${merged.added} séance${merged.added === 1 ? '' : 's'} importée${merged.added === 1 ? '' : 's'}. ${merged.skipped} déjà présente${merged.skipped === 1 ? '' : 's'} ignorée${merged.skipped === 1 ? '' : 's'}.${saved ? '' : ' Non sauvegardé : exportez le journal avant de fermer cet onglet.'}`, !saved);
    } catch (error) {
      this._announce(`Import annulé. ${error.message} Votre journal n’a pas été modifié.`, true);
    } finally { event.target.value = ''; }
  }
}

new App();
