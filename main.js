(() => {
  const clockCtx = ClockGL.init('clock-gl');
  const dayCtx = DayDial.init('day-dial');
  const annualCtx = AnnualDial.init('annual-dial');
  const millenniumCtx = MillenniumDial.init('millennium-dial');

  function frame() {
    const now = new Date();
    ClockGL.render(clockCtx, now);
    DayDial.render(dayCtx, now);
    AnnualDial.render(annualCtx, now);
    MillenniumDial.render(millenniumCtx, now);
    Nixie.render(now);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
