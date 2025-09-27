const layers = document.querySelectorAll('.parallax-layer');
const hero = document.querySelector('.hero');
const exploreButton = document.querySelector('.explore');
const supportsMatchMedia = typeof window.matchMedia === 'function';
const reduceMotionQuery = supportsMatchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };
const finePointerQuery = supportsMatchMedia
  ? window.matchMedia('(pointer: fine)')
  : { matches: true };

function subscribeToQuery(query, callback) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', callback);
  } else if (typeof query.addListener === 'function') {
    query.addListener(callback);
  }
}

function handleParallax(event) {
  const rect = hero.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  const normalizedX = (offsetX / rect.width - 0.5) * 2;
  const normalizedY = (offsetY / rect.height - 0.5) * 2;

  layers.forEach((layer, index) => {
    const depth = (index + 1) / layers.length;
    const translateX = normalizedX * -12 * depth;
    const translateY = normalizedY * -12 * depth;
    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });
}

function resetParallax() {
  layers.forEach((layer) => {
    layer.style.transform = 'translate3d(0, 0, 0)';
  });
}

function enableParallax() {
  hero.addEventListener('mousemove', handleParallax);
  hero.addEventListener('mouseleave', resetParallax);
}

function disableParallax() {
  hero.removeEventListener('mousemove', handleParallax);
  hero.removeEventListener('mouseleave', resetParallax);
  resetParallax();
}

function updateParallaxPreference() {
  const shouldDisable = reduceMotionQuery.matches || !finePointerQuery.matches;
  if (shouldDisable) {
    disableParallax();
  } else {
    enableParallax();
  }
}

if (hero && layers.length) {
  updateParallaxPreference();
  subscribeToQuery(reduceMotionQuery, updateParallaxPreference);
  subscribeToQuery(finePointerQuery, updateParallaxPreference);
}

if (exploreButton) {
  exploreButton.addEventListener('click', () => {
    exploreButton.classList.add('clicked');
    setTimeout(() => exploreButton.classList.remove('clicked'), 450);
  });
}
