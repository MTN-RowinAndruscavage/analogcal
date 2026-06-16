const AnnualDial = (() => {
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const Q_COLORS = [
    // Q1: cool blue
    { base: [0.25, 0.40, 0.65], light: [0.30, 0.47, 0.72] },
    // Q2: green
    { base: [0.25, 0.55, 0.35], light: [0.30, 0.62, 0.40] },
    // Q3: warm amber
    { base: [0.65, 0.45, 0.20], light: [0.72, 0.52, 0.25] },
    // Q4: deep red
    { base: [0.60, 0.25, 0.25], light: [0.67, 0.30, 0.30] },
  ];

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  function daysInYear(y) {
    return isLeapYear(y) ? 366 : 365;
  }

  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    return Math.floor(diff / 86400000);
  }

  function init(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
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
    const month = now.getMonth();
    const totalDays = daysInYear(year);
    const months = [...DAYS_IN_MONTH];
    if (isLeapYear(year)) months[1] = 29;

    const sectorAngle = (Math.PI * 2) / 12;
    const startOffset = -Math.PI / 2;

    // month sectors
    for (let i = 0; i < 12; i++) {
      const a0 = startOffset + i * sectorAngle;
      const a1 = a0 + sectorAngle;
      const quarter = Math.floor(i / 3);
      const has31 = months[i] === 31;
      const qc = Q_COLORS[quarter];
      const c = has31 ? qc.light : qc.base;
      const isActive = i === month;
      const brightness = isActive ? 1.0 : 0.55;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();

      const r = Math.round(c[0] * brightness * 255);
      const g = Math.round(c[1] * brightness * 255);
      const b = Math.round(c[2] * brightness * 255);

      const grad = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R);
      grad.addColorStop(0, `rgba(${r + 20}, ${g + 20}, ${b + 20}, 0.9)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.9)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // sector divider
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // month label
      const midA = (a0 + a1) / 2;
      const labelR = R * 0.72;
      const lx = cx + Math.cos(midA) * labelR;
      const ly = cy + Math.sin(midA) * labelR;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midA + Math.PI / 2);
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 24 : 18}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive ? '#fff' : 'rgba(200, 200, 210, 0.7)';
      const label = (i === 1 && isLeapYear(year)) ? 'FEB†' : MONTHS[i];
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    // quarter labels on inner ring
    const qLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (let q = 0; q < 4; q++) {
      const midMonth = q * 3 + 1;
      const midA = startOffset + midMonth * sectorAngle + sectorAngle / 2;
      const qR = R * 0.42;
      const qx = cx + Math.cos(midA) * qR;
      const qy = cy + Math.sin(midA) * qR;

      ctx.save();
      ctx.translate(qx, qy);
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const qc = Q_COLORS[q].base;
      ctx.fillStyle = `rgba(${Math.round(qc[0] * 255)}, ${Math.round(qc[1] * 255)}, ${Math.round(qc[2] * 255)}, 0.6)`;
      ctx.fillText(qLabels[q], 0, 0);
      ctx.restore();
    }

    // week tick marks (52 weeks) on outer ring
    for (let w = 0; w < 52; w++) {
      const frac = w / 52;
      const a = startOffset + frac * Math.PI * 2;
      const innerR = R + 2;
      const outerR = R + 10;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
      ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      ctx.strokeStyle = (w % 4 === 0) ? 'rgba(200, 200, 210, 0.5)' : 'rgba(150, 150, 160, 0.25)';
      ctx.lineWidth = (w % 4 === 0) ? 1.5 : 0.8;
      ctx.stroke();
    }

    // week number labels between ticks
    for (let wk = 1; wk <= 52; wk++) {
      const frac = (wk - 0.5) / 52;
      const a = startOffset + frac * Math.PI * 2;
      const wkR = R * 0.93;
      const wx = cx + Math.cos(a) * wkR;
      const wy = cy + Math.sin(a) * wkR;

      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(a + Math.PI / 2);
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = (wk % 4 === 1) ? 'rgba(200, 200, 210, 0.5)' : 'rgba(190, 190, 200, 0.3)';
      ctx.fillText(wk.toString(), 0, 0);
      ctx.restore();
    }

    // hand pointing to current position in year
    const doy = dayOfYear(now);
    const fracHour = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000) / 86400;
    const yearFrac = (doy - 1 + fracHour) / totalDays;
    const handAngle = startOffset + yearFrac * Math.PI * 2;
    const handLen = R * 0.60;

    // hand shadow
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy + 1);
    ctx.lineTo(cx + Math.cos(handAngle) * handLen + 1, cy + Math.sin(handAngle) * handLen + 1);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // hand
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * handLen, cy + Math.sin(handAngle) * handLen);
    ctx.strokeStyle = '#e8c060';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // glow
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * handLen, cy + Math.sin(handAngle) * handLen);
    ctx.strokeStyle = 'rgba(232, 192, 96, 0.25)';
    ctx.lineWidth = 7;
    ctx.stroke();

    // center
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#c0a050';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c060';
    ctx.fill();

    // bezel
    ctx.beginPath();
    ctx.arc(cx, cy, R + 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(60, 60, 70, 0.8)';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.lineCap = 'butt';

    const titleEl = document.getElementById('annual-title');
    if (titleEl) titleEl.textContent = `Annual Calendar · ${year}`;
  }

  return { init, render };
})();
