const MillenniumDial = (() => {
  const SECTOR_COLORS = [
    [0.25, 0.42, 0.68],
    [0.25, 0.46, 0.57],
    [0.25, 0.51, 0.46],
    [0.25, 0.55, 0.35],
    [0.38, 0.52, 0.30],
    [0.52, 0.48, 0.25],
    [0.65, 0.45, 0.20],
    [0.63, 0.38, 0.22],
    [0.62, 0.32, 0.23],
    [0.60, 0.25, 0.25],
  ];

  const RING_DARKEN = [1.0, 0.72, 0.50, 0.35];

  function init(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }

  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function daysInYear(y) {
    return ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;
  }

  function render(state, now) {
    const { canvas, ctx } = state;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.46;

    ctx.clearRect(0, 0, w, h);

    const year = now.getFullYear();
    const doy = dayOfYear(now);
    const totalDays = daysInYear(year);
    const fracDay = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000) / 86400;
    const yearFrac = (doy - 1 + fracDay) / totalDays;

    const digits = [
      year % 10,
      Math.floor(year / 10) % 10,
      Math.floor(year / 100) % 10,
      Math.floor(year / 1000) % 10,
    ];

    const subFracs = [
      yearFrac,
      (year % 10 + yearFrac) / 10,
      (year % 100 + yearFrac) / 100,
      (year % 1000 + yearFrac) / 1000,
    ];

    const sectorAngle = (Math.PI * 2) / 10;
    const startOffset = -Math.PI / 2;

    const rings = [
      { inner: R * 0.78, outer: R * 0.98 },
      { inner: R * 0.56, outer: R * 0.76 },
      { inner: R * 0.34, outer: R * 0.54 },
      { inner: R * 0.14, outer: R * 0.32 },
    ];

    for (let ri = 0; ri < 4; ri++) {
      const { inner, outer } = rings[ri];
      const activeDigit = digits[ri];
      const darken = RING_DARKEN[ri];

      for (let s = 0; s < 10; s++) {
        const a0 = startOffset + s * sectorAngle;
        const a1 = a0 + sectorAngle;
        const isActive = s === activeDigit;
        const baseC = SECTOR_COLORS[s];
        const brightness = (isActive ? 1.0 : 0.4) * darken;

        ctx.beginPath();
        ctx.arc(cx, cy, outer, a0, a1);
        ctx.arc(cx, cy, inner, a1, a0, true);
        ctx.closePath();

        const r = Math.round(baseC[0] * brightness * 255);
        const g = Math.round(baseC[1] * brightness * 255);
        const b = Math.round(baseC[2] * brightness * 255);

        const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
        grad.addColorStop(0, `rgba(${r + 10}, ${g + 10}, ${b + 10}, 0.9)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.9)`);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a0) * inner, cy + Math.sin(a0) * inner);
        ctx.lineTo(cx + Math.cos(a0) * outer, cy + Math.sin(a0) * outer);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const handAngle = startOffset + (activeDigit + subFracs[ri]) * sectorAngle;

      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(handAngle) * (inner - 2) + 1,
        cy + Math.sin(handAngle) * (inner - 2) + 1
      );
      ctx.lineTo(
        cx + Math.cos(handAngle) * (outer + 2) + 1,
        cy + Math.sin(handAngle) * (outer + 2) + 1
      );
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(handAngle) * (inner - 2),
        cy + Math.sin(handAngle) * (inner - 2)
      );
      ctx.lineTo(
        cx + Math.cos(handAngle) * (outer + 2),
        cy + Math.sin(handAngle) * (outer + 2)
      );
      ctx.strokeStyle = '#e8c060';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(handAngle) * inner,
        cy + Math.sin(handAngle) * inner
      );
      ctx.lineTo(
        cx + Math.cos(handAngle) * outer,
        cy + Math.sin(handAngle) * outer
      );
      ctx.strokeStyle = 'rgba(232, 192, 96, 0.2)';
      ctx.lineWidth = 7;
      ctx.stroke();

      ctx.lineCap = 'butt';
    }

    // digit labels on outermost ring only, upright
    for (let s = 0; s < 10; s++) {
      const a0 = startOffset + s * sectorAngle;
      const midA = a0 + sectorAngle / 2;
      const labelR = (rings[0].inner + rings[0].outer) / 2;
      const lx = cx + Math.cos(midA) * labelR;
      const ly = cy + Math.sin(midA) * labelR;
      const isActive = s === digits[0];

      ctx.save();
      ctx.translate(lx, ly);
      const fontSize = isActive ? 24 : 20;
      ctx.font = `${isActive ? 'bold ' : ''}${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive ? '#fff' : 'rgba(200, 200, 210, 0.6)';
      ctx.fillText(s.toString(), 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, rings[3].inner - 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
    ctx.fill();

    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(200, 195, 180, 0.9)';
    ctx.fillText(year.toString(), cx, cy);

    ctx.beginPath();
    ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(60, 60, 70, 0.8)';
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  return { init, render };
})();
