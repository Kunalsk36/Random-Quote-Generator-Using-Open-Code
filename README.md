# Random Quote Generator

A clean, minimal random quote generator built with plain HTML, CSS, and JavaScript.
It fetches a fresh quote from the [DummyJSON](https://dummyjson.com/) API and presents it on a
glass card that tilts in 3D toward your cursor.

---

## Features

- **Random quotes** — one click fetches a new quote from `https://dummyjson.com/quotes/random`
- **Animated background** — soft, drifting colour blobs with a sweeping light sheen
- **Frosted glass card** — translucent surface with `backdrop-filter` blur
- **3D cursor tilt** — the card leans toward the pointer anywhere on the screen, not only on hover
- **Smooth quote transitions** — fade + blur + drift when the quote changes
- **Loading state** — inline spinner while the request is in flight
- **Error handling** — a friendly message if the API is unreachable
- **Fully responsive** — adapts to mobile and desktop screens
- **Accessible** — semantic HTML, `aria-live` region, focus-visible outlines
- **Reduced-motion friendly** — respects `prefers-reduced-motion`
- **Zero dependencies** — no frameworks, no build step, no package installs

---

## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Markup   | HTML5 (semantic elements)                    |
| Styling  | CSS3 (custom properties, Grid-free flexbox, 3D transforms, `backdrop-filter`) |
| Logic    | Vanilla JavaScript (ES2020+, Fetch API, `requestAnimationFrame`) |
| Data     | [DummyJSON Quotes API](https://dummyjson.com/quotes/random) |

---

## Project Structure

```
Project-1/
├── index.html          # Page markup and the quote card
├── css/
│   └── style.css       # Layout, glass card, animations, 3D tilt
├── js/
│   └── script.js       # API fetching, quote transitions, tilt engine
├── README.md           # This file
```

Each concern lives in its own file, so the HTML, CSS, and JavaScript stay separate and easy to
maintain.

---

## Getting Started

### Prerequisites

Any modern web browser (Chrome, Edge, Firefox, Safari). No Node.js, npm, or build tools required.

### Running the project

**Option 1 — Open directly**

Double-click `index.html` to open it in your browser.

**Option 2 — Local server (recommended)**

Some browsers restrict `fetch` calls made from `file://` pages. Serve the folder locally instead:

```bash
# Python
python -m http.server 8000

# or Node.js
npx serve .
```

Then visit [http://localhost:8000](http://localhost:8000).

---

## Usage

1. Open `index.html` in a browser — a quote loads automatically on page open.
2. Move your mouse anywhere on the screen — the card tilts gently toward your cursor.
3. Click **New quote** — the current quote fades out and a new one fades in.
4. Resize the window or switch to a mobile device — the layout adapts and the tilt disables itself on touch screens.

---

## API Reference

The project uses a single endpoint:

```http
GET https://dummyjson.com/quotes/random
```

**Response:**

```json
{
  "id": 179,
  "quote": "We'Re Getting Hurt, But I'M A Long-Term Investor.",
  "author": "Al Waleed Bin Talal"
}
```

| Field     | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| `id`      | number | Unique identifier for the quote    |
| `quote`   | string | The quote text                     |
| `author`  | string | The person the quote is attributed to |

---

## How It Works

### 1. Fetching a quote — `js/script.js`

`fetchQuote()` handles the whole lifecycle:

1. The button is disabled and swapped for a spinner.
2. A `.is-out` class is added to fade the current quote out (340 ms).
3. The request is sent to the API and the response is parsed.
4. The new quote and author are written into the DOM.
5. The `.is-out` class is removed, fading the new quote back in.

Errors are caught and rendered as a friendly message instead of throwing.

### 2. The 3D tilt — `js/script.js`

The tilt engine listens for `pointermove` on `window`, so the card reacts to the cursor
**anywhere on the page**:

- The pointer position is normalised against the card's bounding box into a `-1..1` range.
- `Math.tanh()` applies soft saturation, so the response eases in and out instead of hitting a hard limit.
- A `reach` factor scales the tilt down the further the cursor is from the card.
- The values are interpolated toward the target each frame with `requestAnimationFrame`, which keeps the motion fluid.
- Results are written to CSS custom properties `--rx`, `--ry`, and `--lift`, which the stylesheet consumes.

### 3. The visual layer — `css/style.css`

- `.stage` provides the `perspective` for the 3D scene.
- `.card` uses `transform-style: preserve-3d` so the quote, author, and button sit at different depths (`translateZ`).
- The frosted-glass `backdrop-filter` lives on a `::before` pseudo-element, because applying it to `.card` directly would flatten the 3D children.
- `@keyframes` drift the background blobs on long, independent loops so the gradient never visibly repeats.

---

## Customisation

Tweak the values in `css/style.css`:

```css
:root {
  --bg: #eef0f4;        /* Page background        */
  --text: #16181d;      /* Quote text             */
  --muted: #8a8f99;     /* Author / quote marks   */
  --accent: #16181d;    /* Button colour          */
  --shadow: ...;        /* Card shadow            */
}
```

Tune the tilt and timing in `js/script.js`:

```js
const MAX_TILT = 8;   // Maximum tilt in degrees
const EASE = 0.14;    // Lerp factor per frame (lower = smoother)
const FADE_OUT = 340; // Fade-out duration in ms
```

Swap the API by editing a single line:

```js
const API_URL = 'https://dummyjson.com/quotes/random';
```

---

## Browser Support

| Browser | Support |
| ------- | ------- |
| Chrome / Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Mobile Safari / Chrome | ✅ Layout and quotes work; 3D tilt is disabled on touch devices |

---

## Accessibility

- Semantic `<main>`, `<p>`, and `<button>` elements
- `aria-live="polite"` on the quote so screen readers announce new quotes
- Focus-visible outlines on the button
- The quote is never conveyed by colour alone
- `prefers-reduced-motion` disables the tilt, the background drift, and the transitions

---

## Licence

This project is open source and free to use for personal and commercial purposes.

---

## Credits

- **Data** — [DummyJSON](https://dummyjson.com/) Quotes API
- **Built with** — [OpenCode](https://opencode.ai/), powered by the MiniMax M3.1 Flash model

Made with ❤️ by Kunal

---
