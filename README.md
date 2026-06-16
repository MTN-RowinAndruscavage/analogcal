# Analog Calendar Dashboard

A real-time browser dashboard that displays time and date across multiple analog dials and a nixie-tube-style digital readout. No frameworks, no build step — just open `index.html`.

## Elements

### 24-Hour Clock

A WebGL-rendered clock face with hour, minute, and second hands completing full rotations over 24 hours, 60 minutes, and 60 seconds respectively. Hour labels (0–23) ring the dial, with major hours (0, 6, 12, 18) emphasized. A red sweep arc traces seconds progress around the bezel. The title shows the current date in `MMM-DD` format.

### Day of Week

Seven colored sectors for Monday through Sunday, with the current day highlighted. Each sector shows the day abbreviation and the calendar date for that day of the current week. A gold hand tracks progress through the current day from midnight to midnight. The Sun/Mon boundary sits at 12 o'clock. The title shows the current ISO week number.

### Annual Calendar

Twelve month sectors colored by quarter (blue Q1, green Q2, amber Q3, red Q4), with 31-day months in a lighter shade. The current month is highlighted. Quarter labels (Q1–Q4) sit upright on the inner ring. Week tick marks and numbered labels (1–52) ring the outer edge. A hand tracks the current position in the year. The Dec/Jan boundary sits at 12 o'clock. February displays a dagger (†) during leap years. The title shows the current year.

### Millennium Dial

Four concentric donut rings decompose the current year into its decimal digits. The outermost ring represents the ones digit (year), progressing inward through tens (decade), hundreds (century), to the innermost ring for the thousands digit (millennium). Each ring has 10 sectors (0–9) colored in a blue-to-red gradient, with inner rings progressively darker. Per-ring hands show fractional progress within each digit's sector. The center displays the full four-digit year.

### Nixie Display

A retro-styled digital readout below the dials showing full ISO 8601 timestamps with millisecond precision for both UTC and local time. Digits glow orange; separator characters (`:`, `-`, `T`, `.`) are dimmed to keep the numbers prominent.

## Usage

Open `index.html` in any modern browser. All dials animate in real time via `requestAnimationFrame`. The 24-hour clock requires WebGL support. No network requests are made — everything runs locally.

On narrow screens (< 1100px) the dials stack vertically.
