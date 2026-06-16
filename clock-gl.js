const ClockGL = (() => {
  const VERT_SRC = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FRAG_SRC = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_hours;
    uniform float u_minutes;
    uniform float u_seconds;

    #define PI 3.14159265359
    #define TAU 6.28318530718

    float sdArc(vec2 p, float ra, float rb, float startAngle, float sweepAngle) {
      float midAngle = startAngle + sweepAngle * 0.5;
      float halfSweep = abs(sweepAngle) * 0.5;
      float ca = cos(midAngle);
      float sa = sin(midAngle);
      p = mat2(ca, sa, -sa, ca) * p;
      p.x = abs(p.x);
      float ang = atan(p.x, p.y);
      if (ang < halfSweep) {
        return abs(length(p) - ra) - rb;
      }
      vec2 tip = ra * vec2(sin(halfSweep), cos(halfSweep));
      return length(p - tip) - rb;
    }

    float sdCircle(vec2 p, float r) {
      return length(p) - r;
    }

    float sdLine(vec2 p, vec2 a, vec2 b, float r) {
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      return length(pa - ba * h) - r;
    }

    float sdHand(vec2 p, float angle, float len, float width) {
      vec2 dir = vec2(sin(angle), cos(angle));
      vec2 tip = dir * len;
      return sdLine(p, vec2(0.0), tip, width);
    }

    float sdTriangleHand(vec2 p, float angle, float len, float baseW, float tipW) {
      float ca = cos(-angle);
      float sa = sin(-angle);
      vec2 rp = mat2(ca, -sa, sa, ca) * p;
      float t = clamp(rp.y / len, 0.0, 1.0);
      float w = mix(baseW, tipW, t);
      float dx = abs(rp.x) - w;
      float dy = rp.y < 0.0 ? -rp.y : (rp.y > len ? rp.y - len : 0.0);
      return max(dx, dy);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);

      float r = length(uv);
      float angle = atan(uv.x, uv.y);

      vec3 col = vec3(0.04, 0.04, 0.06);

      // outer bezel
      float bezel = smoothstep(0.005, 0.0, abs(r - 0.47) - 0.008);
      col = mix(col, vec3(0.15, 0.15, 0.18), bezel);

      // dial face gradient
      float face = 1.0 - smoothstep(0.0, 0.46, r);
      col = mix(col, mix(vec3(0.06, 0.06, 0.08), vec3(0.10, 0.10, 0.13), r / 0.46), face);

      // 24-hour tick marks
      for (int i = 0; i < 24; i++) {
        float a = float(i) / 24.0 * TAU;
        vec2 dir = vec2(sin(a), cos(a));
        float innerR = (mod(float(i), 6.0) == 0.0) ? 0.34 : 0.38;
        float thickness = (mod(float(i), 6.0) == 0.0) ? 0.004 : 0.002;
        float d = sdLine(uv, dir * innerR, dir * 0.44, thickness);
        float tick = smoothstep(0.002, 0.0, d);
        vec3 tickCol = (mod(float(i), 6.0) == 0.0) ? vec3(0.9, 0.85, 0.7) : vec3(0.4, 0.4, 0.45);
        col = mix(col, tickCol, tick);
      }

      // minute ticks (60)
      for (int i = 0; i < 60; i++) {
        float a = float(i) / 60.0 * TAU;
        vec2 dir = vec2(sin(a), cos(a));
        float d = sdLine(uv, dir * 0.42, dir * 0.44, 0.001);
        float tick = smoothstep(0.001, 0.0, d);
        col = mix(col, vec3(0.25, 0.25, 0.3), tick);
      }

      // hour hand angle: 24-hour, one full rotation per day
      float hourAngle = (u_hours + u_minutes / 60.0) / 24.0 * TAU;
      float dHour = sdTriangleHand(uv, hourAngle, 0.22, 0.012, 0.003);
      float hourMask = smoothstep(0.003, 0.0, dHour);
      col = mix(col, vec3(0.85, 0.80, 0.65), hourMask);
      // hour hand glow
      float hourGlow = smoothstep(0.03, 0.0, dHour) * 0.15;
      col += vec3(0.85, 0.75, 0.5) * hourGlow;

      // minute hand
      float minAngle = (u_minutes + u_seconds / 60.0) / 60.0 * TAU;
      float dMin = sdTriangleHand(uv, minAngle, 0.34, 0.008, 0.002);
      float minMask = smoothstep(0.002, 0.0, dMin);
      col = mix(col, vec3(0.85, 0.85, 0.9), minMask);
      float minGlow = smoothstep(0.025, 0.0, dMin) * 0.1;
      col += vec3(0.7, 0.7, 0.9) * minGlow;

      // second hand
      float secAngle = u_seconds / 60.0 * TAU;
      float dSec = sdHand(uv, secAngle, 0.40, 0.0015);
      float secMask = smoothstep(0.001, 0.0, dSec);
      col = mix(col, vec3(0.9, 0.25, 0.15), secMask);
      float secGlow = smoothstep(0.02, 0.0, dSec) * 0.2;
      col += vec3(0.9, 0.2, 0.1) * secGlow;

      // counterweight
      float dCounter = sdHand(uv, secAngle + PI, 0.10, 0.004);
      float counterMask = smoothstep(0.002, 0.0, dCounter);
      col = mix(col, vec3(0.9, 0.25, 0.15), counterMask);

      // center cap
      float cap = smoothstep(0.003, 0.0, r - 0.018);
      col = mix(col, vec3(0.7, 0.65, 0.55), cap);
      float capInner = smoothstep(0.002, 0.0, r - 0.008);
      col = mix(col, vec3(0.9, 0.3, 0.2), capInner);

      // sweep arc for seconds (thin colored arc)
      float sweepAngle = u_seconds / 60.0 * TAU;
      float dArc = sdArc(uv, 0.455, 0.003, 0.0, sweepAngle);
      float arcMask = smoothstep(0.002, 0.0, dArc);
      col = mix(col, vec3(0.9, 0.3, 0.15), arcMask * 0.8);
      float arcGlow = smoothstep(0.015, 0.0, dArc) * 0.15;
      col += vec3(0.9, 0.2, 0.1) * arcGlow;

      // vignette
      col *= 1.0 - 0.3 * pow(r / 0.5, 2.0);

      // circle mask
      float mask = smoothstep(0.49, 0.485, r);
      col *= mask;

      gl_FragColor = vec4(col, mask);
    }
  `;

  function init(canvasId) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) {
      console.error('WebGL not supported');
      return null;
    }

    function compileShader(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compileShader(VERT_SRC, gl.VERTEX_SHADER);
    const fs = compileShader(FRAG_SRC, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return null;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uHours = gl.getUniformLocation(prog, 'u_hours');
    const uMinutes = gl.getUniformLocation(prog, 'u_minutes');
    const uSeconds = gl.getUniformLocation(prog, 'u_seconds');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    canvas.parentNode.insertBefore(wrapper, canvas);
    wrapper.appendChild(canvas);

    const overlay = document.createElement('canvas');
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.borderRadius = '0';
    overlay.style.boxShadow = 'none';
    wrapper.appendChild(overlay);
    const ctx2d = overlay.getContext('2d');

    return { gl, uRes, uHours, uMinutes, uSeconds, canvas, overlay, ctx2d };
  }

  function render(ctx, now) {
    if (!ctx) return;
    const { gl, uRes, uHours, uMinutes, uSeconds, canvas } = ctx;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000.0;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.04, 0.04, 0.06, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uHours, hours);
    gl.uniform1f(uMinutes, minutes);
    gl.uniform1f(uSeconds, seconds);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const { overlay, ctx2d } = ctx;
    if (ctx2d) {
      const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mmm = MONTH_ABBR[now.getMonth()];
      const dd = String(now.getDate()).padStart(2, '0');
      const titleEl = document.getElementById('clock-title');
      if (titleEl) titleEl.textContent = `24-Hour Clock · ${mmm}-${dd}`;

      ctx2d.clearRect(0, 0, overlay.width, overlay.height);
      const labelR = 0.31 * Math.min(canvas.width, canvas.height);
      const cxc = canvas.width / 2;
      const cyc = canvas.height / 2;
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2;
        const x = cxc + Math.sin(a) * labelR;
        const y = cyc - Math.cos(a) * labelR;
        const isMajor = i % 6 === 0;
        ctx2d.font = isMajor ? 'bold 11px "Courier New", monospace' : '9px "Courier New", monospace';
        ctx2d.textAlign = 'center';
        ctx2d.textBaseline = 'middle';
        ctx2d.fillStyle = isMajor ? 'rgba(210, 200, 180, 0.85)' : 'rgba(150, 150, 170, 0.5)';
        ctx2d.fillText(i.toString(), x, y);
      }
    }
  }

  return { init, render };
})();
