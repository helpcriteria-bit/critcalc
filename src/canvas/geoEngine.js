/**
 * geoEngine.js - Pure functions for rendering geometry objects on HTML5 Canvas
 */

export const DEFAULT_COLORS = {
  point: '#ffffff',
  line: '#e8eaf0',
  circle: '#f0a500',
  triangle: '#ff7b35',
  rectangle: '#a78bfa',
  polygon: '#38bdf8',
  ruler: '#10b981',
  angle: '#f0a500',
  helper: '#3dd68c',
  selection: '#f0a500'
};

export function drawPoint(ctx, obj, toScreen, isHovered = false, isSelected = false) {
  const { x, y, color = DEFAULT_COLORS.point, label, labelOffset = { x: 8, y: -8 } } = obj;
  const p = toScreen(x, y);

  ctx.save();
  // Outer glow ring r=8, opacity 0.2
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = isHovered ? 'rgba(240, 165, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)';
  ctx.fill();

  // Core point r=5
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = isHovered ? '#f0a500' : color;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#0d0f14';
  ctx.stroke();

  // Label Inter 500 12px
  if (label) {
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillStyle = isHovered ? '#f0a500' : '#e8eaf0';
    ctx.fillText(label, p.x + (labelOffset.x || 8), p.y + (labelOffset.y || -8));
  }

  if (isSelected) {
    drawSelectionBox(ctx, { x: p.x - 10, y: p.y - 10, w: 20, h: 20 });
  }
  ctx.restore();
}

export function drawLine(ctx, obj, toScreen, isHovered = false, isSelected = false) {
  const { x1, y1, x2, y2, color = DEFAULT_COLORS.line, width = 2, dash = [] } = obj;
  const p1 = toScreen(x1, y1);
  const p2 = toScreen(x2, y2);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = isHovered ? width + 1 : width;
  ctx.strokeStyle = isHovered ? '#f0a500' : color;
  if (dash && dash.length) ctx.setLineDash(dash);
  ctx.stroke();

  if (isSelected) {
    const minX = Math.min(p1.x, p2.x) - 6;
    const minY = Math.min(p1.y, p2.y) - 6;
    const w = Math.abs(p2.x - p1.x) + 12;
    const h = Math.abs(p2.y - p1.y) + 12;
    drawSelectionBox(ctx, { x: minX, y: minY, w, h });
  }
  ctx.restore();
}

export function drawCircle(ctx, obj, toScreen, isHovered = false, isSelected = false, scale = 1) {
  const { cx, cy, r, color = DEFAULT_COLORS.circle, width = 2, dash = [] } = obj;
  const p = toScreen(cx, cy);
  const radiusPx = r * scale;

  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
  ctx.lineWidth = isHovered ? width + 1 : width;
  ctx.strokeStyle = isHovered ? '#f0a500' : color;
  if (dash && dash.length) ctx.setLineDash(dash);
  ctx.stroke();

  // Subtle center cross
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (isSelected) {
    drawSelectionBox(ctx, {
      x: p.x - radiusPx - 6,
      y: p.y - radiusPx - 6,
      w: radiusPx * 2 + 12,
      h: radiusPx * 2 + 12
    });
  }
  ctx.restore();
}

