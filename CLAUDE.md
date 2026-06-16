# Analog Calendar Dashboard — Design Summary

## Architecture

Static single-page app. No build step, no dependencies. Open `index.html` in a browser.

### Module structure

Each visual element is a self-contained IIFE that exposes `{ init, render }`:

| Module | File | Rendering | Canvas |
|--------|------|-----------|--------|
| 24-Hour Clock | `clock-gl.js` | WebGL fragment shader + Canvas 2D overlay | `#clock-gl` |
| Day of Week | `day-dial.js` | Canvas 2D | `#day-dial` |
| Annual Calendar | `annual-dial.js` | Canvas 2D | `#annual-dial` |
| Millennium Dial | `millennium-dial.js` | Canvas 2D | `#millennium-dial` |
| Nixie Display | `nixie.js` | DOM manipulation | `#nixie-utc`, `#nixie-local` |

`main.js` is the entry point: calls each module's `init()`, then runs a `requestAnimationFrame` loop passing `new Date()` to each module's `render()`.

### Rendering pipeline

Every frame:
1. `ClockGL.render()` — GL draw call, then 2D overlay for hour labels + title update
2. `DayDial.render()` — full canvas redraw (sectors, labels, dates, hand)
3. `AnnualDial.render()` — full canvas redraw (sectors, labels, week ticks, hand) + title update
4. `MillenniumDial.render()` — full canvas redraw (4 donut rings, hands, center label)
5. `Nixie.render()` — DOM text updates for UTC and local ISO timestamps

All canvases are 500x500. The base radius `R = min(w, h) * 0.46` is the standard dial face radius.

## Conventions

### Coordinate system

All dials use `startOffset = -Math.PI / 2` so 0 / top-dead-center is 12 o'clock. Angles increase clockwise. Sector boundaries that represent domain boundaries (Sun/Mon, Dec/Jan, 9/0) align to top dead center.

### Color system

The project uses a consistent blue → green → amber → red palette:
- **Annual Calendar**: 4 quarterly colors applied to 3-month groups. 31-day months use the `light` variant.
- **Millennium Dial**: 10 sector colors interpolated across the same 4 anchor hues. Inner rings darken progressively via `RING_DARKEN` multipliers `[1.0, 0.72, 0.50, 0.35]`.
- **Day of Week**: 7 unique blue-purple tones.

Active sectors render at full brightness; inactive sectors at 0.4x (or 0.55x for the annual dial). Colors are stored as `[r, g, b]` floats in 0–1 range and converted to CSS `rgba()` at draw time.

### Sector drawing pattern

Every sectored dial follows the same pattern:
1. Compute `sectorAngle = TAU / N` and `startOffset = -PI/2`
2. Loop sectors: draw filled arc/donut, draw divider line, draw label
3. Draw hand(s) at computed angle with shadow → stroke → glow layers
4. Draw center cap and bezel ring

### Hand rendering (3-layer)

All hands use the same layered approach:
1. **Shadow** — offset by (1, 1), wider stroke, dark translucent
2. **Stroke** — gold `#e8c060`, primary width
3. **Glow** — wider translucent gold for soft halo

The millennium dial uses per-ring hands (inner-to-outer of each donut). All other dials use center-origin hands.

### Dynamic titles

Three dials update their `<h2>` titles each frame via `document.getElementById`:
- Clock: `24-Hour Clock · Jun-16` (MMM-DD)
- Day of Week: `Day of Week · W25` (ISO week)
- Annual Calendar: `Annual Calendar · 2026` (YYYY)

### WebGL clock specifics

The clock face (ticks, hands, sweep arc, vignette) is a single fragment shader using SDF primitives (`sdLine`, `sdHand`, `sdTriangleHand`, `sdArc`). Hour labels are rendered on a transparent Canvas 2D overlay created dynamically in `init()` and positioned absolutely over the GL canvas via a wrapper div.

## Adding a new dial

1. Create `my-dial.js` exposing `{ init(canvasId), render(state, now) }`
2. Add a `<canvas>` in `index.html` inside `.dials-row`
3. Add a `<script>` tag before `main.js`
4. In `main.js`, call `init()` and add `render()` to the frame loop
5. Use `R = Math.min(w, h) * 0.46` and `startOffset = -Math.PI / 2` for consistency

## Nixie display

DOM-based. Each character is a `<span class="nixie-char">`. Separators (`:`, `-`, `T`, `.`, `Z`, `+`) get the additional `.separator` class for dimmed styling. The display shows full ISO 8601 timestamps with millisecond precision for both UTC and local time.

## Leap year handling

`isLeapYear()` is defined in both `annual-dial.js` and `millennium-dial.js`. The annual dial shows `FEB†` (dagger superscript) during leap years and adjusts February's day count to 29. Both modules use leap-aware `daysInYear()` for fractional year progress calculations.
