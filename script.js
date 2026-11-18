import {
  SPORT_LABELS, numberFormat as nf, dateInputValue, sessionDate, parseNumber,
  restoreWorkout, readWorkouts, mergeWorkouts, weekBounds, weekSummary, visibleWorkouts, validCoords,
} from './workouts.mjs';
import { calculateRoute } from './routing.mjs';

const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const DEFAULT_COORDS = [5.3484, -4.0305];
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const coordinatesLabel = point => point ? `${point[0].toFixed(4)}, ${point[1].toFixed(4)}` : '';

// Le dessin est issu du trajet enregistré, jamais d’un exemple décoratif.
function routePreview(route) {
  if (!route) return '<span class="route-letter">A</span><span class="route-preview-line"></span><span class="route-letter">B</span>';
  const coordinates = route.coordinates;
  const scale = Math.cos(route.start[0] * Math.PI / 180);
  const xs = coordinates.map(point => point[0] * scale);
  const ys = coordinates.map(point => -point[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const width = Math.max(...xs) - minX, height = Math.max(...ys) - minY;
  const factor = Math.min(216 / (width || 1e-9), 96 / (height || 1e-9));
  const project = index => [12 + (216 - width * factor) / 2 + (xs[index] - minX) * factor,
    12 + (96 - height * factor) / 2 + (ys[index] - minY) * factor];
  const step = Math.max(1, Math.ceil(coordinates.length / 240));
  const indexes = coordinates.map((_, index) => index).filter(index => index % step === 0 || index === coordinates.length - 1);
  const points = indexes.map(index => project(index).map(value => value.toFixed(2)).join(',')).join(' ');
  const start = project(0), end = project(coordinates.length - 1);
  return `<svg viewBox="0 0 240 120" aria-hidden="true"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${start[0]}" cy="${start[1]}" r="6" fill="white" stroke="currentColor" stroke-width="3"/><circle cx="${end[0]}" cy="${end[1]}" r="6" fill="currentColor"/></svg>`;
}

class App {
  constructor() {
    this.workouts = [];
    this.view = 'journal';
    this.selectedId = null;
    this.draft = null;
    this.builder = null;
    this.storageBlocked = false;
    this.recoveryRaw = null;
    this.loadStorage();
    this.attachEvents();
    this.renderJournal();
    this.ensureMap();
  }

  attachEvents() {
    for (const button of all('a[data-view]')) button.addEventListener('click', async event => {
      event.preventDefault();
      if (await this.leaveDraft()) this.showView(button.dataset.view);
    });
    for (const id of ['new-workout', 'empty-add', 'mobile-add']) $(`#${id}`).addEventListener('click', () => this.openEditor());
    $('#start-from-map').addEventListener('click', () => { this.openEditor(); this.openBuilder(); });
    $('#workout-form').addEventListener('submit', event => this.saveWorkout(event));
    $('#workout-form').addEventListener('input', event => {
      if (this.draft) this.draft.dirty = true;
      event.target.removeAttribute('aria-invalid');
      const message = event.target.closest('.field')?.querySelector('.field-error');
      if (message) message.textContent = '';
      $('#form-error').textContent = '';
    });
    all('[name=sport]').forEach(input => input.addEventListener('change', () => this.changeSport(input.value)));
    $('#cancel-workout').addEventListener('click', async () => { if (await this.leaveDraft()) this.showView(this.selectedId ? 'detail' : 'journal'); });
    $('#edit-route').addEventListener('click', () => this.openBuilder());
    $('#remove-route').addEventListener('click', () => { this.draft.route = this.draft.points = this.draft.coords = null; this.draft.dirty = true; this.renderRoutePreview(); this.drawWorkouts(); });
    $('#detail-back').addEventListener('click', () => this.showView('journal'));
    $('#edit-selected').addEventListener('click', () => this.openEditor(this.selectedId));
    $('#delete-selected').addEventListener('click', () => this.deleteSelected());
    $('.workouts').addEventListener('click', event => {
      const button = event.target.closest('[data-id]');
      if (button) this.showDetail(button.dataset.id);
    });
    $('#detail-content').addEventListener('click', event => { if (event.target.closest('[data-show-route]')) this.showView('map'); });
    $('#selected-map-back').addEventListener('click', () => this.showDetail(this.selectedId));
    $('#toggle-filters').addEventListener('click', () => {
      $('#filters').hidden = !$('#filters').hidden;
      $('#toggle-filters').setAttribute('aria-expanded', String(!$('#filters').hidden));
    });
    for (const id of ['filter-type', 'filter-period', 'sort-workouts']) $(`#${id}`).addEventListener('change', () => this.renderJournal());
    $('#reset-filters').addEventListener('click', () => {
      $('#filter-type').value = $('#filter-period').value = 'all';
      $('#sort-workouts').value = 'recent'; this.renderJournal();
    });
    $('#cancel-route').addEventListener('click', () => this.closeBuilder());
    $('#choose-start').addEventListener('click', () => this.selectPoint('start'));
    $('#choose-end').addEventListener('click', () => this.selectPoint('end'));
    $('#use-map-center').addEventListener('click', () => {
      const point = this.map?.getCenter().wrap();
      if (point) this.setPoint([point.lat, point.lng]);
    });
    $('#reverse-route').addEventListener('click', () => {
      [this.builder.start, this.builder.end] = [this.builder.end, this.builder.start];
      this.invalidateRoute(); this.renderBuilder(); this.drawBuilder();
    });
    $('#reset-route').addEventListener('click', () => {
      this.builder.start = this.builder.end = null; this.builder.active = 'start';
      this.invalidateRoute(); this.renderBuilder(); this.drawBuilder();
    });
    $('#route-sport').addEventListener('change', event => {
      this.builder.sport = event.target.value; this.invalidateRoute(); this.renderBuilder(); this.drawBuilder();
    });
    $('#calculate-route').addEventListener('click', () => this.calculate());
    $('#accept-route').addEventListener('click', () => this.acceptRoute());
    $('#locate-me').addEventListener('click', () => this.locate());
    $('#retry-map').addEventListener('click', () => this.tiles ? this.tiles.redraw() : this.ensureMap());
    $('#export-workouts').addEventListener('click', () => {
      this.download(JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), workouts: this.workouts }, null, 2), `mapty-${dateInputValue()}.json`);
      $('#tools-menu').open = false; this.announce('Sauvegarde exportée.');
    });
    $('#import-workouts').addEventListener('click', () => $('#import-file').click());
    $('#import-file').addEventListener('change', event => this.importWorkouts(event));
    $('#download-recovery').addEventListener('click', () => this.download(this.recoveryRaw, 'mapty-historique-a-recuperer.json'));
    $('#reset-storage').addEventListener('click', () => this.resetStorage());
    document.addEventListener('click', event => { if (!event.target.closest('#tools-menu')) $('#tools-menu').open = false; });
    document.addEventListener('keydown', async event => {
      if (event.key !== 'Escape' || $('#confirm-dialog').open) return;
      if ($('#tools-menu').open) { $('#tools-menu').open = false; $('#tools-menu > summary').focus(); }
      else if (this.builder) this.closeBuilder();
      else if (this.draft && await this.leaveDraft()) this.showView(this.selectedId ? 'detail' : 'journal');
    });
    window.addEventListener('beforeunload', event => { if (this.draft?.dirty) { event.preventDefault(); event.returnValue = ''; } });
    window.addEventListener('resize', () => { this.ensureMap(); this.map?.invalidateSize(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { $('#workout-date').max = dateInputValue(); this.renderJournal(); } });
  }

  showView(view, focus = true) {
    clearTimeout(this.toastTimer); $('#status').hidden = true;
    this.view = view;
    document.body.dataset.view = view;
    document.body.dataset.editing = String(Boolean(this.draft));
    $('#workout-form').hidden = view !== 'editor';
    $('#activity-detail').hidden = view !== 'detail';
    $('#journal').hidden = view !== 'journal';
    $('#route-builder').hidden = !this.builder;
    for (const link of all('a[data-view]')) {
      if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    this.ensureMap();
    requestAnimationFrame(() => {
      this.map?.invalidateSize();
      if (!this.builder) this.drawWorkouts();
      if (focus) {
        const target = view === 'editor' ? $('#form-title') : view === 'detail' ? $('#detail-title') : view === 'map' ? $('#map') : $('#journal h2');
        target?.setAttribute('tabindex', '-1'); target?.focus({ preventScroll: true });
        if (view === 'map') $('#map').setAttribute('tabindex', '0');
      }
    });
  }

  async leaveDraft() {
    if (!this.draft) return true;
    if (this.draft.dirty && !await this.confirm('Quitter la saisie ?', 'Les modifications de cette séance seront perdues.', 'Quitter la saisie')) return false;
    this.abortCalculation(); this.builder = this.draft = null;
    $('#route-builder').hidden = true;
    return true;
  }

  openEditor(id = null) {
    if (this.draft) return;
    const workout = this.workouts.find(item => item.id === id);
    this.draft = { id: workout?.id || null, route: workout?.route || null, points: workout?.route || null, coords: workout?.coords || null, dirty: false };
    $('#workout-form').reset(); this.clearErrors();
    const values = { title: workout?.title || '', date: workout ? dateInputValue(workout.date) : dateInputValue(),
      distance: workout?.distance ?? '', duration: workout?.duration ?? '', cadence: workout?.cadence ?? '', elevation: workout?.elevationGain ?? '' };
    for (const [key, value] of Object.entries(values)) $(`#workout-${key}`).value = value;
    $('#workout-date').max = dateInputValue();
    $(`[name=sport][value=${workout?.type || 'running'}]`).checked = true;
    $('#form-title').textContent = workout ? 'Modifier la séance' : 'Nouvelle séance';
    $('#extra-fields').open = false; $('.form-body').scrollTop = 0;
    this.renderSport(); this.renderRoutePreview(); this.showView('editor');
  }

  sport() { return $('[name=sport]:checked').value; }
  renderSport() { $('#cadence-row').hidden = this.sport() !== 'running'; $('#elevation-row').hidden = this.sport() !== 'cycling'; }
  changeSport() {
    if (this.draft.route && this.draft.route.profile !== (this.sport() === 'cycling' ? 'bike' : 'foot')) {
      this.draft.route = null;
      this.announce('Le sport a changé. Recalculez le trajet pour ce sport.');
    }
    this.renderSport(); this.renderRoutePreview();
  }

  renderRoutePreview() {
    const route = this.draft.route;
    $('#route-preview-visual').innerHTML = routePreview(route);
    $('#route-preview-title').textContent = route ? `${nf.format(route.distance / 1000)} km de trajet` : this.draft.points ? 'Recalculer pour ce sport' : this.draft.coords ? 'Lieu unique enregistré' : 'Définir un départ et une arrivée';
    $('#route-preview-description').textContent = route ? 'Départ et arrivée définis · modifier' : this.draft.coords ? 'Ajouter un itinéraire à cette séance' : 'Tracer un itinéraire sur la carte';
    $('#remove-route').hidden = !route && !this.draft.coords;
  }

  clearErrors() {
    for (const field of all('#workout-form input')) field.removeAttribute('aria-invalid');
    for (const message of all('#workout-form .field-error')) message.textContent = '';
  }

  saveWorkout(event) {
    event.preventDefault(); this.clearErrors();
    const distance = parseNumber($('#workout-distance').value), duration = parseNumber($('#workout-duration').value);
    const date = sessionDate($('#workout-date').value);
    const optionalKey = this.sport() === 'running' ? 'cadence' : 'elevation';
    const optionalInput = $(`#workout-${optionalKey}`);
    const optionalValue = optionalInput.value.trim() ? parseNumber(optionalInput.value) : null;
    const errors = [];
    for (const [key, value] of [['distance', distance], ['duration', duration]]) {
      if (!Number.isFinite(value) || value <= 0) {
        $(`#${key}-error`).textContent = 'Saisissez un nombre supérieur à zéro.'; errors.push($(`#workout-${key}`));
      }
    }
    if (optionalValue !== null && (!Number.isFinite(optionalValue) || optionalKey === 'cadence' && optionalValue <= 0)) {
      $(`#${optionalKey}-error`).textContent = optionalKey === 'cadence' ? 'La cadence doit être supérieure à zéro.' : 'Saisissez un nombre valide.';
      $('#extra-fields').open = true; errors.push(optionalInput);
    }
    if (!date || dateInputValue(date) > dateInputValue()) { $('#form-error').textContent = 'Choisissez une date valide, au plus tard aujourd’hui.'; errors.push($('#workout-date')); }
    if (errors.length) {
      errors.forEach(input => input.setAttribute('aria-invalid', 'true')); errors[0].focus(); return;
    }
    let workout;
    try {
      workout = restoreWorkout({ id: this.draft.id || crypto.randomUUID(), type: this.sport(), coords: this.draft.coords,
        title: $('#workout-title').value.trim(), distance, duration, date: dateInputValue(date), route: this.draft.route,
        cadence: this.sport() === 'running' ? optionalValue : null, elevationGain: this.sport() === 'cycling' ? optionalValue : null });
    } catch (error) { $('#form-error').textContent = error.message; return; }
    if (this.storageBlocked) return this.announce('Récupérez puis réinitialisez l’historique illisible avant d’enregistrer.', true);
    const index = this.workouts.findIndex(item => item.id === workout.id);
    if (index < 0) this.workouts.push(workout); else this.workouts[index] = workout;
    const saved = this.persist();
    this.draft = null; this.selectedId = workout.id;
    this.renderJournal(); this.showDetail(workout.id);
    this.announce(saved ? 'Séance enregistrée.' : 'Séance conservée dans cet onglet. Exportez-la avant de fermer.', !saved);
  }

  renderJournal() {
    const summary = weekSummary(this.workouts);
    $('#summary-distance').textContent = nf.format(summary.distance);
    $('#summary-duration').textContent = nf.format(summary.duration);
    $('#summary-count').textContent = summary.count;
    const { start, end } = weekBounds(); end.setDate(end.getDate() - 1);
    const range = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    $('#week-range').textContent = `${range.format(start)} au ${range.format(end)}`;
    const visible = visibleWorkouts(this.workouts, { type: $('#filter-type').value, period: $('#filter-period').value, sort: $('#sort-workouts').value });
    $('.workouts').innerHTML = visible.map(workout => `<li class="workout"><button type="button" class="workout-button" data-id="${escapeHTML(workout.id)}"><span><span class="workout-name">${escapeHTML(workout.title || SPORT_LABELS[workout.type])}</span><span class="workout-date">${dateFormat.format(workout.date)}</span></span><span class="workout-distance">${nf.format(workout.distance)} <small>km</small></span><span class="workout-note">${SPORT_LABELS[workout.type]} · ${nf.format(workout.duration)} min</span><span class="workout-track">${workout.route ? 'Trajet A/B' : workout.coords ? 'Lieu unique' : 'Saisie libre'}</span></button></li>`).join('');
    $('#empty-state').hidden = this.workouts.length > 0;
    $('#filter-empty').hidden = !this.workouts.length || visible.length > 0;
    $('#toggle-filters').hidden = !this.workouts.length;
    if (!this.workouts.length) { $('#filters').hidden = true; $('#toggle-filters').setAttribute('aria-expanded', 'false'); }
  }

  showDetail(id) {
    const workout = this.workouts.find(item => item.id === id);
    if (!workout) return this.showView('journal');
    this.selectedId = id;
    const metric = (label, value, unit) => `<div><dt>${label}</dt><dd>${nf.format(value)}<small>${unit}</small></dd></div>`;
    $('#detail-content').innerHTML = `<p class="detail-date">${SPORT_LABELS[workout.type]} · ${dateFormat.format(workout.date)}</p><h2 class="detail-title" id="detail-title" tabindex="-1">${escapeHTML(workout.title || SPORT_LABELS[workout.type])}</h2><dl class="detail-metrics">${metric('Distance', workout.distance, 'km')}${metric('Durée', workout.duration, 'min')}${workout.type === 'running' ? metric('Allure moyenne', workout.pace, 'min/km') : metric('Vitesse moyenne', workout.speed, 'km/h')}${workout.type === 'running' && workout.cadence !== null ? metric('Cadence', workout.cadence, 'pas/min') : workout.type === 'cycling' && workout.elevationGain !== null ? metric('Dénivelé', workout.elevationGain, 'm') : ''}</dl>${workout.route ? `<button type="button" class="detail-route" data-show-route>${routePreview(workout.route)}<strong>Voir le trajet sur la carte</strong><span>${nf.format(workout.route.distance / 1000)} km calculés · ${workout.route.profile === 'foot' ? 'à pied' : 'à vélo'}</span></button>` : workout.coords ? '<button type="button" class="button secondary" data-show-route>Voir le lieu sur la carte</button>' : '<p class="muted">Séance sans lieu ni trajet enregistré.</p>'}`;
    this.showView('detail');
  }

  async deleteSelected() {
    const workout = this.workouts.find(item => item.id === this.selectedId);
    if (!workout || !await this.confirm('Supprimer cette séance ?', `${workout.title || workout.description} sera retirée du journal. Cette action ne peut pas être annulée.`, 'Supprimer')) return;
    if (this.storageBlocked) return this.announce('Récupérez l’historique avant toute modification.', true);
    this.workouts = this.workouts.filter(item => item.id !== workout.id); this.selectedId = null;
    this.persist(); this.renderJournal(); this.showView('journal'); this.announce('Séance supprimée.');
  }

  ensureMap() {
    if (!$('#map-view').getBoundingClientRect().width || this.map) return;
    try {
      if (typeof L === 'undefined') throw new Error('Leaflet indisponible');
      let view;
      try { view = JSON.parse(localStorage.getItem('mapty-view')); } catch { /* Vue facultative. */ }
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.map = L.map('map', { zoomControl: false, worldCopyJump: true, zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion }).setView(validCoords(view?.coords) ? view.coords : DEFAULT_COORDS,
        Number.isInteger(view?.zoom) && view.zoom >= 1 && view.zoom <= 19 ? view.zoom : 13);
      L.control.zoom({ zoomInTitle: 'Zoom avant', zoomOutTitle: 'Zoom arrière' }).addTo(this.map);
      all('.leaflet-control-zoom a').forEach(control => control.setAttribute('aria-label', control.title));
      this.layers = L.layerGroup().addTo(this.map);
      this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, tuiles <a href="https://www.openstreetmap.fr/">OSM France</a> · Trajets <a href="https://routing.openstreetmap.de/about.html">FOSSGIS / OSRM</a> · <a href="https://www.openstreetmap.org/fixthemap">Corriger la carte</a>',
      });
      this.tiles.on('loading', () => {
        this.tileFailed = false; this.mapStatus('Chargement du fond de carte…');
        clearTimeout(this.tileTimer); this.tileTimer = setTimeout(() => this.mapStatus('Le fond de carte tarde à répondre. Vérifiez votre connexion.', true), 8000);
      });
      this.tiles.on('tileerror', () => { this.tileFailed = true; });
      this.tiles.on('load', () => { clearTimeout(this.tileTimer); if (this.tileFailed) this.mapStatus('Une partie du fond de carte est indisponible. Le journal reste accessible.', true); else $('#map-status').hidden = true; });
      this.tiles.addTo(this.map);
      this.map.on('click', event => { if (this.builder) { const point = event.latlng.wrap(); this.setPoint([point.lat, point.lng]); } });
      this.map.on('moveend', () => {
        const point = this.map.getCenter().wrap();
        try { localStorage.setItem('mapty-view', JSON.stringify({ coords: [point.lat, point.lng], zoom: this.map.getZoom() })); } catch { /* La carte fonctionne sans mémoriser sa vue. */ }
      });
      this.drawWorkouts();
    } catch { this.mapStatus('La carte n’a pas pu démarrer. Votre journal reste accessible.', true); }
  }

  mapStatus(message, retry = false) { $('#map-status').hidden = false; $('#map-status-text').textContent = message; $('#retry-map').hidden = !retry; }

  pin(point, letter, draggable = false, onMove = null) {
    const marker = L.marker(point, { draggable, title: letter === 'A' ? 'Départ A' : 'Arrivée B', alt: letter === 'A' ? 'Départ A' : 'Arrivée B',
      icon: L.divIcon({ className: `route-pin${letter === 'B' ? ' route-pin--end' : ''}`, html: `<span>${letter}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] }) });
    if (onMove) marker.on('dragend', () => { const location = marker.getLatLng().wrap(); onMove([location.lat, location.lng]); });
    return marker.addTo(this.layers);
  }

  drawRoute(route, selected = true) {
    const line = L.polyline(route.coordinates.map(([lng, lat]) => [lat, lng]), { color: '#245b43', weight: selected ? 5 : 3, opacity: selected ? .95 : .45 }).addTo(this.layers);
    if (selected) { this.pin(route.start, 'A'); this.pin(route.end, 'B'); }
    return line;
  }

  fitRoute(route) {
    const size = this.map.getSize();
    const bottom = this.builder ? Math.min($('#route-builder').getBoundingClientRect().height + 35, size.y * .58) : 100;
    this.map.fitBounds(L.latLngBounds(route.coordinates.map(([lng, lat]) => [lat, lng])), { paddingTopLeft: [40, 90], paddingBottomRight: [40, bottom], maxZoom: 16, animate: false });
  }

  drawWorkouts() {
    if (!this.map || this.builder) return;
    this.layers.clearLayers();
    const selected = this.workouts.find(item => item.id === this.selectedId);
    for (const workout of this.workouts) {
      if (workout.route) this.drawRoute(workout.route, workout === selected).on('click', () => this.showDetail(workout.id));
      else if (workout.coords) L.circleMarker(workout.coords, { radius: 7, color: '#245b43', fillOpacity: .8 }).addTo(this.layers).on('click', () => this.showDetail(workout.id));
    }
    $('#map-heading').textContent = selected ? selected.title || selected.description : 'Les lieux de vos séances';
    $('#map-selection').hidden = !selected || this.view !== 'map';
    $('#map-selection-title').textContent = selected?.title || (selected ? SPORT_LABELS[selected.type] : '');
    if (selected?.route) this.fitRoute(selected.route);
    else if (selected?.coords) this.map.setView(selected.coords, 14, { animate: false });
  }

  openBuilder() {
    if (!this.draft) return;
    const route = this.draft.route;
    this.builder = { start: route?.start || this.draft.points?.start || this.draft.coords, end: route?.end || this.draft.points?.end || null, active: route ? 'end' : 'start', sport: this.sport(), route, busy: false, error: '' };
    this.showView('map', false); $('#map-selection').hidden = true; $('#location-status').hidden = true;
    this.renderBuilder();
    requestAnimationFrame(() => { this.map?.invalidateSize(); this.drawBuilder(); if (route) this.fitRoute(route); $('#choose-start').focus({ preventScroll: true }); });
  }

  closeBuilder() {
    this.abortCalculation(); this.builder = null; this.showView('editor', false); $('#edit-route').focus();
  }

  abortCalculation() { this.routeController?.abort(); this.routeController = null; }
  invalidateRoute() { this.abortCalculation(); this.builder.route = null; this.builder.busy = false; this.builder.error = ''; }
  selectPoint(key) { this.builder.active = key; this.renderBuilder(); $('#map').focus({ preventScroll: true }); }
  setPoint(point) {
    if (!this.builder) return;
    this.builder[this.builder.active] = point;
    this.invalidateRoute();
    if (this.builder.active === 'start' && !this.builder.end) this.builder.active = 'end';
    this.draft.dirty = true; this.renderBuilder(); this.drawBuilder();
  }

  renderBuilder() {
    const builder = this.builder;
    $('#route-sport').value = builder.sport;
    $('#start-label').textContent = builder.route?.startLabel || coordinatesLabel(builder.start) || 'Toucher la carte';
    $('#end-label').textContent = builder.route?.endLabel || coordinatesLabel(builder.end) || 'Toucher la carte';
    $('#choose-start').setAttribute('aria-pressed', String(builder.active === 'start'));
    $('#choose-end').setAttribute('aria-pressed', String(builder.active === 'end'));
    $('#reverse-route').disabled = !builder.start || !builder.end;
    $('#calculate-route').disabled = !builder.start || !builder.end || builder.busy;
    $('#calculate-route').textContent = builder.busy ? 'Calcul du trajet…' : 'Calculer le trajet';
    $('#calculate-route').hidden = Boolean(builder.route);
    $('#accept-route').hidden = !builder.route;
    $('#use-map-center').disabled = !this.map;
    $('#route-message').classList.toggle('is-error', Boolean(builder.error));
    $('#route-message').textContent = builder.error || (builder.busy ? 'Recherche d’un itinéraire par les rues et chemins…' : builder.route ? `${nf.format(builder.route.distance / 1000)} km ${builder.sport === 'cycling' ? 'à vélo' : 'à pied'}. Vérifiez le tracé avant de l’utiliser.` : !builder.start ? 'Choisissez le point de départ A.' : !builder.end ? 'Choisissez maintenant l’arrivée B.' : `Points définis. Lancez le calcul ${builder.sport === 'cycling' ? 'à vélo' : 'à pied'}.`);
    $('#map-heading').textContent = `Choisir ${builder.active === 'start' ? 'le départ A' : 'l’arrivée B'} sur la carte`;
  }

  drawBuilder() {
    if (!this.map || !this.builder) return;
    this.layers.clearLayers();
    if (this.builder.route) L.polyline(this.builder.route.coordinates.map(([lng, lat]) => [lat, lng]), { color: '#245b43', weight: 5 }).addTo(this.layers);
    for (const [key, letter] of [['start', 'A'], ['end', 'B']]) {
      if (this.builder[key]) this.pin(this.builder[key], letter, true, point => { this.builder.active = key; this.setPoint(point); });
    }
  }

  async calculate() {
    const builder = this.builder;
    if (!builder?.start || !builder.end || builder.busy) return;
    this.abortCalculation(); const controller = new AbortController(); this.routeController = controller;
    builder.busy = true; builder.error = ''; this.renderBuilder();
    try {
      const route = await calculateRoute(builder.start, builder.end, builder.sport, { signal: controller.signal });
      if (controller.signal.aborted || this.builder !== builder) return;
      builder.route = route; builder.busy = false; this.renderBuilder(); this.drawBuilder(); this.fitRoute(route);
      $('#accept-route').focus({ preventScroll: true });
    } catch (error) {
      if (controller.signal.aborted || this.builder !== builder) return;
      builder.busy = false; builder.error = error.message; this.renderBuilder();
    }
  }

  acceptRoute() {
    if (!this.builder?.route) return;
    this.draft.route = this.builder.route; this.draft.points = this.builder.route; this.draft.coords = [...this.builder.start]; this.draft.dirty = true;
    $(`[name=sport][value=${this.builder.sport}]`).checked = true;
    $('#workout-distance').value = String(Math.round(this.builder.route.distance / 10) / 100).replace('.', ',');
    this.renderSport(); this.renderRoutePreview(); this.closeBuilder();
    this.announce('Trajet ajouté. La distance est renseignée, vous pouvez l’ajuster.');
  }

  locate() {
    if (!navigator.geolocation) return this.locationMessage('La localisation est indisponible. Choisissez les points sur la carte.');
    $('#locate-me').disabled = true; $('#locate-me').textContent = 'Localisation…';
    let finished = false;
    const finish = message => { if (finished) return false; finished = true; clearTimeout(timer); $('#locate-me').disabled = false; $('#locate-me').textContent = 'Me localiser'; this.locationMessage(message); return true; };
    const timer = setTimeout(() => finish('Localisation trop longue. Choisissez les points sur la carte ou réessayez.'), 9000);
    navigator.geolocation.getCurrentPosition(position => {
      if (finish('Carte centrée sur votre position. Choisissez vos points sur la carte.')) this.map?.setView([position.coords.latitude, position.coords.longitude], 14);
    }, error => finish(error.code === 1 ? 'Localisation refusée. Choisissez les points sur la carte.' : 'Position indisponible. Réessayez ou choisissez les points sur la carte.'), { timeout: 7000, maximumAge: 60000, enableHighAccuracy: false });
  }
  locationMessage(message) { $('#location-status').textContent = message; $('#location-status').hidden = false; }

  loadStorage() {
    let raw;
    try { raw = localStorage.getItem('workouts'); }
    catch { this.storageWarning('Le stockage du navigateur est inaccessible. Exportez vos séances avant de fermer cet onglet.'); return; }
    if (!raw) return;
    try { this.workouts = readWorkouts(JSON.parse(raw)); }
    catch { this.storageBlocked = true; this.recoveryRaw = raw; this.storageWarning('L’historique enregistré est illisible. Téléchargez-le avant de réinitialiser. Aucun historique n’a été écrasé.', true); }
  }
  persist() {
    if (this.storageBlocked) return false;
    try { localStorage.setItem('workouts', JSON.stringify({ version: 2, workouts: this.workouts })); $('#storage-warning').hidden = true; return true; }
    catch { this.storageWarning('L’enregistrement sur cet appareil a échoué. Vos changements restent dans cet onglet. Exportez vos séances avant de le fermer.'); return false; }
  }
  storageWarning(message, recovery = false) {
    $('#storage-warning').hidden = false; $('#storage-warning-text').textContent = message;
    $('#download-recovery').hidden = $('#reset-storage').hidden = !recovery;
  }
  async resetStorage() {
    if (!await this.confirm('Réinitialiser l’historique ?', 'Téléchargez d’abord le fichier brut. Cette action effacera l’historique local illisible.', 'Réinitialiser')) return;
    try { localStorage.removeItem('workouts'); }
    catch { this.storageWarning('Impossible de réinitialiser le stockage du navigateur.', true); return; }
    this.abortCalculation(); this.builder = this.draft = null;
    this.storageBlocked = false; this.recoveryRaw = null; this.workouts = []; this.selectedId = null;
    $('#storage-warning').hidden = true; this.renderJournal(); this.showView('journal'); this.announce('Historique réinitialisé.');
  }
  async importWorkouts(event) {
    const input = event.target, file = input.files?.[0];
    if (!file) return;
    try {
      if (this.storageBlocked) throw new Error('Récupérez et réinitialisez l’historique illisible avant un import.');
      if (file.size > 20 * 1024 * 1024) throw new Error('Le fichier dépasse la limite de 20 Mo.');
      const incoming = readWorkouts(JSON.parse(await file.text()));
      const result = mergeWorkouts(this.workouts, incoming);
      if (result.workouts.length > 10000) throw new Error('Le journal dépasserait 10 000 séances.');
      this.workouts = result.workouts; const saved = this.persist(); this.renderJournal(); this.drawWorkouts();
      this.announce(`${result.added} séance(s) importée(s), ${result.skipped} déjà présente(s).${saved ? '' : ' Exportez avant de fermer.'}`, !saved);
    } catch (error) { this.announce(error instanceof SyntaxError ? 'Ce fichier ne contient pas une sauvegarde JSON valide.' : error.message, true); }
    finally { input.value = ''; $('#tools-menu').open = false; }
  }
  download(content, filename) {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  confirm(title, description, action) {
    const dialog = $('#confirm-dialog');
    $('#confirm-title').textContent = title; $('#confirm-description').textContent = description; $('#confirm-action').textContent = action;
    dialog.returnValue = ''; dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true }));
  }
  announce(message, error = false) {
    clearTimeout(this.toastTimer); $('#status').hidden = false; $('#status').textContent = message; $('#status').classList.toggle('is-error', error);
    this.toastTimer = setTimeout(() => { $('#status').hidden = true; }, error ? 11000 : 6500);
  }
}

new App();
