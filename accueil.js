import { restoreRoute, restoreWorkout, numberFormat as nf } from './workouts.mjs';

const $ = selector => document.querySelector(selector);
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const DEMO_DATE = '2026-11-18';
const distanceFormat = new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2});
let routes, sport = 'running', map, line, mapLayers, drawAnimation, observed = false;
let leafletPromise, mapTimer, mapFailed = false;
let leafletCSSReady = false;

function sample() {
  const route = routes[sport];
  return restoreWorkout({ id:`mapty-demo-${sport}-20261118`, type:sport, date:DEMO_DATE,
    title:`Démonstration · ${sport === 'running' ? 'Course à pied' : 'Vélo'}`,
    distance:Math.round(route.distance / 10) / 100, duration:sport === 'running' ? 20 : 12,
    coords:route.start, route });
}

function drawPreview(route) {
  const scale = Math.cos(route.start[0] * Math.PI / 180);
  const points = route.coordinates.map(([lng, lat]) => [lng * scale, -lat]);
  const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const width = Math.max(...xs) - minX, height = Math.max(...ys) - minY;
  const factor = Math.min(490 / (width || 1e-9), 250 / (height || 1e-9));
  const plotted = points.map(([x,y]) => [55+(490-width*factor)/2+(x-minX)*factor,45+(250-height*factor)/2+(y-minY)*factor]);
  const d = plotted.map(([x,y],index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  $('#route-guide').setAttribute('d',d); $('#route-line').setAttribute('d',d);
  $('#pin-a').setAttribute('transform',`translate(${plotted[0].join(' ')})`);
  $('#pin-b').setAttribute('transform',`translate(${plotted.at(-1).join(' ')})`);
}

function animateTrace() {
  drawAnimation?.cancel();
  const element = map ? line?.getElement() : $('#route-line');
  if (!element || motion.matches) return;
  const length = element.getTotalLength();
  drawAnimation = element.animate([
    { strokeDasharray:`${length} ${length}`, strokeDashoffset:String(length) },
    { strokeDasharray:`${length} ${length}`, strokeDashoffset:'0' },
  ], { duration:1800, easing:'cubic-bezier(.22,1,.36,1)' });
}

function render(animate = true) {
  drawAnimation?.cancel();
  const route = routes[sport], workout = sample();
  drawPreview(route);
  $('#demo-distance').textContent = distanceFormat.format(route.distance / 1000);
  $('#demo-start').textContent = route.startLabel || 'Point de départ';
  $('#demo-end').textContent = route.endLabel || 'Point d’arrivée';
  $('#sample-title').textContent = sport === 'running' ? 'Course à pied à Abidjan' : 'Sortie vélo à Abidjan';
  $('#sample-distance').textContent = `${distanceFormat.format(workout.distance)} km`;
  $('#sample-duration').textContent = `${nf.format(workout.duration)} min`;
  $('#sample-rate-label').textContent = sport === 'running' ? 'Allure moyenne' : 'Vitesse moyenne';
  $('#sample-rate').textContent = sport === 'running' ? `${nf.format(workout.pace)} min/km` : `${nf.format(workout.speed)} km/h`;
  if (map) drawMap(route);
  $('#demo-status').textContent = `Exemple ${sport === 'running' ? 'à pied' : 'à vélo'} sélectionné. Le carnet ci-dessous suit votre choix.`;
  if (animate) animateTrace();
}

async function loadExamples() {
  $('#replay-route').disabled = true;
  $('#demo-status').textContent = 'Chargement des trajets d’exemple…';
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(),8000);
  try {
    const response = await fetch('assets/demo-routes.json', {signal:controller.signal});
    if (!response.ok) throw new Error('Trajets indisponibles');
    const data = await response.json();
    routes = {running:restoreRoute(data.running),cycling:restoreRoute(data.cycling)};
    document.querySelector('.demo-sports').disabled = false;
    $('#show-demo-map').disabled = $('#download-sample').disabled = false;
    $('#replay-route').textContent = 'Rejouer le tracé'; render(false);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting) && !observed) {
          observed = true; animateTrace(); observer.disconnect();
        }
      }, {threshold:.25});
      observer.observe($('.demo-stage'));
    } else animateTrace();
  } catch {
    $('#demo-status').textContent = 'Les exemples ne sont pas disponibles. Réessayez, ou ouvrez directement votre carnet.';
    $('#replay-route').textContent = 'Réessayer l’exemple';
  } finally { clearTimeout(timer); $('#replay-route').disabled = false; }
}

