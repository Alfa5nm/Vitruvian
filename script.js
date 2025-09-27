const layers = document.querySelectorAll('.parallax-layer');
const hero = document.querySelector('.hero');

function handleParallax(event) {
  const rect = hero.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  const normalizedX = (offsetX / rect.width - 0.5) * 2;
  const normalizedY = (offsetY / rect.height - 0.5) * 2;

  layers.forEach((layer, index) => {
    const depth = (index + 1) / layers.length;
    const translateX = normalizedX * -15 * depth;
    const translateY = normalizedY * -15 * depth;
    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });
}

function resetParallax() {
  layers.forEach((layer) => {
    layer.style.transform = 'translate3d(0, 0, 0)';
  });
}

hero.addEventListener('mousemove', handleParallax);
hero.addEventListener('mouseleave', resetParallax);

const exploreButton = document.querySelector('.explore');
exploreButton.addEventListener('click', () => {
  exploreButton.classList.add('clicked');
  setTimeout(() => exploreButton.classList.remove('clicked'), 600);
});
