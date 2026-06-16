const DayDial = (() => {
  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const DAY_COLORS = [
    [0.25, 0.45, 0.70],
    [0.30, 0.50, 0.65],
    [0.35, 0.55, 0.60],
    [0.40, 0.55, 0.55],
    [0.45, 0.50, 0.60],
    [0.55, 0.40, 0.55],
    [0.50, 0.35, 0.50],
  ];

  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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

    const jsDay = now.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

    const sectorAngle = (Math.PI * 2) / 7;
    const startOffset = -Math.PI / 2;

    for (let i = 0; i < 7; i++) {
      const a0 = startOffset + i * sectorAngle;
      const a1 = a0 + sectorAngle;

      const isActive = i === dayIndex;
      const c = DAY_COLORS[i];
      const brightness = isActive ? 1.0 : 0.4;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
      const r = Math.round(c[0] * brightness * 255);
      const g = Math.round(c[1] * brightness * 255);
      const b = Math.round(c[2] * brightness * 255);
      grad.addColorStop(0, `rgba(${r + 30}, ${g + 30}, ${b + 30}, 0.9)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.9)`);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // sector divider lines
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // label
      const midA = (a0 + a1) / 2;
      const labelR = R * 0.8;
      const lx = cx + Math.cos(midA) * labelR;
      const ly = cy + Math.sin(midA) * labelR;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midA + Math.PI / 2);
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 20 : 16}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive ? '#fff' : 'rgba(200, 200, 210, 0.6)';
      ctx.fillText(DAYS[i], 0, 0);
      ctx.restore();

      // date number under day label
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() + (i - dayIndex));
      const dd = dayDate.getDate();
      const ddR = R * 0.6;
      const ddx = cx + Math.cos(midA) * ddR;
      const ddy = cy + Math.sin(midA) * ddR;

      ctx.save();
      ctx.translate(ddx, ddy);
      ctx.rotate(midA + Math.PI / 2);
      ctx.font = `${isActive ? 'bold ' : ''}${isActive ? 18 : 14}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.7)' : 'rgba(200, 200, 210, 0.35)';
      ctx.fillText(dd.toString(), 0, 0);
      ctx.restore();
    }

    // hand pointing to current day progress through the day
    const dayFraction = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000) / 86400;
    const handAngle = startOffset + dayIndex * sectorAngle + dayFraction * sectorAngle;
    const handLen = R * 0.55;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * handLen, cy + Math.sin(handAngle) * handLen);
    ctx.strokeStyle = '#e8c060';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // glow
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * handLen, cy + Math.sin(handAngle) * handLen);
    ctx.strokeStyle = 'rgba(232, 192, 96, 0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // center cap
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#c0a050';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c060';
    ctx.fill();

    // bezel ring
    ctx.beginPath();
    ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(60, 60, 70, 0.8)';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.lineCap = 'butt';

    const weekNum = getISOWeek(now);
    const titleEl = document.getElementById('day-dial-title');
    if (titleEl) titleEl.textContent = `Day of Week · W${weekNum}`;
  }

  return { init, render };
})();