function loadLeaflet() {
  if (window.L && leafletCSSReady) return Promise.resolve();
  if (leafletPromise) return leafletPromise;
  leafletPromise = Promise.all(['css','js'].map(type => new Promise((resolve,reject) => {
    if (type === 'css' && leafletCSSReady || type === 'js' && window.L) { resolve(); return; }
    const element = document.createElement(type === 'css' ? 'link' : 'script');
    if (type === 'css') { element.rel='stylesheet'; element.href='vendor/leaflet/leaflet.css'; }
    else element.src='vendor/leaflet/leaflet.js';
    const timer = setTimeout(() => { element.remove(); reject(new Error('Délai dépassé')); },10000);
    element.onload = () => { clearTimeout(timer); if (type === 'css') leafletCSSReady = true; resolve(); };
    element.onerror = () => { clearTimeout(timer); element.remove(); reject(new Error('Carte indisponible')); };
    document.head.append(element);
  }))).catch(error => { leafletPromise = null; throw error; });
  return leafletPromise;
}

function drawMap(route) {
  mapLayers.clearLayers();
  line = L.polyline(route.coordinates.map(([lng,lat]) => [lat,lng]), {color:'#245b43',weight:4}).addTo(mapLayers);
  for (const [point,letter] of [[route.start,'A'],[route.end,'B']]) {
    L.marker(point,{title:letter === 'A' ? 'Départ A' : 'Arrivée B',alt:letter === 'A' ? 'Départ A' : 'Arrivée B',
      icon:L.divIcon({className:`demo-pin demo-pin-${letter.toLowerCase()}`,html:`<span>${letter}</span>`,iconSize:[32,32],iconAnchor:[16,16]})}).addTo(mapLayers);
  }
  map.fitBounds(line.getBounds(),{padding:[36,36],maxZoom:16,animate:false});
}

async function showMap() {
  const button = $('#show-demo-map');
  button.disabled = true; button.textContent = 'Ouverture de la carte…';
  try {
    await loadLeaflet();
    if (!map) {
      $('#demo-map').hidden = false; $('.demo-svg').setAttribute('hidden','');
      map = L.map('demo-map',{zoomControl:false,zoomAnimation:!motion.matches,fadeAnimation:!motion.matches});
      L.control.zoom({zoomInTitle:'Zoom avant',zoomOutTitle:'Zoom arrière'}).addTo(map);
      mapLayers = L.layerGroup().addTo(map);
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,updateWhenIdle:true,updateWhenZooming:false,
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Trajets <a href="https://routing.openstreetmap.de/about.html">FOSSGIS / OSRM</a>',
      });
      tiles.on('loading',() => {
        mapFailed = false; clearTimeout(mapTimer);
        mapTimer = setTimeout(() => { $('#map-error').hidden=false; $('#map-error').textContent='Le fond de carte tarde à répondre. Le tracé reste accessible.'; },8000);
      });
      tiles.on('tileerror',() => { mapFailed = true; });
      tiles.on('load',() => {
        clearTimeout(mapTimer); $('#map-error').hidden = !mapFailed;
        $('#map-error').textContent = mapFailed ? 'Une partie du fond est indisponible. Le tracé reste accessible.' : '';
      });
      drawMap(routes[sport]); tiles.addTo(map);
    } else { map.invalidateSize(); drawMap(routes[sport]); }
    button.hidden = true; $('#map-error').hidden = true; animateTrace();
    $('#demo-status').textContent = 'Carte ouverte. Vous pouvez la déplacer, zoomer et comparer les deux trajets d’exemple.';
  } catch {
    $('#map-error').hidden=false;
    $('#map-error').textContent='La carte n’a pas pu démarrer. Le tracé d’exemple reste disponible.';
    button.textContent='Réessayer la carte';
  } finally { button.disabled=false; }
}

document.querySelectorAll('[name=demo-sport]').forEach(input => input.addEventListener('change',() => {
  sport = input.value; render();
}));
$('#replay-route').addEventListener('click',() => routes ? animateTrace() : loadExamples());
$('#show-demo-map').addEventListener('click',showMap);
$('#download-sample').addEventListener('click',() => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({version:2,workouts:[sample()]},null,2)],{type:'application/json'}));
  const anchor = document.createElement('a'); anchor.href=url; anchor.download=`mapty-exemple-${sport}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
});
motion.addEventListener('change',() => {
  drawAnimation?.cancel();
  if (map) { map.options.zoomAnimation = !motion.matches; map.options.fadeAnimation = !motion.matches; }
});
if ('ResizeObserver' in window) new ResizeObserver(() => {
  if (!map) return;
  drawAnimation?.cancel(); map.invalidateSize();
  map.fitBounds(line.getBounds(),{padding:[36,36],maxZoom:16,animate:false});
}).observe($('.demo-stage'));
loadExamples();
