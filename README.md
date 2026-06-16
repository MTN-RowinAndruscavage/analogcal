# Analog Calendar Dashboard

Clock and calendar displayed in smooth simple analog dials in browser WebGL.

![Analog Calendar Screenshot](https://private-user-images.githubusercontent.com/8740187/608815503-e78c16fe-82be-4ff7-bf33-e0bbd6a26a86.png)

## Elements

### 24-Hour Clock

Clock dial with hour, minute, and second hands completing full rotations over 24 hours, 60 minutes, and 60 seconds respectively. Hour labels (0–23) ring the dial, with major hours (0, 6, 12, 18) emphasized. A red sweep arc traces seconds progress around the bezel. The title shows the current date in `MMM-DD` format.

### Day of Week

Seven sectors for Monday through Sunday with the current day highlighted. Each sector shows the day abbreviation and the calendar date for that day of the current week. A gold hand tracks progress through the current day from midnight to midnight. The Sun/Mon boundary sits at 12 o'clock. The title shows the current ISO-8601 week number.

### Annual Calendar

Twelve month sectors colored by quarter (blue Q1, green Q2, amber Q3, red Q4), with 31-day months in a lighter shade. The current month is highlighted. Quarter labels (Q1–Q4) sit upright on the inner ring. Week tick marks and numbered labels (1–52) ring the outer edge. A hand tracks the current position in the year.  February displays a dagger (†) during leap years.

### Millennium Dial

Four concentric donut rings decompose the current year into its decimal digits. The rings track progress through the years comprising each decade, century, and millennia. Each ring has 10 sectors (0–9) colored in a blue-to-red gradient, with inner rings progressively darker.

### Nixie Display

A retro-styled digital readout below the dials showing full ISO 8601 timestamps with millisecond precision for both UTC and local time.

## Usage

Open `index.html` in any modern browser. All dials animate in real time via `requestAnimationFrame`. The 24-hour clock requires WebGL support. No network requests are made — everything runs locally.

On narrow screens (< 1100px) the dials stack vertically.
