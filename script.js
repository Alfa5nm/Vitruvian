const heroScene = document.querySelector('.scene--hero');
const storyScene = document.querySelector('.scene--story');
const exploreButton = document.querySelector('.explore');
const replayButton = document.querySelector('.story-replay');
const blinkOverlay = document.querySelector('.blink-overlay');
const heroMeteorContainer = heroScene ? heroScene.querySelector('.meteors') : null;
const title = document.querySelector('.title');
const storyLines = storyScene ? storyScene.querySelectorAll('.story-line') : [];

const supportsMatchMedia = typeof window.matchMedia === 'function';
const reduceMotionQuery = supportsMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const finePointerQuery = supportsMatchMedia ? window.matchMedia('(pointer: fine)') : { matches: true };

function subscribeToQuery(query, callback) {
  if (!query) return;
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', callback);
  } else if (typeof query.addListener === 'function') {
    query.addListener(callback);
  }
}

let motionEnabled = !(reduceMotionQuery.matches || !finePointerQuery.matches);

function createParallaxContext(root, { strength = 16, active = true } = {}) {
  if (!root) return null;
  const layers = root.querySelectorAll('[data-depth]');
  if (!layers.length) return null;

  let frame = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isEnabled = false;
  let isActive = Boolean(active);

  function applyTransforms() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || '0');
      const translateX = currentX * depth;
      const translateY = currentY * depth;
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    if (Math.abs(currentX - targetX) > 0.5 || Math.abs(currentY - targetY) > 0.5) {
      frame = window.requestAnimationFrame(applyTransforms);
    } else {
      frame = null;
    }
  }

  function queueFrame() {
    if (frame === null) {
      frame = window.requestAnimationFrame(applyTransforms);
    }
  }

  function handlePointerMove(event) {
    const rect = root.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const normalizedX = (offsetX / rect.width - 0.5) * 2;
    const normalizedY = (offsetY / rect.height - 0.5) * 2;
    targetX = normalizedX * -strength;
    targetY = normalizedY * -strength;
    queueFrame();
  }

  function handlePointerLeave() {
    targetX = 0;
    targetY = 0;
    queueFrame();
  }

  function enable() {
    if (isEnabled || !isActive || !motionEnabled) return;
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerleave', handlePointerLeave);
    isEnabled = true;
  }

  function disable() {
    if (!isEnabled) return;
    root.removeEventListener('pointermove', handlePointerMove);
    root.removeEventListener('pointerleave', handlePointerLeave);
    isEnabled = false;
    handlePointerLeave();
  }

  function setActive(value) {
    const shouldBeActive = Boolean(value);
    if (shouldBeActive === isActive) return;
    isActive = shouldBeActive;
    if (!isActive) {
      disable();
    } else if (motionEnabled) {
      enable();
    }
  }

  function setMotionState(allowMotion) {
    if (!allowMotion) {
      disable();
    } else if (isActive) {
      enable();
    }
  }

  return {
    enable,
    disable,
    setActive,
    setMotionState,
    reset: handlePointerLeave,
  };
}

const parallaxContexts = [];
const heroParallax = createParallaxContext(heroScene, { strength: 18, active: true });
if (heroParallax) {
  parallaxContexts.push(heroParallax);
}
const storyParallax = createParallaxContext(storyScene, { strength: 12, active: false });
if (storyParallax) {
  parallaxContexts.push(storyParallax);
}

function updateMotionPreferences() {
  motionEnabled = !(reduceMotionQuery.matches || !finePointerQuery.matches);
  parallaxContexts.forEach((context) => context.setMotionState(motionEnabled));
}

updateMotionPreferences();
subscribeToQuery(reduceMotionQuery, updateMotionPreferences);
subscribeToQuery(finePointerQuery, updateMotionPreferences);

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function populateMeteors() {
  if (!heroMeteorContainer) return;
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

  heroMeteorContainer.appendChild(fragment);
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

  title.addEventListener('pointermove', (event) => {
    const letter = event.target.closest('.title-letter');
    setActiveLetter(letter);
  });

  title.addEventListener('pointerleave', () => {
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

function revealStoryLines() {
  if (!storyLines.length) return;

  storyLines.forEach((line) => {
    line.classList.remove('is-visible');
    line.style.animation = 'none';
  });

  // Force reflow so animations can restart
  void storyLines[0].offsetHeight;

  storyLines.forEach((line) => {
    line.style.animation = '';
    line.classList.add('is-visible');
  });
}

const BLINK_SWITCH_DELAY = 900;
let isTransitioning = false;

function enterStoryScene() {
  if (!storyScene) return;

  storyScene.removeAttribute('hidden');
  storyScene.setAttribute('aria-hidden', 'false');
  storyScene.classList.add('is-active');
  document.body.classList.add('has-entered-story');
  if (storyParallax) {
    storyParallax.setActive(true);
    storyParallax.setMotionState(motionEnabled);
  }
  revealStoryLines();
}

function hideHeroScene() {
  if (!heroScene) return;
  heroScene.classList.remove('is-active');
  heroScene.setAttribute('aria-hidden', 'true');
  heroScene.setAttribute('hidden', 'hidden');
  if (heroParallax) {
    heroParallax.setActive(false);
  }
}

function handleExploreClick() {
  if (isTransitioning) return;
  isTransitioning = true;

  document.body.classList.add('is-transitioning');
  if (exploreButton) {
    exploreButton.classList.add('is-pressed');
    window.setTimeout(() => exploreButton.classList.remove('is-pressed'), 420);
  }

  if (blinkOverlay) {
    blinkOverlay.classList.add('blink-overlay--active');
  }

  window.setTimeout(() => {
    hideHeroScene();
    enterStoryScene();
  }, BLINK_SWITCH_DELAY);

  if (blinkOverlay) {
    blinkOverlay.addEventListener(
      'animationend',
      () => {
        blinkOverlay.classList.remove('blink-overlay--active');
        document.body.classList.remove('is-transitioning');
        isTransitioning = false;
      },
      { once: true }
    );
  } else {
    document.body.classList.remove('is-transitioning');
    isTransitioning = false;
  }
}

function handleReplayClick() {
  if (replayButton) {
    replayButton.classList.add('is-pressed');
    window.setTimeout(() => replayButton.classList.remove('is-pressed'), 320);
  }
  revealStoryLines();
}

if (exploreButton) {
  exploreButton.addEventListener('click', handleExploreClick);
}

if (replayButton) {
  replayButton.addEventListener('click', handleReplayClick);
}

enhanceTitle();
populateMeteors();

if (storyScene && !storyScene.hasAttribute('hidden')) {
  revealStoryLines();
}
