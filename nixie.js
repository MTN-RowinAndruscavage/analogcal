const Nixie = (() => {
  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function pad3(n) {
    if (n < 10) return '00' + n;
    if (n < 100) return '0' + n;
    return '' + n;
  }

  function pad4(n) {
    if (n < 10) return '000' + n;
    if (n < 100) return '00' + n;
    if (n < 1000) return '0' + n;
    return '' + n;
  }

  function formatISO(d, utc) {
    const y = utc ? d.getUTCFullYear() : d.getFullYear();
    const mo = utc ? d.getUTCMonth() + 1 : d.getMonth() + 1;
    const day = utc ? d.getUTCDate() : d.getDate();
    const h = utc ? d.getUTCHours() : d.getHours();
    const mi = utc ? d.getUTCMinutes() : d.getMinutes();
    const s = utc ? d.getUTCSeconds() : d.getSeconds();
    const ms = utc ? d.getUTCMilliseconds() : d.getMilliseconds();

    return `${pad4(y)}-${pad2(mo)}-${pad2(day)}T${pad2(h)}:${pad2(mi)}:${pad2(s)}.${pad3(ms)}`;
  }

  function formatTZ(d) {
    const off = d.getTimezoneOffset();
    if (off === 0) return 'Z';
    const sign = off < 0 ? '+' : '-';
    const absOff = Math.abs(off);
    const hh = Math.floor(absOff / 60);
    const mm = absOff % 60;
    return `${sign}${pad2(hh)}:${pad2(mm)}`;
  }

  function renderString(container, str) {
    const existing = container.children;
    const chars = str.split('');

    while (existing.length > chars.length) {
      container.removeChild(container.lastChild);
    }

    for (let i = 0; i < chars.length; i++) {
      let el;
      if (i < existing.length) {
        el = existing[i];
      } else {
        el = document.createElement('span');
        container.appendChild(el);
      }

      const ch = chars[i];
      const isSep = ch === '-' || ch === ':' || ch === 'T' || ch === '.' || ch === 'Z' || ch === '+';
      el.className = 'nixie-char' + (isSep ? ' separator' : '');

      if (el.textContent !== ch) {
        el.textContent = ch;
      }
    }
  }

  function render(now) {
    const utcStr = formatISO(now, true) + 'Z';
    const localStr = formatISO(now, false) + formatTZ(now);

    renderString(document.getElementById('nixie-utc'), utcStr);
    renderString(document.getElementById('nixie-local'), localStr);
  }

  return { render };
})();
