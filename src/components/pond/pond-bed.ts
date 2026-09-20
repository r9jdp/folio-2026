/** Original, deterministic pond-bed artwork. Moving water/light belongs to the renderer. */
export function createPondBed(): HTMLCanvasElement {
  const width = 900;
  const height = 580;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  let seed = 839125;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const grids = [96, 38, 13, 4].map((size) => {
    const columns = Math.ceil(width / size) + 3;
    const rows = Math.ceil(height / size) + 3;
    const values = new Float32Array(columns * rows);
    for (let i = 0; i < values.length; i++) values[i] = random();
    return { size, columns, values };
  });
  const noise = (x: number, y: number, octave: number) => {
    const { size, columns, values } = grids[octave];
    const px = Math.max(0, x) / size;
    const py = Math.max(0, y) / size;
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const fx = px - ix;
    const fy = py - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const start = iy * columns + ix;
    const a = values[start] * (1 - u) + values[start + 1] * u;
    const b = values[start + columns] * (1 - u) + values[start + columns + 1] * u;
    return a * (1 - v) + b * v;
  };

  const bed = ctx.createImageData(width, height);
  const pixels = bed.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const broad = noise(x, y, 0);
      const medium = noise(x, y, 1);
      const small = noise(x, y, 2);
      const fine = noise(x, y, 3);
      const grain = (random() - 0.5) * 9;
      const moss = Math.max(0, medium * 0.65 + small * 0.35 - 0.4) * 2;
      const silt = Math.max(0, 0.53 - broad) * 1.5;
      const detail = (small - 0.5) * 13 + (fine - 0.5) * 10 + grain;
      const index = (y * width + x) * 4;
      pixels[index] = 43 + broad * 21 + moss * 28 + silt * 26 + detail;
      pixels[index + 1] = 64 + broad * 18 + moss * 31 + silt * 14 + detail;
      pixels[index + 2] = 43 + broad * 14 + moss * 5 + silt * 17 + detail * 0.7;
      pixels[index + 3] = 255;
    }
  }
  ctx.putImageData(bed, 0, 0);

  // Fine aggregate stays submerged and low contrast, without thousands of shadows.
  for (let i = 0; i < 4300; i++) {
    const x = random() * width;
    const y = random() * height;
    const r = 0.4 + Math.pow(random(), 3) * 3.1;
    const value = 72 + Math.floor(random() * 58);
    ctx.fillStyle = `rgba(${value + 8},${value + 11},${value - 12},${0.13 + random() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.35, r * 0.75, random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    if (r > 1.6) {
      ctx.fillStyle = 'rgba(14,34,22,.15)';
      ctx.fillRect(x, y + r * 0.7, r * 1.4, 0.7);
    }
  }

  // Rasterized rounded rock surfaces: an irregular outline, mineral grain,
  // creases, a shaded rim and broad illumination from the upper left.
  const stone = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rotation: number,
    color: number[],
  ) => {
    const rockSeed = random() * Math.PI * 2;
    const radiusAt = (a: number) =>
      0.9 + Math.sin(a * 3 + rockSeed) * 0.055 + Math.cos(a * 5 - rockSeed) * 0.025;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let step = 0; step <= 80; step++) {
      const angle = (step / 80) * Math.PI * 2;
      const radius = radiusAt(angle);
      const x = Math.cos(angle) * rx * radius;
      const y = Math.sin(angle) * ry * radius;
      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.shadowColor = 'rgba(8,25,15,.66)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 7;
    ctx.shadowOffsetY = 11;
    ctx.fillStyle = '#3e4c37';
    ctx.fill();
    ctx.restore();

    const margin = Math.ceil(Math.max(rx, ry) + 3);
    const x0 = Math.max(0, Math.floor(cx - margin));
    const y0 = Math.max(0, Math.floor(cy - margin));
    const x1 = Math.min(width, Math.ceil(cx + margin));
    const y1 = Math.min(height, Math.ceil(cy + margin));
    const image = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const u = (dx * cosine + dy * sine) / rx;
        const v = (-dx * sine + dy * cosine) / ry;
        const angle = Math.atan2(v, u);
        const radial = Math.hypot(u, v) / radiusAt(angle);
        if (radial >= 1) continue;
        const surface = Math.sqrt(Math.max(0, 1 - radial * radial));
        const light = surface * 0.49 - u * 0.2 - v * 0.25;
        const n = noise(x, y, 2);
        const grit = (random() - 0.5) * 12 + (noise(x, y, 3) - 0.5) * 9;
        const mineral = (n - 0.5) * 26 + (noise(x, y, 1) - 0.5) * 14;
        const fissure =
          Math.pow(
            Math.max(0, 1 - Math.abs(Math.sin(u * 3.4 + v * 4.5 + n * 1.1 + rockSeed)) * 18),
            2,
          ) * 7;
        const rim = Math.max(0, (radial - 0.77) / 0.23) * 23;
        const alpha = Math.min(1, (1 - radial) * Math.min(rx, ry));
        const index = ((y - y0) * (x1 - x0) + x - x0) * 4;
        for (let channel = 0; channel < 3; channel++) {
          const target = color[channel] + light * 54 + mineral + grit - rim - fissure;
          image.data[index + channel] = image.data[index + channel] * (1 - alpha) + target * alpha;
        }
      }
    }
    ctx.putImageData(image, x0, y0);
    // Small, discontinuous moss grows at the damp edge, not in a uniform halo.
    for (let i = 0; i < 65; i++) {
      const angle = random() * Math.PI * 2;
      if (Math.sin(angle * 2 + rockSeed) < 0.1) continue;
      const radial = 0.72 + random() * 0.2;
      const u = Math.cos(angle) * rx * radial;
      const v = Math.sin(angle) * ry * radial;
      const x = cx + u * cosine - v * sine;
      const y = cy + u * sine + v * cosine;
      ctx.fillStyle = `rgba(${61 + Math.floor(random() * 27)},${82 + Math.floor(random() * 32)},39,.27)`;
      ctx.beginPath();
      ctx.ellipse(x, y, 1 + random() * 4.2, 0.8 + random() * 2.5, angle + rotation, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  stone(119, 116, 82, 53, -0.38, [111, 116, 93]);
  stone(559, 338, 55, 41, 0.32, [110, 112, 92]);
  stone(775, 113, 73, 48, -0.6, [99, 109, 90]);
  stone(824, 539, 91, 64, 0.1, [94, 106, 84]);
  stone(123, 518, 49, 33, 0.42, [114, 117, 96]);

  const reeds = (x: number, y: number, direction: number, count: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(direction);
    // Blades share a grounded base, but each bends along its own narrow curve.
    for (let i = 0; i < count; i++) {
      const baseX = (random() - 0.5) * 25;
      const baseY = (random() - 0.5) * 14;
      const length = 51 + random() * 104;
      const lean = (random() - 0.5) * 104;
      const bladeWidth = 1.4 + random() * 3.2;
      const tipX = baseX + lean;
      const tipY = baseY - length;
      const gradient = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
      gradient.addColorStop(0, '#293d25');
      gradient.addColorStop(0.42, i % 3 ? '#617b3d' : '#81934e');
      gradient.addColorStop(1, i % 3 ? '#899952' : '#b1b66d');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(baseX - bladeWidth * 0.5, baseY);
      ctx.bezierCurveTo(baseX - 6, baseY - length * 0.6, tipX - lean * 0.26, tipY + 9, tipX, tipY);
      ctx.bezierCurveTo(
        tipX - lean * 0.23,
        tipY + 18,
        baseX + bladeWidth + 3,
        baseY - length * 0.52,
        baseX + bladeWidth * 0.5,
        baseY,
      );
      ctx.fill();
      ctx.strokeStyle = 'rgba(205,211,139,.21)';
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY - 7);
      ctx.quadraticCurveTo(baseX + lean * 0.25, baseY - length * 0.62, tipX, tipY);
      ctx.stroke();
    }
    ctx.restore();
  };
  reeds(-5, 34, 1.68, 23);
  reeds(901, 31, -1.4, 16);
  reeds(885, 589, -0.72, 21);
  return canvas;
}
