const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopRoute = matchMedia('(min-width:1060px)');
const svg = document.querySelector('.route-example svg');
const path = svg.querySelector('path');
const points = svg.querySelectorAll('circle');
let routeAnimations = [];
let hasPlayed = false;

function animateRoute() {
  routeAnimations.forEach(animation => animation.cancel());
  routeAnimations = [];
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = '0';
  if (reducedMotion.matches || !desktopRoute.matches || document.hidden || hasPlayed) return;
  hasPlayed = true;
  for (const point of points) {
    point.style.transformBox = 'fill-box';
    point.style.transformOrigin = 'center';
  }
  routeAnimations.push(points[0].animate([
    { transform:'scale(1)' },
    { transform:'scale(1.13)', fill:'#e8eee7', offset:.45 },
    { transform:'scale(1)' },
  ], { duration:420, easing:'ease-out' }));
  routeAnimations.push(path.animate([
    { strokeDashoffset:String(length) }, { strokeDashoffset:'0' },
  ], { duration:2100, delay:180, easing:'cubic-bezier(.22,1,.36,1)', fill:'both' }));
  routeAnimations.push(points[1].animate([
    { transform:'scale(1)', fill:'#245b43' },
    { transform:'scale(1.16)', fill:'#33845e', offset:.45 },
    { transform:'scale(1)', fill:'#245b43' },
  ], { duration:420, delay:2280, easing:'ease-out' }));
}

reducedMotion.addEventListener('change', animateRoute);
desktopRoute.addEventListener('change', animateRoute);
document.addEventListener('visibilitychange', animateRoute);
animateRoute();