export function drawTriangle(ctx, obj, toScreen, isHovered = false, isSelected = false, unitScale = 40, unitName = 'cm') {
  const { pts, fillColor = 'rgba(255, 123, 53, 0.12)', strokeColor = DEFAULT_COLORS.triangle, labels = ['A', 'B', 'C'] } = obj;
  if (!pts || pts.length < 3) return;

  const p1 = toScreen(pts[0].x, pts[0].y);
  const p2 = toScreen(pts[1].x, pts[1].y);
  const p3 = toScreen(pts[2].x, pts[2].y);
  const screenPts = [p1, p2, p3];

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = isHovered ? 'rgba(255, 123, 53, 0.25)' : fillColor;
    ctx.fill();
  }

  ctx.lineWidth = isHovered ? 2.5 : 2;
  ctx.strokeStyle = isHovered ? '#ff9655' : strokeColor;
  ctx.stroke();

  // Draw side lengths along each edge
  ctx.font = '500 10.5px "JetBrains Mono", monospace';
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    const sp1 = screenPts[i];
    const sp2 = screenPts[j];
    const wp1 = pts[i];
    const wp2 = pts[j];

    const dxWorld = wp2.x - wp1.x;
    const dyWorld = wp2.y - wp1.y;
    const edgeLenWorld = Math.sqrt(dxWorld * dxWorld + dyWorld * dyWorld);
    const edgeVal = (edgeLenWorld / (unitScale || 40)).toFixed(1);

    const midX = (sp1.x + sp2.x) / 2;
    const midY = (sp1.y + sp2.y) / 2;

    const dx = sp2.x - sp1.x;
    const dy = sp2.y - sp1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const lx = midX + nx * 12;
    const ly = midY + ny * 12;

    ctx.fillStyle = 'rgba(13, 15, 20, 0.8)';
    const textStr = `${edgeVal}${unitName}`;
    const tw = ctx.measureText(textStr).width;
    ctx.fillRect(lx - tw / 2 - 3, ly - 7, tw + 6, 14);

    ctx.fillStyle = '#ffedd5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, lx, ly);
  }

  // Draw vertex dots and labels
  screenPts.forEach((sp, idx) => {
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ff7b35' : '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0d0f14';
    ctx.stroke();

    const labelChar = labels[idx] || String.fromCharCode(65 + (idx % 26));
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#ffedd5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(labelChar, sp.x, sp.y - 6);
  });

  if (isSelected) {
    const xs = [p1.x, p2.x, p3.x];
    const ys = [p1.y, p2.y, p3.y];
    const minX = Math.min(...xs) - 6;
    const minY = Math.min(...ys) - 6;
    const maxX = Math.max(...xs) + 6;
    const maxY = Math.max(...ys) + 6;
    drawSelectionBox(ctx, { x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }
  ctx.restore();
}

export function drawRectangle(ctx, obj, toScreen, isHovered = false, isSelected = false) {
  const { x, y, w, h, fillColor = 'rgba(167, 139, 250, 0.12)', strokeColor = DEFAULT_COLORS.rectangle } = obj;
  const p1 = toScreen(x, y);
  const p2 = toScreen(x + w, y + h);

  const rectX = Math.min(p1.x, p2.x);
  const rectY = Math.min(p1.y, p2.y);
  const rectW = Math.abs(p2.x - p1.x);
  const rectH = Math.abs(p2.y - p1.y);

  ctx.save();
  ctx.beginPath();
  ctx.rect(rectX, rectY, rectW, rectH);

  if (fillColor) {
    ctx.fillStyle = isHovered ? 'rgba(167, 139, 250, 0.25)' : fillColor;
    ctx.fill();
  }

  ctx.lineWidth = isHovered ? 2.5 : 2;
  ctx.strokeStyle = isHovered ? '#c4b5fd' : strokeColor;
  ctx.stroke();

  if (isSelected) {
    drawSelectionBox(ctx, { x: rectX - 6, y: rectY - 6, w: rectW + 12, h: rectH + 12 });
  }
  ctx.restore();
}

export function drawAngle(ctx, obj, toScreen, isHovered = false, isSelected = false) {
  const { vx, vy, r1x, r1y, r2x, r2y, color = DEFAULT_COLORS.angle } = obj;
  const v = toScreen(vx, vy);
  const p1 = toScreen(r1x, r1y);
  const p2 = toScreen(r2x, r2y);

  const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
  const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);

  const radius = 28;

  ctx.save();
  ctx.beginPath();
  ctx.arc(v.x, v.y, radius, a1, a2, false);
  ctx.lineWidth = isHovered ? 2.5 : 2;
  ctx.strokeStyle = isHovered ? '#fbbf24' : color;
  ctx.stroke();

  // Draw rays
  ctx.beginPath();
  ctx.moveTo(v.x, v.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.moveTo(v.x, v.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(232, 234, 240, 0.4)';
  ctx.stroke();

  // Angle degrees text
  let diffDeg = Math.round(Math.abs((a2 - a1) * 180 / Math.PI));
  if (diffDeg > 180) diffDeg = 360 - diffDeg;
  const midAngle = (a1 + a2) / 2;
  const labelX = v.x + Math.cos(midAngle) * (radius + 14);
  const labelY = v.y + Math.sin(midAngle) * (radius + 14);

  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillStyle = color;
  ctx.fillText(`${diffDeg}°`, labelX - 10, labelY + 4);

  if (isSelected) {
    drawSelectionBox(ctx, { x: v.x - radius - 8, y: v.y - radius - 8, w: radius * 2 + 16, h: radius * 2 + 16 });
  }
  ctx.restore();
}

export function drawRightAngle(ctx, obj, toScreen, isHovered = false, isSelected = false) {
  const { vx, vy, dir1, dir2, color = DEFAULT_COLORS.helper } = obj;
  const v = toScreen(vx, vy);
  const size = 14;

  const p1 = { x: v.x + dir1.x * size, y: v.y + dir1.y * size };
  const corner = { x: p1.x + dir2.x * size, y: p1.y + dir2.y * size };
  const p2 = { x: v.x + dir2.x * size, y: v.y + dir2.y * size };

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(corner.x, corner.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = isHovered ? 2 : 1.5;
  ctx.strokeStyle = color;
  ctx.stroke();

  if (isSelected) {
    drawSelectionBox(ctx, { x: v.x - 8, y: v.y - 8, w: 28, h: 28 });
  }
  ctx.restore();
}

export function drawLabel(ctx, obj, toScreen, isHovered = false, isSelected = false) {
  const { x, y, text, color = '#e8eaf0', fontSize = 14 } = obj;
  const p = toScreen(x, y);

  ctx.save();
  ctx.font = `500 ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = isHovered ? '#f0a500' : color;
  ctx.fillText(text, p.x, p.y);

  if (isSelected) {
    const metrics = ctx.measureText(text);
    drawSelectionBox(ctx, { x: p.x - 4, y: p.y - fontSize - 2, w: metrics.width + 8, h: fontSize + 6 });
  }
  ctx.restore();
}

export function drawProtractor(ctx, obj, toScreen) {
  const { x, y } = obj;
  const p = toScreen(x, y);
  const r = 100;

  ctx.save();
  // Semicircle background
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, Math.PI, 0, false);
  ctx.closePath();
  ctx.fillStyle = 'rgba(28, 32, 48, 0.75)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#3dd68c';
  ctx.stroke();

  // Baseline
  ctx.beginPath();
  ctx.moveTo(p.x - r, p.y);
  ctx.lineTo(p.x + r, p.y);
  ctx.stroke();

  // Degree ticks at 0, 30, 45, 60, 90, 120, 135, 150, 180
  const ticks = [0, 30, 45, 60, 90, 120, 135, 150, 180];
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#3dd68c';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ticks.forEach(deg => {
    const rad = (Math.PI * (180 - deg)) / 180;
    const x1 = p.x + Math.cos(rad) * (r - 10);
    const y1 = p.y - Math.sin(rad) * (r - 10);
    const x2 = p.x + Math.cos(rad) * r;
    const y2 = p.y - Math.sin(rad) * r;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const tx = p.x + Math.cos(rad) * (r - 22);
    const ty = p.y - Math.sin(rad) * (r - 22);
    ctx.fillText(`${deg}°`, tx, ty);
  });

  ctx.restore();
}

export function drawSelectionBox(ctx, box) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = DEFAULT_COLORS.selection;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.restore();
}

/**
 * Calculates area of any polygon using the Shoelace formula
 */
export function calculatePolygonArea(pts) {
  if (!pts || pts.length < 3) return 0;
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates perimeter of any polygon (sum of side lengths)
 */
export function calculatePolygonPerimeter(pts) {
  if (!pts || pts.length < 2) return 0;
  let p = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = pts[j].x - pts[i].x;
    const dy = pts[j].y - pts[i].y;
    p += Math.sqrt(dx * dx + dy * dy);
  }
  return p;
}

/**
 * Returns polygon name based on number of vertices
 */
export function getPolygonName(n) {
  switch (n) {
    case 3: return 'Triangle';
    case 4: return 'Quadrilateral';
    case 5: return 'Pentagon';
    case 6: return 'Hexagon';
    case 7: return 'Heptagon';
    case 8: return 'Octagon';
    case 9: return 'Nonagon';
    case 10: return 'Decagon';
    case 12: return 'Dodecagon';
    default: return `${n}-gon`;
  }
}

/**
 * Draws arbitrary polygon with vertex indicators, side lengths, and area/perimeter badge
 */
export function drawPolygon(ctx, obj, toScreen, isHovered = false, isSelected = false, unitScale = 40, unitName = 'cm') {
  const { pts, fillColor = 'rgba(56, 189, 248, 0.14)', strokeColor = DEFAULT_COLORS.polygon } = obj;
  if (!pts || pts.length < 3) return;

  const screenPts = pts.map(p => toScreen(p.x, p.y));
  const n = screenPts.length;

  ctx.save();

  // 1. Draw Closed Filled Polygon
  ctx.beginPath();
  ctx.moveTo(screenPts[0].x, screenPts[0].y);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(screenPts[i].x, screenPts[i].y);
  }
  ctx.closePath();

  ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.26)' : fillColor;
  ctx.fill();

  ctx.lineWidth = isHovered ? 2.5 : 2;
  ctx.strokeStyle = isHovered ? '#7dd3fc' : strokeColor;
  ctx.stroke();

  // 2. Draw Side Length Labels along each edge
  ctx.font = '500 10.5px "JetBrains Mono", monospace';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const p1 = screenPts[i];
    const p2 = screenPts[j];
    const wp1 = pts[i];
    const wp2 = pts[j];

    const dxWorld = wp2.x - wp1.x;
    const dyWorld = wp2.y - wp1.y;
    const edgeLenWorld = Math.sqrt(dxWorld * dxWorld + dyWorld * dyWorld);
    const edgeVal = (edgeLenWorld / (unitScale || 40)).toFixed(1);

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    // Normal vector for label offset
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const lx = midX + nx * 12;
    const ly = midY + ny * 12;

    // Small pill background for readability
    ctx.fillStyle = 'rgba(13, 15, 20, 0.75)';
    const textStr = `${edgeVal}${unitName}`;
    const tw = ctx.measureText(textStr).width;
    ctx.fillRect(lx - tw / 2 - 3, ly - 7, tw + 6, 14);

    ctx.fillStyle = '#bae6fd';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, lx, ly);
  }

  // 3. Draw Vertex dots & auto-letter labels (A, B, C...)
  screenPts.forEach((sp, idx) => {
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#38bdf8' : '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0d0f14';
    ctx.stroke();

    const charCode = 65 + (idx % 26);
    const labelChar = String.fromCharCode(charCode);
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(labelChar, sp.x, sp.y - 6);
  });

  // 4. Centroid badge with Polygon classification, Area, and Perimeter
  let cx = 0;
  let cy = 0;
  screenPts.forEach(p => { cx += p.x; cy += p.y; });
  cx /= n;
  cy /= n;

  const areaWorld = calculatePolygonArea(pts);
  const perimWorld = calculatePolygonPerimeter(pts);
  const areaUnit = (areaWorld / ((unitScale || 40) ** 2)).toFixed(1);
  const perimUnit = (perimWorld / (unitScale || 40)).toFixed(1);
  const polyTitle = `${getPolygonName(n)} (${n}v)`;

  // Info badge in center of polygon
  ctx.save();
  ctx.font = '600 11px Inter, sans-serif';
  const badgeTitleWidth = ctx.measureText(polyTitle).width;
  ctx.font = '500 10px "JetBrains Mono", monospace';
  const statsStr = `P: ${perimUnit}${unitName} | A: ${areaUnit}${unitName}²`;
  const badgeStatsWidth = ctx.measureText(statsStr).width;
  const badgeW = Math.max(badgeTitleWidth, badgeStatsWidth) + 16;
  const badgeH = 34;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, 6) : ctx.rect(cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(polyTitle, cx, cy - 4);

  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(statsStr, cx, cy + 10);
  ctx.restore();

  // 5. Selection Bounding Box
  if (isSelected) {
    const xs = screenPts.map(p => p.x);
    const ys = screenPts.map(p => p.y);
    const minX = Math.min(...xs) - 8;
    const minY = Math.min(...ys) - 8;
    const maxX = Math.max(...xs) + 8;
    const maxY = Math.max(...ys) + 8;
    drawSelectionBox(ctx, { x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }

  ctx.restore();
}

/**
 * Draws measurement ruler line with dimension caps, distance, angle, and delta values
 */
export function drawRulerMeasure(ctx, obj, toScreen, isHovered = false, isSelected = false, unitScale = 40, unitName = 'cm') {
  const { x1, y1, x2, y2, color = DEFAULT_COLORS.ruler } = obj;
  const p1 = toScreen(x1, y1);
  const p2 = toScreen(x2, y2);

  const dxWorld = x2 - x1;
  const dyWorld = y2 - y1;
  const distWorld = Math.sqrt(dxWorld * dxWorld + dyWorld * dyWorld);
  const distUnits = (distWorld / (unitScale || 40)).toFixed(2);
  const distPx = Math.round(distWorld);
  const angleDeg = ((Math.atan2(dyWorld, dxWorld) * 180) / Math.PI).toFixed(1);
  const deltaXUnits = (Math.abs(dxWorld) / (unitScale || 40)).toFixed(2);
  const deltaYUnits = (Math.abs(dyWorld) / (unitScale || 40)).toFixed(2);

  ctx.save();

  // Dimension main line
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = isHovered ? 2.5 : 2;
  ctx.strokeStyle = isHovered ? '#34d399' : color;
  ctx.stroke();

  // Perpendicular end tick caps (12px cross tick)
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const capSize = 7;

  // Cap 1
  ctx.beginPath();
  ctx.moveTo(p1.x - nx * capSize, p1.y - ny * capSize);
  ctx.lineTo(p1.x + nx * capSize, p1.y + ny * capSize);
  ctx.stroke();

  // Cap 2
  ctx.beginPath();
  ctx.moveTo(p2.x - nx * capSize, p2.y - ny * capSize);
  ctx.lineTo(p2.x + nx * capSize, p2.y + ny * capSize);
  ctx.stroke();

  // End circles
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
  ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
  ctx.fill();

  // Dimension badge
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const badgeX = midX + nx * 18;
  const badgeY = midY + ny * 18;

  const mainText = `${distUnits} ${unitName} (${distPx}px)`;
  const subText = `∠ ${angleDeg}° | ΔX: ${deltaXUnits} | ΔY: ${deltaYUnits}`;

  ctx.font = '600 11px Inter, sans-serif';
  const tw1 = ctx.measureText(mainText).width;
  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  const tw2 = ctx.measureText(subText).width;
  const bw = Math.max(tw1, tw2) + 16;
  const bh = 32;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(badgeX - bw / 2, badgeY - bh / 2, bw, bh, 6) : ctx.rect(badgeX - bw / 2, badgeY - bh / 2, bw, bh);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText(mainText, badgeX, badgeY - 3);

  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(subText, badgeX, badgeY + 10);

  if (isSelected) {
    const minX = Math.min(p1.x, p2.x) - 10;
    const minY = Math.min(p1.y, p2.y) - 10;
    const maxX = Math.max(p1.x, p2.x) + 10;
    const maxY = Math.max(p2.y, p2.y) + 10;
    drawSelectionBox(ctx, { x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }

  ctx.restore();
}

/**
 * Standard ray-casting Point in Polygon test
 */
export function pointInPolygon(point, vs) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x, yi = vs[i].y;
    const xj = vs[j].x, yj = vs[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Geometric Construction Helpers & Dependency Solver
 */

export function calculateLineLineIntersection(p1, p2, p3, p4, asSegments = false) {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d;
  if (asSegments && (t < -0.05 || t > 1.05 || u < -0.05 || u > 1.05)) return null;
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}

export function calculateCircleThreePoints(p1, p2, p3) {
  const d = 2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
  if (Math.abs(d) < 1e-6) return null;
  const p1Sq = p1.x * p1.x + p1.y * p1.y;
  const p2Sq = p2.x * p2.x + p2.y * p2.y;
  const p3Sq = p3.x * p3.x + p3.y * p3.y;
  const cx = (p1Sq * (p2.y - p3.y) + p2Sq * (p3.y - p1.y) + p3Sq * (p1.y - p2.y)) / d;
  const cy = (p1Sq * (p3.x - p2.x) + p2Sq * (p1.x - p3.x) + p3Sq * (p2.x - p1.x)) / d;
  const r = Math.hypot(cx - p1.x, cy - p1.y);
  return { cx, cy, r };
}

export function calculatePerpendicularLine(baseP1, baseP2, throughPt, length = 180) {
  const dx = baseP2.x - baseP1.x;
  const dy = baseP2.y - baseP1.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const halfLen = length / 2;
  return {
    x1: throughPt.x - nx * halfLen,
    y1: throughPt.y - ny * halfLen,
    x2: throughPt.x + nx * halfLen,
    y2: throughPt.y + ny * halfLen,
    nx,
    ny
  };
}

export function calculateParallelLine(baseP1, baseP2, throughPt, length = 180) {
  const dx = baseP2.x - baseP1.x;
  const dy = baseP2.y - baseP1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const halfLen = length / 2;
  return {
    x1: throughPt.x - ux * halfLen,
    y1: throughPt.y - uy * halfLen,
    x2: throughPt.x + ux * halfLen,
    y2: throughPt.y + uy * halfLen
  };
}

export function calculatePerpendicularBisector(p1, p2, length = 180) {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  return calculatePerpendicularLine(p1, p2, { x: mx, y: my }, length);
}

export function calculateAngleBisector(p1, vertex, p2, length = 180) {
  const d1x = p1.x - vertex.x, d1y = p1.y - vertex.y;
  const d2x = p2.x - vertex.x, d2y = p2.y - vertex.y;
  const l1 = Math.hypot(d1x, d1y) || 1;
  const l2 = Math.hypot(d2x, d2y) || 1;
  const u1x = d1x / l1, u1y = d1y / l1;
  const u2x = d2x / l2, u2y = d2y / l2;
  let bx = u1x + u2x, by = u1y + u2y;
  const blen = Math.hypot(bx, by);
  if (blen < 1e-4) {
    bx = -u1y;
    by = u1x;
  } else {
    bx /= blen;
    by /= blen;
  }
  return {
    x1: vertex.x,
    y1: vertex.y,
    x2: vertex.x + bx * length,
    y2: vertex.y + by * length
  };
}

export function calculateCircleTangent(center, r, pt, length = 180) {
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return null;
  const nx = dx / dist;
  const ny = dy / dist;
  const halfLen = length / 2;
  const contactPt = Math.abs(dist - r) < 15 ? { x: center.x + nx * r, y: center.y + ny * r } : pt;
  return {
    x1: contactPt.x - (-ny) * halfLen,
    y1: contactPt.y - nx * halfLen,
    x2: contactPt.x + (-ny) * halfLen,
    y2: contactPt.y + nx * halfLen,
    contactPt
  };
}

export function calculateRegularPolygonVertices(center, radiusPtOrDist, sides = 5) {
  let r = 50;
  let startAngle = -Math.PI / 2;
  if (typeof radiusPtOrDist === 'object' && radiusPtOrDist !== null) {
    const dx = radiusPtOrDist.x - center.x;
    const dy = radiusPtOrDist.y - center.y;
    r = Math.hypot(dx, dy);
    startAngle = Math.atan2(dy, dx);
  } else if (typeof radiusPtOrDist === 'number') {
    r = radiusPtOrDist;
  }
  if (r <= 0.1) r = 40;
  const pts = [];
  const step = (Math.PI * 2) / Math.max(3, sides);
  for (let i = 0; i < sides; i++) {
    const a = startAngle + i * step;
    pts.push({
      x: Math.round((center.x + Math.cos(a) * r) * 10) / 10,
      y: Math.round((center.y + Math.sin(a) * r) * 10) / 10
    });
  }
  return pts;
}

export function solveDependencies(objects) {
  if (!objects || !objects.length) return objects;

  let updated = objects.map(o => ({ ...o }));

  // Dependencies may form long chains; at most one pass per canvas object is needed.
  for (let pass = 0; pass < updated.length; pass++) {
    const passMap = new Map(updated.map(o => [o.id, o]));
    updated = updated.map(obj => {
      // 1. Points with dependencies (Midpoint, Intersection)
      if (obj.type === 'point' && obj.dependency) {
        const dep = obj.dependency;
        if (dep.type === 'midpoint') {
          let p1 = null, p2 = null;
          if (dep.p1Id && dep.p2Id) {
            p1 = passMap.get(dep.p1Id);
            p2 = passMap.get(dep.p2Id);
          } else if (dep.lineId) {
            const line = passMap.get(dep.lineId);
            if (line) {
              p1 = { x: line.x1, y: line.y1 };
              p2 = { x: line.x2, y: line.y2 };
            }
          }
          if (p1 && p2) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            return { ...obj, x: mx, y: my };
          }
        } else if (dep.type === 'intersection') {
          const l1 = passMap.get(dep.obj1Id || dep.line1Id);
          const l2 = passMap.get(dep.obj2Id || dep.line2Id);
          if (l1 && l2 && l1.type === 'line' && l2.type === 'line') {
            const pt = calculateLineLineIntersection(
              { x: l1.x1, y: l1.y1 }, { x: l1.x2, y: l1.y2 },
              { x: l2.x1, y: l2.y1 }, { x: l2.x2, y: l2.y2 }
            );
            if (pt) {
              return { ...obj, x: pt.x, y: pt.y };
            }
          }
        }
      }

      // 2. Lines / Segments with dependencies or endpoints
      if (obj.type === 'line') {
        if (obj.p1Id && obj.p2Id) {
          const p1 = passMap.get(obj.p1Id);
          const p2 = passMap.get(obj.p2Id);
          if (p1 && p2) {
            return { ...obj, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
          }
        }
        if (obj.dependency) {
          const dep = obj.dependency;
          if (dep.type === 'perpendicular') {
            const baseLine = passMap.get(dep.baseLineId);
            const pt = dep.throughPointId ? passMap.get(dep.throughPointId) : (baseLine ? { x: (baseLine.x1 + baseLine.x2) / 2, y: (baseLine.y1 + baseLine.y2) / 2 } : null);
            if (baseLine && pt) {
              const res = calculatePerpendicularLine(
                { x: baseLine.x1, y: baseLine.y1 },
                { x: baseLine.x2, y: baseLine.y2 },
                { x: pt.x, y: pt.y },
                dep.length || 180
              );
              return { ...obj, x1: res.x1, y1: res.y1, x2: res.x2, y2: res.y2 };
            }
          } else if (dep.type === 'parallel') {
            const baseLine = passMap.get(dep.baseLineId);
            const pt = passMap.get(dep.throughPointId);
            if (baseLine && pt) {
              const res = calculateParallelLine(
                { x: baseLine.x1, y: baseLine.y1 },
                { x: baseLine.x2, y: baseLine.y2 },
                { x: pt.x, y: pt.y },
                dep.length || 180
              );
              return { ...obj, x1: res.x1, y1: res.y1, x2: res.x2, y2: res.y2 };
            }
          } else if (dep.type === 'perp_bisector') {
            let p1 = null, p2 = null;
            if (dep.baseLineId) {
              const baseLine = passMap.get(dep.baseLineId);
              if (baseLine) {
                p1 = { x: baseLine.x1, y: baseLine.y1 };
                p2 = { x: baseLine.x2, y: baseLine.y2 };
              }
            } else if (dep.p1Id && dep.p2Id) {
              p1 = passMap.get(dep.p1Id);
              p2 = passMap.get(dep.p2Id);
            }
            if (p1 && p2) {
              const res = calculatePerpendicularBisector(p1, p2, dep.length || 180);
              return { ...obj, x1: res.x1, y1: res.y1, x2: res.x2, y2: res.y2 };
            }
          } else if (dep.type === 'angle_bisector') {
            const p1 = passMap.get(dep.p1Id);
            const vertex = passMap.get(dep.vertexId);
            const p2 = passMap.get(dep.p2Id);
            if (p1 && vertex && p2) {
              const res = calculateAngleBisector(p1, vertex, p2, dep.length || 180);
              return { ...obj, x1: res.x1, y1: res.y1, x2: res.x2, y2: res.y2 };
            }
          } else if (dep.type === 'tangent') {
            const circle = passMap.get(dep.circleId);
            const pt = passMap.get(dep.throughPointId);
            if (circle && pt) {
              const res = calculateCircleTangent({ x: circle.cx, y: circle.cy }, circle.r, { x: pt.x, y: pt.y }, dep.length || 180);
              if (res) {
                return { ...obj, x1: res.x1, y1: res.y1, x2: res.x2, y2: res.y2 };
              }
            }
          }
        }
      }

      // 3. Right Angle indicator
      if (obj.type === 'rightangle' && obj.dependency) {
        const dep = obj.dependency;
        const baseLine = passMap.get(dep.baseLineId);
        const perpLine = passMap.get(dep.perpLineId);
        if (baseLine && perpLine) {
          const pt = calculateLineLineIntersection(
            { x: baseLine.x1, y: baseLine.y1 }, { x: baseLine.x2, y: baseLine.y2 },
            { x: perpLine.x1, y: perpLine.y1 }, { x: perpLine.x2, y: perpLine.y2 }
          ) || { x: (baseLine.x1 + baseLine.x2) / 2, y: (baseLine.y1 + baseLine.y2) / 2 };
          const bdx = baseLine.x2 - baseLine.x1, bdy = baseLine.y2 - baseLine.y1;
          const blen = Math.hypot(bdx, bdy) || 1;
          const pdx = perpLine.x2 - perpLine.x1, pdy = perpLine.y2 - perpLine.y1;
          const plen = Math.hypot(pdx, pdy) || 1;
          return {
            ...obj,
            vx: pt.x,
            vy: pt.y,
            dir1: { x: bdx / blen, y: bdy / blen },
            dir2: { x: pdx / plen, y: pdy / plen }
          };
        }
      }

      // 4. Circles
      if (obj.type === 'circle') {
        if (obj.centerPointId) {
          const center = passMap.get(obj.centerPointId);
          if (center) {
            let newR = obj.r;
            if (obj.radiusPointId) {
              const radPt = passMap.get(obj.radiusPointId);
              if (radPt) newR = Math.hypot(radPt.x - center.x, radPt.y - center.y);
            }
            return { ...obj, cx: center.x, cy: center.y, r: newR };
          }
        } else if (obj.dependency && obj.dependency.type === 'three_point_circle') {
          const p1 = passMap.get(obj.dependency.p1Id);
          const p2 = passMap.get(obj.dependency.p2Id);
          const p3 = passMap.get(obj.dependency.p3Id);
          if (p1 && p2 && p3) {
            const circle = calculateCircleThreePoints(p1, p2, p3);
            if (circle) {
              return { ...obj, cx: circle.cx, cy: circle.cy, r: circle.r };
            }
          }
        }
      }

      // 5. Polygons (Regular Polygons)
      if (obj.type === 'polygon' && obj.dependency && obj.dependency.type === 'regular_polygon') {
        const center = passMap.get(obj.dependency.centerPointId);
        const radPt = obj.dependency.radiusPointId ? passMap.get(obj.dependency.radiusPointId) : null;
        if (center) {
          const pts = calculateRegularPolygonVertices(center, radPt || obj.dependency.radius || 40, obj.dependency.sides || 5);
          return { ...obj, pts };
        }
      }

      // 6. Rulers
      if (obj.type === 'ruler') {
        if (obj.p1Id && obj.p2Id) {
          const p1 = passMap.get(obj.p1Id);
          const p2 = passMap.get(obj.p2Id);
          if (p1 && p2) {
            return { ...obj, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
          }
        }
      }

      return obj;
    });
  }

  return updated;
}

export function drawSnapIndicator(ctx, snapInfo, toScreen) {
  if (!snapInfo || !snapInfo.pos) return;
  const sp = toScreen(snapInfo.pos.x, snapInfo.pos.y);

  ctx.save();
  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#f0a500';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#f0a500';
  ctx.fill();

  ctx.strokeStyle = 'rgba(240, 165, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sp.x - 10, sp.y);
  ctx.lineTo(sp.x + 10, sp.y);
  ctx.moveTo(sp.x, sp.y - 10);
  ctx.lineTo(sp.x, sp.y + 10);
  ctx.stroke();

  if (snapInfo.label) {
    ctx.font = '600 10px Inter, sans-serif';
    const text = snapInfo.label;
    const tw = ctx.measureText(text).width;
    const bx = sp.x + 10;
    const by = sp.y - 12;

    ctx.fillStyle = 'rgba(13, 15, 20, 0.88)';
    ctx.strokeStyle = '#f0a500';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(bx - 3, by - 8, tw + 6, 15);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f0a500';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx, by);
  }
  ctx.restore();
}

/**
 * Renders an active, glowing stylus/pencil tracer nib at the drawing tip.
 * Gives the realistic visual effect of a live human drawing in progress.
 */
export function drawStylusTracer(ctx, screenPos, color = '#38bdf8', pulse = 0) {
  if (!screenPos || !Number.isFinite(screenPos.x) || !Number.isFinite(screenPos.y)) return;

  const { x, y } = screenPos;
  ctx.save();

  // 1. Soft glowing outer aura
  const auraRad = 9 + Math.sin(pulse * 4) * 2;
  ctx.beginPath();
  ctx.arc(x, y, auraRad, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.fill();

  // 2. Active ink/lead contact point
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = color || '#38bdf8';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // 3. Micro spark at the lead contact
  ctx.beginPath();
  ctx.arc(x, y, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // 4. Stylus Pen / Nib Silhouette (angled at 45 degrees up and to the right)
  ctx.save();
  ctx.translate(x, y);

  // Pen nib cone
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(5, -11);
  ctx.lineTo(10, -7);
  ctx.closePath();
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pen body shaft
  ctx.beginPath();
  ctx.moveTo(5, -11);
  ctx.lineTo(19, -25);
  ctx.lineTo(23, -21);
  ctx.lineTo(10, -7);
  ctx.closePath();
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Stylus grip ring
  ctx.beginPath();
  ctx.moveTo(7, -13);
  ctx.lineTo(12, -9);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

/**
 * Draws an object progressively according to normalized progress t in [0, 1].
 * Returns the screen coordinates of the current moving tracer tip.
 */
export function drawAnimatedObject(ctx, obj, progress, toScreen, options = {}) {
  const t = Math.max(0, Math.min(1, progress));
  const scale = options.scale || 1;
  const unitScale = options.unitScale || 40;
  const unitName = options.unitName || 'cm';

  ctx.save();

  let tracerScreenPos = null;

  switch (obj.type) {
    case 'point': {
      const p = toScreen(obj.x, obj.y);
      tracerScreenPos = p;

      // Expanding ripple
      const rippleR = 4 + t * 18;
      const rippleOpacity = Math.max(0, 1 - t * 0.9);
      ctx.beginPath();
      ctx.arc(p.x, p.y, rippleR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${rippleOpacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Solidifying core
      const coreR = Math.min(5, 1.5 + t * 3.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, coreR, 0, Math.PI * 2);
      ctx.fillStyle = obj.color || DEFAULT_COLORS.point;
      ctx.fill();
      ctx.strokeStyle = '#0d0f14';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label pop-in
      if (obj.label && t > 0.4) {
        const labelAlpha = Math.min(1, (t - 0.4) / 0.6);
        ctx.save();
        ctx.globalAlpha = labelAlpha;
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillStyle = '#ffedd5';
        const offX = obj.labelOffset?.x || 8;
        const offY = obj.labelOffset?.y || -8;
        ctx.fillText(obj.label, p.x + offX, p.y + offY);
        ctx.restore();
      }
      break;
    }

    case 'line': {
      const p1 = toScreen(obj.x1, obj.y1);
      const p2 = toScreen(obj.x2, obj.y2);
      const curX = p1.x + (p2.x - p1.x) * t;
      const curY = p1.y + (p2.y - p1.y) * t;
      tracerScreenPos = { x: curX, y: curY };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(curX, curY);
      ctx.strokeStyle = obj.color || DEFAULT_COLORS.line;
      ctx.lineWidth = obj.width || 2;
      if (obj.dash && obj.dash.length) ctx.setLineDash(obj.dash);
      ctx.stroke();

      // Endpoint start dot
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = obj.color || DEFAULT_COLORS.line;
      ctx.fill();
      break;
    }

    case 'circle': {
      const center = toScreen(obj.cx, obj.cy);
      const radiusPx = (obj.r || 3) * scale;
      const startAngle = -Math.PI / 2; // Begin at 12 o'clock like a compass
      const currentAngle = startAngle + t * Math.PI * 2;

      const tipX = center.x + radiusPx * Math.cos(currentAngle);
      const tipY = center.y + radiusPx * Math.sin(currentAngle);
      tracerScreenPos = { x: tipX, y: tipY };

      // Center pivot point
      ctx.beginPath();
      ctx.arc(center.x, center.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = obj.color || DEFAULT_COLORS.circle;
      ctx.fill();

      // Progressive arc stroke
      ctx.beginPath();
      ctx.arc(center.x, center.y, radiusPx, startAngle, currentAngle, false);
      ctx.strokeStyle = obj.color || DEFAULT_COLORS.circle;
      ctx.lineWidth = obj.width || 2;
      if (obj.dash && obj.dash.length) ctx.setLineDash(obj.dash);
      ctx.stroke();
      break;
    }

    case 'triangle':
    case 'polygon': {
      const rawPts = obj.pts || [];
      if (rawPts.length < 3) break;
      const screenPts = rawPts.map((p) => toScreen(p.x, p.y));
      const N = screenPts.length;

      // Segment progress
      const segIndex = Math.min(N - 1, Math.floor(t * N));
      const segProgress = (t * N) - segIndex;

      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);

      // Draw all segments fully completed so far
      for (let i = 1; i <= segIndex; i++) {
        const nextIdx = i % N;
        ctx.lineTo(screenPts[nextIdx].x, screenPts[nextIdx].y);
      }

      // Draw current segment in progress
      const pStart = screenPts[segIndex];
      const pEnd = screenPts[(segIndex + 1) % N];
      const curX = pStart.x + (pEnd.x - pStart.x) * segProgress;
      const curY = pStart.y + (pEnd.y - pStart.y) * segProgress;
      ctx.lineTo(curX, curY);

      tracerScreenPos = { x: curX, y: curY };

      ctx.strokeStyle = obj.strokeColor || (obj.type === 'triangle' ? DEFAULT_COLORS.triangle : DEFAULT_COLORS.polygon);
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Draw visited vertex markers
      for (let i = 0; i <= segIndex; i++) {
        const sp = screenPts[i];
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0d0f14';
        ctx.lineWidth = 1;
        ctx.stroke();

        const labelText = obj.labels?.[i] || String.fromCharCode(65 + (i % 26));
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillStyle = '#ffedd5';
        ctx.fillText(labelText, sp.x, sp.y - 7);
      }

      // Smoothly fade in interior fill as stroke nears completion
      if (t > 0.85 && obj.fillColor) {
        const fillAlpha = (t - 0.85) / 0.15;
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.beginPath();
        ctx.moveTo(screenPts[0].x, screenPts[0].y);
        for (let i = 1; i < N; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
        ctx.closePath();
        ctx.fillStyle = obj.fillColor;
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'rectangle': {
      const p1 = toScreen(obj.x, obj.y);
      const p2 = toScreen(obj.x + obj.w, obj.y + obj.h);
      const rectCorners = [
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p1.y },
        { x: p2.x, y: p2.y },
        { x: p1.x, y: p2.y }
      ];
      const N = 4;
      const segIndex = Math.min(N - 1, Math.floor(t * N));
      const segProgress = (t * N) - segIndex;

      ctx.beginPath();
      ctx.moveTo(rectCorners[0].x, rectCorners[0].y);
      for (let i = 1; i <= segIndex; i++) {
        ctx.lineTo(rectCorners[i % N].x, rectCorners[i % N].y);
      }
      const pStart = rectCorners[segIndex];
      const pEnd = rectCorners[(segIndex + 1) % N];
      const curX = pStart.x + (pEnd.x - pStart.x) * segProgress;
      const curY = pStart.y + (pEnd.y - pStart.y) * segProgress;
      ctx.lineTo(curX, curY);

      tracerScreenPos = { x: curX, y: curY };

      ctx.strokeStyle = obj.strokeColor || DEFAULT_COLORS.rectangle;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'ruler': {
      const p1 = toScreen(obj.x1, obj.y1);
      const p2 = toScreen(obj.x2, obj.y2);
      const curX = p1.x + (p2.x - p1.x) * t;
      const curY = p1.y + (p2.y - p1.y) * t;
      tracerScreenPos = { x: curX, y: curY };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(curX, curY);
      ctx.strokeStyle = DEFAULT_COLORS.ruler;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      if (t > 0.75) {
        const midX = (p1.x + curX) / 2;
        const midY = (p1.y + curY) / 2;
        const dist = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1) / unitScale;
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`${dist.toFixed(1)}${unitName}`, midX, midY - 8);
      }
      break;
    }

    default: {
      // Fallback
      if (obj.x !== undefined && obj.y !== undefined) {
        tracerScreenPos = toScreen(obj.x, obj.y);
      }
      break;
    }
  }

  ctx.restore();
  return tracerScreenPos;
}
