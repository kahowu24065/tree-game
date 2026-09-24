export interface AnimalDrawOpts {
  scale?: number;
  night?: boolean;
  silhouette?: boolean;
  flip?: boolean;
}

export function drawAnimal(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  time: number,
  opts: AnimalDrawOpts = {},
): void {
  const scale = opts.scale ?? 1;
  const sil = opts.silhouette ?? false;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((opts.flip ? -1 : 1) * scale, scale);
  const bob = opts.night && id === 'firefly' ? 0 : Math.sin(time * 0.004 + x) * 1.2;
  ctx.translate(0, bob);
  const paint = (color: string) => {
    ctx.fillStyle = sil ? '#c2b6a3' : color;
  };
  const stroke = (color: string) => {
    ctx.strokeStyle = sil ? '#b3a894' : color;
  };

  switch (id) {
    case 'butterfly':
      drawButterfly(ctx, time, paint);
      break;
    case 'ladybug':
      drawLadybug(ctx, paint);
      break;
    case 'sparrow':
      drawBird(ctx, paint, stroke, '#8a623c', '#c4956a', '#5c3b28', 1);
      break;
    case 'squirrel':
      drawSquirrel(ctx, time, paint);
      break;
    case 'bulbul':
      drawBulbul(ctx, paint, stroke, false);
      break;
    case 'redbulbul':
      drawBulbul(ctx, paint, stroke, true);
      break;
    case 'cicada':
      drawCicada(ctx, paint, stroke, sil);
      break;
    case 'kingfisher':
      drawKingfisher(ctx, paint, stroke);
      break;
    case 'woodpecker':
      drawWoodpecker(ctx, paint, stroke);
      break;
    case 'dove':
      drawBird(ctx, paint, stroke, '#8d8a86', '#d9d3cc', '#6d5a62', 1.15);
      break;
    case 'owl':
      drawOwl(ctx, paint, Boolean(opts.night), sil);
      break;
    case 'firefly':
      drawFirefly(ctx, time, sil);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawButterfly(
  ctx: CanvasRenderingContext2D,
  time: number,
  paint: (c: string) => void,
): void {
  const flap = 0.35 + Math.abs(Math.sin(time * 0.01)) * 0.75;
  paint('#f4f1e4');
  ctx.beginPath();
  ctx.ellipse(-7, -1, 8, 6 * flap, -0.4, 0, Math.PI * 2);
  ctx.ellipse(-6, 4, 6, 4.5 * flap, 0.5, 0, Math.PI * 2);
  ctx.fill();
  paint('#f7f4ea');
  ctx.beginPath();
  ctx.ellipse(7, -1, 8, 6 * flap, 0.4, 0, Math.PI * 2);
  ctx.ellipse(6, 4, 6, 4.5 * flap, -0.5, 0, Math.PI * 2);
  ctx.fill();
  paint('#6d8a48');
  ctx.fillRect(-0.8, -6, 1.6, 12);
  paint('#2c3330');
  ctx.beginPath();
  ctx.arc(0, -6, 1.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawLadybug(ctx: CanvasRenderingContext2D, paint: (c: string) => void): void {
  paint('#b4332c');
  ctx.beginPath();
  ctx.ellipse(0, 1, 7, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#2a2422');
  ctx.fillRect(-0.7, -3, 1.4, 9);
  ctx.beginPath();
  ctx.arc(0, -4, 3.1, 0, Math.PI * 2);
  ctx.fill();
  paint('#f4efe6');
  for (const [x, y] of [[-3, 0], [3, 1], [-2, 3], [2.5, 3.4]] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  paint: (c: string) => void,
  stroke: (c: string) => void,
  body: string,
  belly: string,
  beak: string,
  size: number,
): void {
  ctx.scale(size, size);
  paint(body);
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  paint(belly);
  ctx.beginPath();
  ctx.ellipse(2, 1.5, 5, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  paint(body);
  ctx.beginPath();
  ctx.arc(7, -2, 4.2, 0, Math.PI * 2);
  ctx.fill();
  paint(beak);
  ctx.beginPath();
  ctx.moveTo(10, -2);
  ctx.lineTo(15, -1);
  ctx.lineTo(10, 0.5);
  ctx.fill();
  paint('#2c241c');
  ctx.beginPath();
  ctx.arc(8.3, -3, 0.8, 0, Math.PI * 2);
  ctx.fill();
  stroke(body);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-7, -1);
  ctx.quadraticCurveTo(-12, -6, -8, -7);
  ctx.stroke();
  paint('#5c4636');
  ctx.fillRect(2, 5, 1.2, 4);
  ctx.fillRect(5, 5, 1.2, 4);
}

function drawSquirrel(ctx: CanvasRenderingContext2D, time: number, paint: (c: string) => void): void {
  const wag = Math.sin(time * 0.003) * 0.4;
  paint('#c46a32');
  ctx.beginPath();
  ctx.ellipse(0, 2, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#a8512a');
  ctx.save();
  ctx.translate(-6, 0);
  ctx.rotate(-0.8 + wag);
  ctx.beginPath();
  ctx.ellipse(0, -8, 4.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  paint('#d4844a');
  ctx.beginPath();
  ctx.arc(6, -2, 4.4, 0, Math.PI * 2);
  ctx.fill();
  paint('#f2d2b0');
  ctx.beginPath();
  ctx.ellipse(7, 0, 2.4, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#2c241c');
  ctx.beginPath();
  ctx.arc(7.4, -3, 0.7, 0, Math.PI * 2);
  ctx.fill();
  paint('#a8512a');
  ctx.beginPath();
  ctx.moveTo(4, -6);
  ctx.lineTo(5, -9);
  ctx.lineTo(7, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(10, -9);
  ctx.lineTo(11, -5.5);
  ctx.fill();
}

function drawBulbul(
  ctx: CanvasRenderingContext2D,
  paint: (c: string) => void,
  stroke: (c: string) => void,
  red: boolean,
): void {
  paint(red ? '#6d4a32' : '#6f7a45');
  ctx.beginPath();
  ctx.ellipse(0, 1, 9, 5.5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  paint(red ? '#2c241c' : '#f4f1ea');
  ctx.beginPath();
  ctx.arc(7, -2, 4.3, 0, Math.PI * 2);
  ctx.fill();
  if (!red) {
    paint('#f7f4ee');
    ctx.beginPath();
    ctx.ellipse(6.5, -5.2, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    paint('#2c241c');
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.lineTo(7, -9);
    ctx.lineTo(9, -5);
    ctx.fill();
    paint('#c4483a');
    ctx.beginPath();
    ctx.arc(8.6, -1, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  paint('#f0a03a');
  ctx.beginPath();
  ctx.moveTo(10, -1.5);
  ctx.lineTo(14, -0.6);
  ctx.lineTo(10, 0.6);
  ctx.fill();
  paint('#241c16');
  ctx.beginPath();
  ctx.arc(8.2, -2.6, 0.7, 0, Math.PI * 2);
  ctx.fill();
  stroke('#5c6840');
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.quadraticCurveTo(-13, -4, -9, -6);
  ctx.stroke();
}

function drawCicada(
  ctx: CanvasRenderingContext2D,
  paint: (c: string) => void,
  stroke: (c: string) => void,
  sil: boolean,
): void {
  paint('rgba(210, 224, 210, 0.85)');
  if (!sil) ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.ellipse(-4, -2, 5, 8, -0.4, 0, Math.PI * 2);
  ctx.ellipse(4, -2, 5, 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  paint('#6e7a48');
  ctx.beginPath();
  ctx.ellipse(0, 2, 3.2, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#3e4a2c');
  ctx.beginPath();
  ctx.arc(0, -5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  stroke('#3e4a2c');
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-1, -6);
  ctx.lineTo(-4, -10);
  ctx.moveTo(1, -6);
  ctx.lineTo(4, -10);
  ctx.stroke();
}

function drawKingfisher(ctx: CanvasRenderingContext2D, paint: (c: string) => void, stroke: (c: string) => void): void {
  paint('#1f7a8a');
  ctx.beginPath();
  ctx.ellipse(-1, 1, 8, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  paint('#e7a15a');
  ctx.beginPath();
  ctx.ellipse(2, 2, 4, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#1b6e86');
  ctx.beginPath();
  ctx.arc(6, -2, 4, 0, Math.PI * 2);
  ctx.fill();
  paint('#e7a15a');
  ctx.beginPath();
  ctx.moveTo(9, -1);
  ctx.lineTo(18, -0.2);
  ctx.lineTo(9, 1.2);
  ctx.fill();
  paint('#f4f1ea');
  ctx.beginPath();
  ctx.arc(6.6, -3.2, 1.5, 0, Math.PI * 2);
  ctx.fill();
  paint('#241c16');
  ctx.beginPath();
  ctx.arc(7, -3.2, 0.6, 0, Math.PI * 2);
  ctx.fill();
  stroke('#176070');
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-7, -1);
  ctx.lineTo(-12, -5);
  ctx.stroke();
}

function drawWoodpecker(ctx: CanvasRenderingContext2D, paint: (c: string) => void, stroke: (c: string) => void): void {
  ctx.rotate(0.7);
  paint('#2c241c');
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#f4f1ea');
  ctx.fillRect(-2, -2, 3, 7);
  paint('#c4483a');
  ctx.beginPath();
  ctx.arc(0, -8, 4, 0, Math.PI * 2);
  ctx.fill();
  paint('#f2d2b0');
  ctx.beginPath();
  ctx.moveTo(3, -7);
  ctx.lineTo(10, -6);
  ctx.lineTo(3, -4.5);
  ctx.fill();
  paint('#241c16');
  ctx.beginPath();
  ctx.arc(1, -8.5, 0.7, 0, Math.PI * 2);
  ctx.fill();
  stroke('#2c241c');
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-2, 6);
  ctx.lineTo(-6, 8);
  ctx.moveTo(1, 7);
  ctx.lineTo(4, 11);
  ctx.stroke();
}

function drawOwl(ctx: CanvasRenderingContext2D, paint: (c: string) => void, night: boolean, sil: boolean): void {
  paint('#8a6a42');
  ctx.beginPath();
  ctx.ellipse(0, 2, 9, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  paint('#6d5234');
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-3, -14);
  ctx.lineTo(0, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.lineTo(3, -14);
  ctx.lineTo(0, -6);
  ctx.fill();
  paint(night && !sil ? '#f3e7b0' : '#f4efe4');
  ctx.beginPath();
  ctx.arc(-3.2, -1, 3.1, 0, Math.PI * 2);
  ctx.arc(3.2, -1, 3.1, 0, Math.PI * 2);
  ctx.fill();
  paint('#2a241c');
  ctx.beginPath();
  ctx.arc(-3.2, -1, night ? 1.5 : 1.1, 0, Math.PI * 2);
  ctx.arc(3.2, -1, night ? 1.5 : 1.1, 0, Math.PI * 2);
  ctx.fill();
  paint('#e0a050');
  ctx.beginPath();
  ctx.moveTo(-1.2, 2);
  ctx.lineTo(0, 4);
  ctx.lineTo(1.2, 2);
  ctx.fill();
}

function drawFirefly(ctx: CanvasRenderingContext2D, time: number, sil: boolean): void {
  const glow = 0.45 + Math.sin(time * 0.008) * 0.35;
  if (!sil) {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
    g.addColorStop(0, `rgba(230, 240, 140, ${0.35 + glow * 0.4})`);
    g.addColorStop(1, 'rgba(230, 240, 140, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = sil ? '#c2b6a3' : `rgba(236, 244, 160, ${0.75 + glow * 0.25})`;
  ctx.beginPath();
  ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();
}
