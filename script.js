const layers = document.querySelectorAll('.parallax-layer');
const hero = document.querySelector('.hero');
const exploreButton = document.querySelector('.explore');
const meteorContainer = document.querySelector('.meteors');
const title = document.querySelector('.title');

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

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function populateMeteors() {
  if (!meteorContainer) return;

  const meteorTotal = 16;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < meteorTotal; i += 1) {
    const meteor = document.createElement('span');
    meteor.className = 'meteor';

    const startX = randomBetween(-25, 65);
    const startY = randomBetween(-60, -8);
    const travelX = randomBetween(45, 70);
    const travelY = randomBetween(50, 72);
    const duration = randomBetween(9, 16);
    const delay = randomBetween(-20, 0);
    const scale = randomBetween(0.55, 1.1);

    meteor.style.setProperty('--start-x', `${startX}vw`);
    meteor.style.setProperty('--start-y', `${startY}vh`);
    meteor.style.setProperty('--travel-x', `${travelX}vw`);
    meteor.style.setProperty('--travel-y', `${travelY}vh`);
    meteor.style.setProperty('--duration', `${duration}s`);
    meteor.style.setProperty('--delay', `${delay}s`);
    meteor.style.setProperty('--scale', scale.toFixed(2));

    fragment.appendChild(meteor);
  }

  meteorContainer.appendChild(fragment);
}

function enhanceTitle() {
  if (!title) return;

  const text = title.dataset.title || title.textContent || '';
  const trimmed = text.trim();
  if (!trimmed) return;

  title.setAttribute('aria-label', trimmed);

  const fragment = document.createDocumentFragment();
  const letters = Array.from(trimmed);

  letters.forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'title-letter';
    span.style.setProperty('--index', index);

    if (char === ' ') {
      span.classList.add('title-letter--space');
      span.innerHTML = '&nbsp;';
    } else {
      span.textContent = char;
    }

    fragment.appendChild(span);
  });

  title.textContent = '';
  title.appendChild(fragment);

  let activeLetter = null;

  function setActiveLetter(element) {
    if (activeLetter === element) return;
    if (activeLetter) {
      activeLetter.classList.remove('is-active');
    }
    activeLetter = element;
    if (activeLetter) {
      activeLetter.classList.add('is-active');
    }
  }

  title.addEventListener('mousemove', (event) => {
    const letter = event.target.closest('.title-letter');
    setActiveLetter(letter);
  });

  title.addEventListener('mouseleave', () => {
    setActiveLetter(null);
  });

  title.addEventListener('focus', () => {
    title.classList.add('is-focused');
  });

  title.addEventListener('blur', () => {
    title.classList.remove('is-focused');
    setActiveLetter(null);
  });
}

if (hero && layers.length) {
  updateParallaxPreference();
  subscribeToQuery(reduceMotionQuery, updateParallaxPreference);
  subscribeToQuery(finePointerQuery, updateParallaxPreference);
}

enhanceTitle();
populateMeteors();

if (exploreButton) {
  exploreButton.addEventListener('click', () => {
    exploreButton.classList.add('clicked');
    setTimeout(() => exploreButton.classList.remove('clicked'), 450);
  });
}
