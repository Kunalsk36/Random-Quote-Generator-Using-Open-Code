const API_URL = 'https://dummyjson.com/quotes/random';

const quoteEl = document.getElementById('quote');
const authorEl = document.getElementById('author');
const buttonEl = document.getElementById('new-quote');
const blockEl = document.getElementById('quote-block');
const cardEl = document.getElementById('card');
const stageEl = document.querySelector('.stage');

const FADE_OUT = 340; // ms, must match the CSS transition duration
const MAX_TILT = 8;   // degrees at full deflection
const EASE = 0.14;    // lerp factor per frame

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setLoading(isLoading) {
  buttonEl.disabled = isLoading;
  buttonEl.innerHTML = isLoading
    ? '<span class="loader"></span>Loading'
    : 'New quote';
}

async function fetchQuote() {
  setLoading(true);
  blockEl.classList.add('is-out');

  // Let the fade-out finish before swapping the content.
  await wait(FADE_OUT);

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    quoteEl.textContent = data.quote;
    authorEl.textContent = data.author || 'Unknown';
    quoteEl.classList.remove('error');
  } catch (error) {
    quoteEl.textContent = 'Something went wrong. Please try again.';
    quoteEl.classList.add('error');
    authorEl.textContent = '';
    console.error(error);
  } finally {
    // Fade the new quote back in.
    blockEl.classList.remove('is-out');
    setLoading(false);
  }
}

buttonEl.addEventListener('click', fetchQuote);

/* ---------- Screen-wide 3D tilt ---------- */
/* The card tracks the pointer anywhere on the page, not just when the
   pointer is over the card itself. */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer && !reducedMotion) {
  const current = { x: 0, y: 0, lift: 0 };
  const target = { x: 0, y: 0, lift: 0 };
  let frame = null;

  // Soft saturation: near 1.0 at the card edge, easing toward 1 far away.
  const shape = (value) => Math.tanh(value * 1.15);

  const render = () => {
    current.x += (target.x - current.x) * EASE;
    current.y += (target.y - current.y) * EASE;
    current.lift += (target.lift - current.lift) * EASE;

    cardEl.style.setProperty('--rx', `${current.x.toFixed(3)}deg`);
    cardEl.style.setProperty('--ry', `${current.y.toFixed(3)}deg`);
    cardEl.style.setProperty('--lift', `${current.lift.toFixed(4)}`);

    const settled =
      Math.abs(target.x - current.x) < 0.005 &&
      Math.abs(target.y - current.y) < 0.005 &&
      Math.abs(target.lift - current.lift) < 0.0005;

    if (settled) {
      current.x = target.x;
      current.y = target.y;
      current.lift = target.lift;
      cardEl.style.setProperty('--rx', `${current.x.toFixed(3)}deg`);
      cardEl.style.setProperty('--ry', `${current.y.toFixed(3)}deg`);
      cardEl.style.setProperty('--lift', `${current.lift.toFixed(4)}`);
      frame = null;
      return;
    }

    frame = requestAnimationFrame(render);
  };

  const start = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  // Cache the reference box so pointermove never triggers a layout read.
  let box = null;

  const measure = () => {
    const rect = stageEl.getBoundingClientRect();
    box = {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      halfWidth: rect.width / 2 || 1,
      halfHeight: rect.height / 2 || 1,
    };
  };

  const onPointerMove = (event) => {
    if (event.pointerType === 'touch') return;
    if (!box) measure();

    // Normalized pointer position relative to the card (-1 .. 1 at the edges).
    const nx = (event.clientX - box.centerX) / box.halfWidth;
    const ny = (event.clientY - box.centerY) / box.halfHeight;

    // The card leans away from the pointer's vertical position and
    // towards its horizontal position. The further the pointer is from
    // the card, the gentler the lean (but it never stops responding).
    const distance = Math.max(Math.abs(nx), Math.abs(ny));
    const reach = 1 / (1 + Math.max(0, distance - 1) * 0.55);

    target.y = shape(nx) * MAX_TILT * reach;
    target.x = -shape(ny) * MAX_TILT * reach;

    // Lift the card a little when the pointer is over/near it.
    const overCard = Math.abs(nx) <= 1 && Math.abs(ny) <= 1;
    const nearCard = Math.abs(nx) <= 2 && Math.abs(ny) <= 2;
    target.lift = overCard ? 1 : 0;
    cardEl.classList.toggle('is-over', overCard);
    cardEl.classList.toggle('is-near', nearCard && !overCard);

    // Cursor-following highlight, clamped to the card box so the light
    // pools on the edge nearest the pointer.
    const gx = Math.min(1, Math.max(0, (nx + 1) / 2));
    const gy = Math.min(1, Math.max(0, (ny + 1) / 2));
    cardEl.style.setProperty('--mx', `${(gx * 100).toFixed(1)}%`);
    cardEl.style.setProperty('--my', `${(gy * 100).toFixed(1)}%`);

    start();
  };

  const reset = () => {
    target.x = 0;
    target.y = 0;
    target.lift = 0;
    cardEl.classList.remove('is-over');
    cardEl.classList.remove('is-near');
    start();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Re-measure on scroll, resize, or when the quote height changes.
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(stageEl);
  }

  // The entrance animation shifts the stage, so re-measure once it ends.
  window.addEventListener('load', measure);
  setTimeout(measure, 800);

  // Reset when the pointer leaves the viewport or the window loses focus.
  document.addEventListener('pointerout', (event) => {
    if (!event.relatedTarget && event.pointerType !== 'touch') reset();
  });

  document.addEventListener('mouseleave', reset);
  window.addEventListener('blur', reset);
} else {
  // Touch / reduced motion: keep the card perfectly flat.
  cardEl.style.setProperty('--rx', '0deg');
  cardEl.style.setProperty('--ry', '0deg');
}

fetchQuote();
