/**
 * mathTutorEngine.js
 * Intelligent Mathematical & Geometry Tutor Engine
 * Provides live canvas action dispatch, exact side length and angle calculations,
 * step-by-step Class 10 mathematical proofs, and comprehensive canvas control.
 */

// 1. Precise Euclidean Distance & Vector Math Helpers
export function distanceBetween(p1, p2) {
  const dx = Number(p2.x) - Number(p1.x);
  const dy = Number(p2.y) - Number(p1.y);
  return Math.hypot(dx, dy);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 2. Exact Triangle Metrics Calculation
export function calculateTriangleMetrics(p1, p2, p3, labels = ['A', 'B', 'C']) {
  const l1 = labels[0] || 'A';
  const l2 = labels[1] || 'B';
  const l3 = labels[2] || 'C';

  const a = distanceBetween(p2, p3); // side opposite to vertex 1 (BC)
  const b = distanceBetween(p3, p1); // side opposite to vertex 2 (CA)
  const c = distanceBetween(p1, p2); // side opposite to vertex 3 (AB)

  const sAB = Math.round(c * 100) / 100;
  const sBC = Math.round(a * 100) / 100;
  const sCA = Math.round(b * 100) / 100;

  // Law of Cosines for Interior Angles: cos(A) = (b² + c² - a²) / (2bc)
  const computeAngle = (opp, adj1, adj2) => {
    if (adj1 < 1e-6 || adj2 < 1e-6) return 0;
    const cosVal = clamp((adj1 * adj1 + adj2 * adj2 - opp * opp) / (2 * adj1 * adj2), -1, 1);
    return Math.round((Math.acos(cosVal) * 180 / Math.PI) * 10) / 10;
  };

  const angleA = computeAngle(a, b, c);
  const angleB = computeAngle(b, a, c);
  const angleC = Math.round(Math.max(0, 180 - angleA - angleB) * 10) / 10;

  // Perimeter
  const perimeter = Math.round((sAB + sBC + sCA) * 100) / 100;

  // Shoelace Area
  const area = Math.round(
    0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) * 100
  ) / 100;

  // Classification by sides
  let typeBySides = 'Scalene';
  const diffAB_BC = Math.abs(sAB - sBC);
  const diffBC_CA = Math.abs(sBC - sCA);
  const diffCA_AB = Math.abs(sCA - sAB);

  if (diffAB_BC < 0.15 && diffBC_CA < 0.15 && diffCA_AB < 0.15) {
    typeBySides = 'Equilateral';
  } else if (diffAB_BC < 0.15 || diffBC_CA < 0.15 || diffCA_AB < 0.15) {
    typeBySides = 'Isosceles';
  }

  // Classification by angles
  const maxAngle = Math.max(angleA, angleB, angleC);
  let typeByAngles = 'Acute';
  if (Math.abs(maxAngle - 90) < 0.5) {
    typeByAngles = 'Right-Angled';
  } else if (maxAngle > 90.5) {
    typeByAngles = 'Obtuse';
  }

  return {
    vertices: [
      { label: l1, x: Number(p1.x), y: Number(p1.y) },
      { label: l2, x: Number(p2.x), y: Number(p2.y) },
      { label: l3, x: Number(p3.x), y: Number(p3.y) }
    ],
    sideLengths: [
      { from: l1, to: l2, lengthCm: sAB, name: `Side ${l1}${l2}` },
      { from: l2, to: l3, lengthCm: sBC, name: `Side ${l2}${l3}` },
      { from: l3, to: l1, lengthCm: sCA, name: `Side ${l3}${l1}` }
    ],
    angles: [
      { vertex: l1, name: `∠${l1} (∠${l3}${l1}${l2})`, degrees: angleA },
      { vertex: l2, name: `∠${l2} (∠${l1}${l2}${l3})`, degrees: angleB },
      { vertex: l3, name: `∠${l3} (∠${l2}${l3}${l1})`, degrees: angleC }
    ],
    perimeterCm: perimeter,
    areaCm2: area,
    classification: `${typeBySides} ${typeByAngles} Triangle`
  };
}

// 3. Regular Polygon Metrics
export function calculateRegularPolygonMetrics(center, radius, sides) {
  const r = Number(radius) || 3.5;
  const n = Math.max(3, parseInt(sides, 10) || 5);
  const sideLen = Math.round((2 * r * Math.sin(Math.PI / n)) * 100) / 100;
  const interiorAngle = Math.round((((n - 2) * 180) / n) * 10) / 10;
  const perimeter = Math.round((n * sideLen) * 100) / 100;
  const area = Math.round((0.5 * n * r * r * Math.sin((2 * Math.PI) / n)) * 100) / 100;

  const names = {
    3: 'Equilateral Triangle',
    4: 'Square',
    5: 'Regular Pentagon',
    6: 'Regular Hexagon',
    7: 'Regular Heptagon',
    8: 'Regular Octagon',
    9: 'Regular Nonagon',
    10: 'Regular Decagon',
    12: 'Regular Dodecagon'
  };

  const name = names[n] || `Regular ${n}-gon`;

  return {
    name,
    sides: n,
    radiusCm: r,
    sideLengthCm: sideLen,
    interiorAngleDeg: interiorAngle,
    perimeterCm: perimeter,
    areaCm2: area
  };
}

// 3b. Arbitrary Polygon Metrics
export function calculatePolygonMetrics(pts, labels = []) {
  if (!pts || pts.length < 3) return null;
  const n = pts.length;
  const sideLengths = [];
  const angles = [];
  let perimeter = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const k = (i - 1 + n) % n;
    const pCur = pts[i];
    const pNext = pts[j];
    const pPrev = pts[k];

    const len = Math.round(distanceBetween(pCur, pNext) * 100) / 100;
    perimeter += len;
    const fromLbl = labels[i] || String.fromCharCode(65 + (i % 26));
    const toLbl = labels[j] || String.fromCharCode(65 + (j % 26));
    sideLengths.push({ from: fromLbl, to: toLbl, lengthCm: len });

    // Interior angle at pCur
    const d1x = pPrev.x - pCur.x, d1y = pPrev.y - pCur.y;
    const d2x = pNext.x - pCur.x, d2y = pNext.y - pCur.y;
    const mag1 = Math.hypot(d1x, d1y), mag2 = Math.hypot(d2x, d2y);
    if (mag1 > 1e-6 && mag2 > 1e-6) {
      const cosVal = clamp((d1x * d2x + d1y * d2y) / (mag1 * mag2), -1, 1);
      angles.push({
        vertex: fromLbl,
        degrees: Math.round((Math.acos(cosVal) * 180 / Math.PI) * 10) / 10
      });
    }
  }

  // Shoelace Area
  let areaSum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  const area = Math.round((Math.abs(areaSum) / 2) * 100) / 100;

  return {
    sides: n,
    sideLengths,
    angles,
    perimeterCm: Math.round(perimeter * 100) / 100,
    areaCm2: area
  };
}

// 4. Rectangle / Square Metrics
export function calculateRectangleMetrics(x, y, w, h) {
  const width = Math.abs(Number(w));
  const height = Math.abs(Number(h));
  const isSquare = Math.abs(width - height) < 0.05;
  const diagonal = Math.round(Math.hypot(width, height) * 100) / 100;
  const perimeter = Math.round((2 * (width + height)) * 100) / 100;
  const area = Math.round((width * height) * 100) / 100;

  return {
    name: isSquare ? `Square (${width}×${width} cm)` : `Rectangle (${width}×${height} cm)`,
    isSquare,
    widthCm: width,
    heightCm: height,
    diagonalCm: diagonal,
    interiorAngleDeg: 90.0,
    perimeterCm: perimeter,
    areaCm2: area
  };
}

// 5. Circle Metrics
export function calculateCircleMetrics(center, radius) {
  const r = Math.abs(Number(radius));
  const diameter = Math.round((2 * r) * 100) / 100;
  const circumference = Math.round((2 * Math.PI * r) * 100) / 100;
  const area = Math.round((Math.PI * r * r) * 100) / 100;

  return {
    name: `Circle (radius ${r} cm)`,
    center: { x: Number(center.x) || 0, y: Number(center.y) || 0 },
    radiusCm: r,
    diameterCm: diameter,
    circumferenceCm: circumference,
    areaCm2: area
  };
}

// 5b. Triangle Incircle Metrics
export function calculateIncircleMetrics(p1, p2, p3, labels = ['A', 'B', 'C']) {
  const l1 = labels[0] || 'A';
  const l2 = labels[1] || 'B';
  const l3 = labels[2] || 'C';

  const a = distanceBetween(p2, p3); // BC opposite vertex 1
  const b = distanceBetween(p3, p1); // CA opposite vertex 2
  const c = distanceBetween(p1, p2); // AB opposite vertex 3

  const perimeter = a + b + c;
  const s = perimeter / 2;
  const area = 0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
  const inradius = s > 1e-6 ? area / s : 0;

  const ix = perimeter > 1e-6 ? (a * p1.x + b * p2.x + c * p3.x) / perimeter : 0;
  const iy = perimeter > 1e-6 ? (a * p1.y + b * p2.y + c * p3.y) / perimeter : 0;

  return {
    incenter: {
      x: Math.round(ix * 100) / 100,
      y: Math.round(iy * 100) / 100
    },
    inradiusCm: Math.round(inradius * 100) / 100,
    diameterCm: Math.round(2 * inradius * 100) / 100,
    circumferenceCm: Math.round(2 * Math.PI * inradius * 100) / 100,
    areaCm2: Math.round(Math.PI * inradius * inradius * 100) / 100,
    triangleAreaCm2: Math.round(area * 100) / 100,
    semiperimeterCm: Math.round(s * 100) / 100,
    perimeterCm: Math.round(perimeter * 100) / 100,
    sideLengths: {
      a: Math.round(a * 100) / 100,
      b: Math.round(b * 100) / 100,
      c: Math.round(c * 100) / 100
    },
    labels: [l1, l2, l3]
  };
}

// 5c. Triangle Circumcircle Metrics
export function calculateCircumcircleMetrics(p1, p2, p3, labels = ['A', 'B', 'C']) {
  const l1 = labels[0] || 'A';
  const l2 = labels[1] || 'B';
  const l3 = labels[2] || 'C';

  const a = distanceBetween(p2, p3);
  const b = distanceBetween(p3, p1);
  const c = distanceBetween(p1, p2);

  const area = 0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
  const R = area > 1e-6 ? (a * b * c) / (4 * area) : 0;

  const d = 2 * (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
  let ux = 0;
  let uy = 0;
  if (Math.abs(d) > 1e-6) {
    ux = ((p1.x ** 2 + p1.y ** 2) * (p2.y - p3.y) + (p2.x ** 2 + p2.y ** 2) * (p3.y - p1.y) + (p3.x ** 2 + p3.y ** 2) * (p1.y - p2.y)) / d;
    uy = ((p1.x ** 2 + p1.y ** 2) * (p3.x - p2.x) + (p2.x ** 2 + p2.y ** 2) * (p1.x - p3.x) + (p3.x ** 2 + p3.y ** 2) * (p2.x - p1.x)) / d;
  }

  return {
    circumcenter: {
      x: Math.round(ux * 100) / 100,
      y: Math.round(uy * 100) / 100
    },
    circumradiusCm: Math.round(R * 100) / 100,
    diameterCm: Math.round(2 * R * 100) / 100,
    circumferenceCm: Math.round(2 * Math.PI * R * 100) / 100,
    areaCm2: Math.round(Math.PI * R * R * 100) / 100,
    triangleAreaCm2: Math.round(area * 100) / 100,
    sideLengths: {
      a: Math.round(a * 100) / 100,
      b: Math.round(b * 100) / 100,
      c: Math.round(c * 100) / 100
    },
    labels: [l1, l2, l3]
  };
}

// Helper to inspect canvas objects and resolve existing triangle or points
export function getExistingTriangle(objects = []) {
  if (!Array.isArray(objects)) return null;

  // 1. Triangle object
  const tri = objects.find((o) => o.type === 'triangle');
  if (tri && Array.isArray(tri.pts) && tri.pts.length >= 3) {
    const labels = Array.isArray(tri.labels) && tri.labels.length >= 3 ? tri.labels : ['A', 'B', 'C'];
    return {
      p1: { x: Math.round((tri.pts[0].x / 40) * 100) / 100, y: Math.round((-tri.pts[0].y / 40) * 100) / 100 },
      p2: { x: Math.round((tri.pts[1].x / 40) * 100) / 100, y: Math.round((-tri.pts[1].y / 40) * 100) / 100 },
      p3: { x: Math.round((tri.pts[2].x / 40) * 100) / 100, y: Math.round((-tri.pts[2].y / 40) * 100) / 100 },
      labels,
      id: tri.id
    };
  }

  // 2. Three points on canvas
  const points = objects.filter((o) => o.type === 'point');
  if (points.length >= 3) {
    const pA = points.find((p) => p.label === 'A') || points[0];
    const pB = points.find((p) => p.label === 'B') || points[1];
    const pC = points.find((p) => p.label === 'C') || points[2];
    return {
      p1: { x: Math.round((pA.x / 40) * 100) / 100, y: Math.round((-pA.y / 40) * 100) / 100 },
      p2: { x: Math.round((pB.x / 40) * 100) / 100, y: Math.round((-pB.y / 40) * 100) / 100 },
      p3: { x: Math.round((pC.x / 40) * 100) / 100, y: Math.round((-pC.y / 40) * 100) / 100 },
      labels: [pA.label || 'A', pB.label || 'B', pC.label || 'C']
    };
  }

  return null;
}

// 6. Comprehensive Geometry Intent Parser & Canvas Action Builder
export function processTutorQuery({ prompt, objects = [], gridSettings = {} }) {
  const userText = (prompt || '').trim();
  const lower = userText.toLowerCase();

  // A. Canvas Reset / Clear
  if (/^(clear|reset|delete all|erase)\b|clear canvas|reset canvas|erase canvas/i.test(lower)) {
    return {
      drew: true,
      actions: [
        { type: 'clear_canvas' },
        { type: 'set_view', params: { type: 'reset' } }
      ],
      responseText: `### 🧹 Canvas Clear Requested

I reset the viewpoint to the origin \`(0, 0)\`. Please confirm the canvas-clear request in the confirmation bar.

**Tutor Canvas Control Active! What would you like to draw next?**
- 🔺 *"Create a triangle"* or *"Draw a 3-4-5 right triangle"*
- ⭕ *"Draw an incircle in the triangle"* or *"Draw a circumcircle"*
- 📐 *"Draw an altitude from C to AB"* or *"Draw a median"*
- ⭕ *"Draw a circle with radius 4"*
- 🟦 *"Draw a rectangle 6x4"* or *"Draw a square"*
- ⬡ *"Draw a regular pentagon"* or *"Draw a hexagon"*
- 📏 *"Add a ruler to measure"*`
    };
  }

  // B. Fit View / Zoom
  if (/^(fit|zoom|center)\b|fit view|zoom to fit|center canvas/i.test(lower)) {
    return {
      drew: true,
      actions: [{ type: 'set_view', params: { type: 'fit' } }],
      responseText: `### 🔍 Canvas View Adjusted

I have centered and zoomed the canvas view so all your geometric objects fit comfortably on the screen.`
    };
  }

  // C. INCIRCLE / INSCRIBED CIRCLE (Matches "draw a incircle in it", "draw incircle", "draw an incircle", etc.)
  if (/\b(?:in-?circle|inscribed\s+circle|incenter)\b|draw\s+(?:a\s+|an\s+|the\s+)?in-?circle/i.test(lower)) {
    let triData = getExistingTriangle(objects);
    let isNewTriangle = false;

    if (!triData) {
      // Default to the standard 3-4-5 right triangle with vertices A(3,4), B(0,0), C(3,0)
      isNewTriangle = true;
      triData = {
        p1: { x: 3.0, y: 4.0 },
        p2: { x: 0.0, y: 0.0 },
        p3: { x: 3.0, y: 0.0 },
        labels: ['A', 'B', 'C']
      };
    }

    const { p1, p2, p3, labels } = triData;
    const metrics = calculateIncircleMetrics(p1, p2, p3, labels);
    const actions = [];

    if (isNewTriangle) {
      actions.push({
        type: 'add_triangle',
        p1: { x: p1.x, y: p1.y, label: labels[0] },
        p2: { x: p2.x, y: p2.y, label: labels[1] },
        p3: { x: p3.x, y: p3.y, label: labels[2] },
        labels
      });
      // Right angle at C(3, 0)
      actions.push({
        type: 'add_right_angle',
        vertex: { x: p3.x, y: p3.y },
        p1: { x: p2.x, y: p2.y },
        p2: { x: p1.x, y: p1.y }
      });
    }

    // Incenter point & incircle
    actions.push({
      type: 'add_point',
      x: metrics.incenter.x,
      y: metrics.incenter.y,
      label: 'I',
      color: '#38bdf8'
    });
    actions.push({
      type: 'add_circle',
      center: { x: metrics.incenter.x, y: metrics.incenter.y },
      radius: metrics.inradiusCm,
      color: '#0284c7'
    });
    actions.push({ type: 'set_view', params: { type: 'fit' } });

    const responseText = `### 🎨 Live Canvas Drawing: Incircle (Inscribed Circle)

I have constructed the **Incircle** of **Triangle ${labels[0]}${labels[1]}${labels[2]}** directly on your canvas!

#### 1. Incircle Geometric Dimensions:
- **Incenter (I)**: \`(${metrics.incenter.x.toFixed(2)}, ${metrics.incenter.y.toFixed(2)}) cm\`
- **Inradius (r)**: \`${metrics.inradiusCm.toFixed(2)} cm\`
- **Diameter (d)**: \`${metrics.diameterCm.toFixed(2)} cm\` (\`d = 2r\`)
- **Circumference (C)**: \`${metrics.circumferenceCm.toFixed(2)} cm\` (\`C = 2πr\`)
- **Area (A)**: \`${metrics.areaCm2.toFixed(2)} cm²\` (\`A = πr²\`)

#### 2. Triangle Dimensions & Side Lengths:
- **Vertex ${labels[0]}**: \`(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}) cm\`
- **Vertex ${labels[1]}**: \`(${p2.x.toFixed(2)}, ${p2.y.toFixed(2)}) cm\`
- **Vertex ${labels[2]}**: \`(${p3.x.toFixed(2)}, ${p3.y.toFixed(2)}) cm\`
- **Side ${labels[1]}${labels[2]} (a)**: \`${metrics.sideLengths.a.toFixed(2)} cm\`
- **Side ${labels[2]}${labels[0]} (b)**: \`${metrics.sideLengths.b.toFixed(2)} cm\`
- **Side ${labels[0]}${labels[1]} (c)**: \`${metrics.sideLengths.c.toFixed(2)} cm\`
- **Perimeter (P)**: \`${metrics.perimeterCm.toFixed(2)} cm\` (\`P = a + b + c\`)
- **Semi-perimeter (s)**: \`s = P / 2 = ${metrics.semiperimeterCm.toFixed(2)} cm\`
- **Triangle Area (Δ)**: \`${metrics.triangleAreaCm2.toFixed(2)} cm²\`

#### 3. Step-by-Step Mathematical Derivation:
1. **Inradius Formula**:
   For any triangle, the area $\\Delta$ is related to semi-perimeter $s$ and inradius $r$ by $\\Delta = r \\cdot s$:
   \`r = Δ / s = ${metrics.triangleAreaCm2.toFixed(2)} / ${metrics.semiperimeterCm.toFixed(2)} = ${metrics.inradiusCm.toFixed(2)} cm\`
2. **Incenter Coordinates Formula**:
   Using the weighted vertex coordinates with opposite side lengths:
   \`I_x = (a·x_A + b·x_B + c·x_C) / (a + b + c) = ${metrics.incenter.x.toFixed(2)} cm\`
   \`I_y = (a·y_A + b·y_B + c·y_C) / (a + b + c) = ${metrics.incenter.y.toFixed(2)} cm\`
3. **Geometric Significance**:
   The incircle is tangent to all three sides of $\\Delta ${labels[0]}${labels[1]}${labels[2]}$. The incenter \`I\` is the unique point of intersection of the three interior angle bisectors.

💡 *Tutor Canvas Control: You can also ask me to: draw the circumcircle, draw an altitude from C to AB, construct a median, or clear the canvas!*`;

    return { drew: true, actions, responseText };
  }

  // D. CIRCUMCIRCLE / CIRCUMSCRIBED CIRCLE
  if (/\b(?:circum-?circle|circumscribed\s+circle|circumcenter)\b|draw\s+(?:a\s+|an\s+|the\s+)?circum-?circle/i.test(lower)) {
    let triData = getExistingTriangle(objects);
    let isNewTriangle = false;

    if (!triData) {
      isNewTriangle = true;
      triData = {
        p1: { x: 3.0, y: 4.0 },
        p2: { x: 0.0, y: 0.0 },
        p3: { x: 3.0, y: 0.0 },
        labels: ['A', 'B', 'C']
      };
    }

    const { p1, p2, p3, labels } = triData;
    const metrics = calculateCircumcircleMetrics(p1, p2, p3, labels);
    const actions = [];

    if (isNewTriangle) {
      actions.push({
        type: 'add_triangle',
        p1: { x: p1.x, y: p1.y, label: labels[0] },
        p2: { x: p2.x, y: p2.y, label: labels[1] },
        p3: { x: p3.x, y: p3.y, label: labels[2] },
        labels
      });
      actions.push({
        type: 'add_right_angle',
        vertex: { x: p3.x, y: p3.y },
        p1: { x: p2.x, y: p2.y },
        p2: { x: p1.x, y: p1.y }
      });
    }

    // Circumcenter point & circumcircle
    actions.push({
      type: 'add_point',
      x: metrics.circumcenter.x,
      y: metrics.circumcenter.y,
      label: 'O',
      color: '#a855f7'
    });
    actions.push({
      type: 'add_circle',
      center: { x: metrics.circumcenter.x, y: metrics.circumcenter.y },
      radius: metrics.circumradiusCm,
      color: '#7c3aed'
    });
    actions.push({ type: 'set_view', params: { type: 'fit' } });

    const responseText = `### 🎨 Live Canvas Drawing: Circumcircle (Circumscribed Circle)

I have constructed the **Circumcircle** passing through all three vertices of **Triangle ${labels[0]}${labels[1]}${labels[2]}**!

#### 1. Circumcircle Geometric Dimensions:
- **Circumcenter (O)**: \`(${metrics.circumcenter.x.toFixed(2)}, ${metrics.circumcenter.y.toFixed(2)}) cm\`
- **Circumradius (R)**: \`${metrics.circumradiusCm.toFixed(2)} cm\`
- **Diameter (D)**: \`${metrics.diameterCm.toFixed(2)} cm\` (\`D = 2R\`)
- **Circumference (C)**: \`${metrics.circumferenceCm.toFixed(2)} cm\` (\`C = 2πR\`)
- **Area (A)**: \`${metrics.areaCm2.toFixed(2)} cm²\` (\`A = πR²\`)

#### 2. Mathematical Explanation:
1. **Circumradius Formula**:
   \`R = (a·b·c) / (4·Δ) = (${metrics.sideLengths.a} × ${metrics.sideLengths.b} × ${metrics.sideLengths.c}) / (4 × ${metrics.triangleAreaCm2.toFixed(2)}) = ${metrics.circumradiusCm.toFixed(2)} cm\`
2. **Circumcenter Properties**:
   The circumcenter \`O\` is the intersection point of the three perpendicular bisectors of the sides. In a right triangle, \`O\` lies exactly on the midpoint of the hypotenuse!

💡 *Tutor Canvas Control: Ask me to draw an altitude, inscribe an incircle, or measure angles!*`;

    return { drew: true, actions, responseText };
  }

  // E. ALTITUDE / HEIGHT
  if (/\b(?:altitude|height|orthocenter)\b|draw\s+(?:an?\s+)?altitude/i.test(lower)) {
    let triData = getExistingTriangle(objects);
    let isNewTriangle = false;

    if (!triData) {
      isNewTriangle = true;
      triData = {
        p1: { x: 3.0, y: 4.0 },
        p2: { x: 0.0, y: 0.0 },
        p3: { x: 3.0, y: 0.0 },
        labels: ['A', 'B', 'C']
      };
    }

    const { p1, p2, p3, labels } = triData;
    // Default altitude from C to AB, or from specified vertex
    let P = p3, Q = p2, R = p1; // from C to AB
    let pLabel = labels[2], qLabel = labels[1], rLabel = labels[0];

    if (/from\s+a\b/i.test(lower)) {
      P = p1; Q = p2; R = p3;
      pLabel = labels[0]; qLabel = labels[1]; rLabel = labels[2];
    } else if (/from\s+b\b/i.test(lower)) {
      P = p2; Q = p3; R = p1;
      pLabel = labels[1]; qLabel = labels[2]; rLabel = labels[0];
    }

    // Foot of perpendicular from P onto segment QR
    const vx = R.x - Q.x;
    const vy = R.y - Q.y;
    const wx = P.x - Q.x;
    const wy = P.y - Q.y;
    const lenSq = vx * vx + vy * vy;
    const t = lenSq > 1e-6 ? (wx * vx + wy * vy) / lenSq : 0;
    const footX = Math.round((Q.x + t * vx) * 100) / 100;
    const footY = Math.round((Q.y + t * vy) * 100) / 100;
    const altLen = Math.round(Math.hypot(P.x - footX, P.y - footY) * 100) / 100;

    const actions = [];
    if (isNewTriangle) {
      actions.push({
        type: 'add_triangle',
        p1: { x: p1.x, y: p1.y, label: labels[0] },
        p2: { x: p2.x, y: p2.y, label: labels[1] },
        p3: { x: p3.x, y: p3.y, label: labels[2] },
        labels
      });
    }

    // Foot point D
    actions.push({
      type: 'add_point',
      x: footX,
      y: footY,
      label: 'D',
      color: '#f59e0b'
    });
    // Altitude segment PD
    actions.push({
      type: 'add_line',
      from: { x: P.x, y: P.y },
      to: { x: footX, y: footY },
      color: '#f59e0b',
      dash: [4, 4]
    });
    // Right angle marker at foot
    actions.push({
      type: 'add_right_angle',
      vertex: { x: footX, y: footY },
      p1: { x: P.x, y: P.y },
      p2: { x: Q.x, y: Q.y }
    });
    actions.push({ type: 'set_view', params: { type: 'fit' } });

    const responseText = `### 🎨 Live Canvas Drawing: Altitude ${pLabel}D to ${qLabel}${rLabel}

I have constructed the perpendicular **Altitude from ${pLabel} to ${qLabel}${rLabel}**!

#### 1. Altitude Metrics:
- **Vertex ${pLabel}**: \`(${P.x.toFixed(2)}, ${P.y.toFixed(2)}) cm\`
- **Foot of Perpendicular (D)**: \`(${footX.toFixed(2)}, ${footY.toFixed(2)}) cm\` on base ${qLabel}${rLabel}
- **Altitude Length (${pLabel}D)**: \`${altLen.toFixed(2)} cm\`
- **Base Length (${qLabel}${rLabel})**: \`${Math.hypot(vx, vy).toFixed(2)} cm\`

#### 2. Area Verification:
\`Area = 1/2 × base × height = 1/2 × ${Math.hypot(vx, vy).toFixed(2)} × ${altLen.toFixed(2)} = ${(0.5 * Math.hypot(vx, vy) * altLen).toFixed(2)} cm²\`

💡 *Tutor Canvas Control: Ask me to draw another altitude, inscribe an incircle, or draw a median!*`;

    return { drew: true, actions, responseText };
  }

  // F. MEDIAN / CENTROID
  if (/\b(?:median|centroid)\b|draw\s+(?:a\s+)?median/i.test(lower)) {
    let triData = getExistingTriangle(objects);
    let isNewTriangle = false;

    if (!triData) {
      isNewTriangle = true;
      triData = {
        p1: { x: 3.0, y: 4.0 },
        p2: { x: 0.0, y: 0.0 },
        p3: { x: 3.0, y: 0.0 },
        labels: ['A', 'B', 'C']
      };
    }

    const { p1, p2, p3, labels } = triData;
    // Median from C to AB
    const midX = Math.round(((p1.x + p2.x) / 2) * 100) / 100;
    const midY = Math.round(((p1.y + p2.y) / 2) * 100) / 100;
    const gx = Math.round(((p1.x + p2.x + p3.x) / 3) * 100) / 100;
    const gy = Math.round(((p1.y + p2.y + p3.y) / 3) * 100) / 100;
    const medianLen = Math.round(Math.hypot(p3.x - midX, p3.y - midY) * 100) / 100;

    const actions = [];
    if (isNewTriangle) {
      actions.push({
        type: 'add_triangle',
        p1: { x: p1.x, y: p1.y, label: labels[0] },
        p2: { x: p2.x, y: p2.y, label: labels[1] },
        p3: { x: p3.x, y: p3.y, label: labels[2] },
        labels
      });
    }

    actions.push({ type: 'add_point', x: midX, y: midY, label: 'M', color: '#ec4899' });
    actions.push({ type: 'add_line', from: { x: p3.x, y: p3.y }, to: { x: midX, y: midY }, color: '#ec4899' });
    actions.push({ type: 'add_point', x: gx, y: gy, label: 'G', color: '#10b981' });
    actions.push({ type: 'set_view', params: { type: 'fit' } });

    const responseText = `### 🎨 Live Canvas Drawing: Median ${labels[2]}M and Centroid G

I have constructed the **Median from ${labels[2]} to Midpoint M of ${labels[0]}${labels[1]}** and marked the **Centroid G**!

#### 1. Geometric Dimensions:
- **Midpoint M of ${labels[0]}${labels[1]}**: \`(${midX.toFixed(2)}, ${midY.toFixed(2)}) cm\`
- **Median Length (${labels[2]}M)**: \`${medianLen.toFixed(2)} cm\`
- **Centroid G (Center of Mass)**: \`(${gx.toFixed(2)}, ${gy.toFixed(2)}) cm\`

#### 2. Centroid Theorem:
The centroid \`G\` divides the median in a \`2:1\` ratio from vertex \`${labels[2]}\`:
\`${labels[2]}G / GM = 2 / 1\`.

💡 *Tutor Canvas Control: Ask me to draw an incircle, circumcircle, or altitude!*`;

    return { drew: true, actions, responseText };
  }

  // G. TRIANGLES (handles "draw it", custom coordinates, right, equilateral, isosceles, general)
  if (/triangle|trianlge|traingle|trangle|\bdraw it\b|\bdraw this\b/i.test(lower)) {
    let p1, p2, p3;
    let triangleType = 'General';

    // Check for explicit coordinates in prompt: e.g. A(3, 4), B(0, 0), C(3, 0)
    const coordMatches = [...userText.matchAll(/([A-Z])?\s*\(\s*(-?\d+(?:\.\d+)?)\s*(?:cm)?\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:cm)?\s*\)/gi)];
    if (coordMatches.length >= 3) {
      p1 = { x: parseFloat(coordMatches[0][2]), y: parseFloat(coordMatches[0][3]) };
      p2 = { x: parseFloat(coordMatches[1][2]), y: parseFloat(coordMatches[1][3]) };
      p3 = { x: parseFloat(coordMatches[2][2]), y: parseFloat(coordMatches[2][3]) };
      triangleType = 'Triangle from Given Coordinates';
    }
    // 1. 3-4-5 or Right-angled Triangle (or "draw it" after discussing classic right triangle)
    else if (/right|3-4-5|3 4 5|pythagor|\bdraw it\b|\bdraw this\b/i.test(lower)) {
      triangleType = '3-4-5 Right-Angled Triangle';
      // Standard A(3, 4), B(0, 0), C(3, 0) - Right angle at C(3, 0), side BC = 3, CA = 4, AB = 5
      p1 = { x: 3.0, y: 4.0 };
      p2 = { x: 0.0, y: 0.0 };
      p3 = { x: 3.0, y: 0.0 };
    }
    // 2. Equilateral Triangle
    else if (/equilateral|regular triangle/i.test(lower)) {
      triangleType = 'Equilateral Triangle';
      p1 = { x: -2.5, y: -1.44 };
      p2 = { x: 2.5, y: -1.44 };
      p3 = { x: 0, y: 2.89 };
    }
    // 3. Isosceles Triangle
    else if (/isosceles/i.test(lower)) {
      triangleType = 'Isosceles Triangle';
      p1 = { x: -3.0, y: -1.5 };
      p2 = { x: 3.0, y: -1.5 };
      p3 = { x: 0, y: 3.5 };
    }
    // 4. Default / General Triangle
    else {
      const existingPoints = objects.filter((o) => o.type === 'point');
      if (existingPoints.length === 3 && !objects.some((o) => o.type === 'triangle')) {
        p1 = { x: existingPoints[0].x / 40, y: -existingPoints[0].y / 40 };
        p2 = { x: existingPoints[1].x / 40, y: -existingPoints[1].y / 40 };
        p3 = { x: existingPoints[2].x / 40, y: -existingPoints[2].y / 40 };
        triangleType = 'Triangle from Canvas Points';
      } else {
        triangleType = '3-4-5 Right Triangle ABC';
        p1 = { x: 3.0, y: 4.0 };
        p2 = { x: 0.0, y: 0.0 };
        p3 = { x: 3.0, y: 0.0 };
      }
    }

    const metrics = calculateTriangleMetrics(p1, p2, p3, ['A', 'B', 'C']);

    const actions = [
      {
        type: 'add_triangle',
        p1: { x: metrics.vertices[0].x, y: metrics.vertices[0].y, label: 'A' },
        p2: { x: metrics.vertices[1].x, y: metrics.vertices[1].y, label: 'B' },
        p3: { x: metrics.vertices[2].x, y: metrics.vertices[2].y, label: 'C' },
        labels: ['A', 'B', 'C']
      },
      { type: 'set_view', params: { type: 'fit' } }
    ];

    if (/right|3-4-5|3 4 5|\bdraw it\b|\bdraw this\b/i.test(lower) || metrics.classification.includes('Right')) {
      actions.splice(1, 0, {
        type: 'add_right_angle',
        vertex: { x: p3.x, y: p3.y },
        p1: { x: p2.x, y: p2.y },
        p2: { x: p1.x, y: p1.y }
      });
    }

    const responseText = `### 🎨 Live Canvas Drawing: ${triangleType}

I have constructed the **Triangle ABC** directly on your canvas! Here are its exact geometric measurements:

#### 1. Vertices Coordinates:
- **Point A**: \`(${metrics.vertices[0].x.toFixed(2)}, ${metrics.vertices[0].y.toFixed(2)}) cm\`
- **Point B**: \`(${metrics.vertices[1].x.toFixed(2)}, ${metrics.vertices[1].y.toFixed(2)}) cm\`
- **Point C**: \`(${metrics.vertices[2].x.toFixed(2)}, ${metrics.vertices[2].y.toFixed(2)}) cm\`

#### 2. Side Lengths:
- **${metrics.sideLengths[0].name}**: \`${metrics.sideLengths[0].lengthCm.toFixed(2)} cm\`
- **${metrics.sideLengths[1].name}**: \`${metrics.sideLengths[1].lengthCm.toFixed(2)} cm\`
- **${metrics.sideLengths[2].name}**: \`${metrics.sideLengths[2].lengthCm.toFixed(2)} cm\`
- **Total Perimeter (P)**: \`${metrics.perimeterCm.toFixed(2)} cm\` (\`P = AB + BC + CA\`)

#### 3. Internal Angles:
- **${metrics.angles[0].name}**: \`${metrics.angles[0].degrees.toFixed(1)}°\`
- **${metrics.angles[1].name}**: \`${metrics.angles[1].degrees.toFixed(1)}°\`
- **${metrics.angles[2].name}**: \`${metrics.angles[2].degrees.toFixed(1)}°\` (Right angle at C)
- **Angle Sum**: \`${(metrics.angles[0].degrees + metrics.angles[1].degrees + metrics.angles[2].degrees).toFixed(1)}°\` (Angle Sum Property: \`∠A + ∠B + ∠C = 180°\`)

#### 4. Area & Classification:
- **Area (A)**: \`${metrics.areaCm2.toFixed(2)} cm²\`
- **Classification**: **${metrics.classification}**

#### 5. Step-by-Step Mathematical Explanation:
1. **Distance Formula**:
   Applied \`d = √((x₂ - x₁)² + (y₂ - y₁)²)\` across each vertex pair to establish the exact side lengths.
2. **Law of Cosines for Interior Angles**:
   Applied \`cos(θ) = (b² + c² - a²) / (2bc)\` for each vertex to calculate the exact interior angles.
3. **Shoelace Area Formula**:
   \`Area = 1/2 |(x₁y₂ + x₂y₃ + x₃y₁) - (y₁x₂ + y₂x₃ + y₃x₁)| = ${metrics.areaCm2.toFixed(2)} cm²\`

💡 *Tutor Canvas Control: You can ask me to: draw an incircle in it, draw circumcircle, draw an altitude from C to AB, measure any edge with a ruler, or clear the canvas!*`;

    return { drew: true, actions, responseText };
  }

  // D. CIRCLES
  if (/circle|cirle|cirlce/i.test(lower)) {
    const radMatch = lower.match(/(?:radius|r|rad)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const r = radMatch ? parseFloat(radMatch[1]) : 4.0;
    const metrics = calculateCircleMetrics({ x: 0, y: 0 }, r);

    const actions = [
      { type: 'add_circle', center: { x: 0, y: 0 }, radius: r },
      { type: 'set_view', params: { type: 'fit' } }
    ];

    const responseText = `### 🎨 Live Canvas Drawing: Circle (Radius = ${r} cm)

I have drawn the circle centered at origin \`(0, 0)\` on your canvas!

#### 1. Geometric Dimensions:
- **Center (O)**: \`(0.00, 0.00) cm\`
- **Radius (r)**: \`${metrics.radiusCm.toFixed(2)} cm\`
- **Diameter (d)**: \`${metrics.diameterCm.toFixed(2)} cm\` (\`d = 2r\`)
- **Circumference (C)**: \`${metrics.circumferenceCm.toFixed(2)} cm\` (\`C = 2πr\`)
- **Area (A)**: \`${metrics.areaCm2.toFixed(2)} cm²\` (\`A = πr²\`)

#### 2. Mathematical Explanation:
1. **Circumference Formula**:
   \`C = 2 × π × ${r} = ${metrics.circumferenceCm.toFixed(2)} cm\`
2. **Area Formula**:
   \`A = π × (${r})² = ${metrics.areaCm2.toFixed(2)} cm²\`

💡 *Tutor Canvas Control: Ask me to draw a tangent, place a point on the circle, or add a measurement ruler!*`;

    return { drew: true, actions, responseText };
  }

  // E. RECTANGLE & SQUARE
  if (/rectangle|rect|square|sqaure/i.test(lower)) {
    const isSquare = /square|sqaure/i.test(lower);
    let w = 6.0;
    let h = 4.0;

    const dimMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:x|by|\*)\s*(\d+(?:\.\d+)?)/i);
    if (dimMatch) {
      w = parseFloat(dimMatch[1]);
      h = parseFloat(dimMatch[2]);
    } else if (isSquare) {
      const sideMatch = lower.match(/(?:side|size)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
      w = sideMatch ? parseFloat(sideMatch[1]) : 4.0;
      h = w;
    }

    const metrics = calculateRectangleMetrics(-w / 2, -h / 2, w, h);

    const actions = [
      { type: 'add_rectangle', x: -w / 2, y: -h / 2, w, h },
      { type: 'set_view', params: { type: 'fit' } }
    ];

    const responseText = `### 🎨 Live Canvas Drawing: ${metrics.name}

I have constructed the **${metrics.name}** centered on the canvas!

#### 1. Dimensions & Side Lengths:
- **Width**: \`${metrics.widthCm.toFixed(2)} cm\` (horizontal sides)
- **Height**: \`${metrics.heightCm.toFixed(2)} cm\` (vertical sides)
- **Diagonal (d)**: \`${metrics.diagonalCm.toFixed(2)} cm\` (\`d = √(w² + h²)\`)
- **Perimeter (P)**: \`${metrics.perimeterCm.toFixed(2)} cm\` (\`P = 2(w + h)\`)
- **Area (A)**: \`${metrics.areaCm2.toFixed(2)} cm²\` (\`A = w × h\`)

#### 2. Interior Angles:
- All 4 corners form exact **90.0°** right angles: \`∠A = ∠B = ∠C = ∠D = 90.0°\`.
- Total Interior Angle Sum: \`360.0°\`.

💡 *Tutor Canvas Control: Ask me to draw the diagonal line, measure an angle, or clear the canvas.*`;

    return { drew: true, actions, responseText };
  }

  // F. REGULAR POLYGONS (Pentagon, Hexagon, Octagon, N-gon)
  if (/pentagon|hexagon|heptagon|octagon|nonagon|decagon|regular polygon/i.test(lower)) {
    let sides = 5;
    if (/hexagon/i.test(lower)) sides = 6;
    else if (/heptagon/i.test(lower)) sides = 7;
    else if (/octagon/i.test(lower)) sides = 8;
    else if (/nonagon/i.test(lower)) sides = 9;
    else if (/decagon/i.test(lower)) sides = 10;
    else {
      const sidesMatch = lower.match(/(\d+)\s*(?:sides|gon|-gon)/i);
      if (sidesMatch) sides = parseInt(sidesMatch[1], 10);
    }

    const radius = 3.5;
    const metrics = calculateRegularPolygonMetrics({ x: 0, y: 0 }, radius, sides);

    const actions = [
      { type: 'add_regular_polygon', center: { x: 0, y: 0 }, radius, sides },
      { type: 'set_view', params: { type: 'fit' } }
    ];

    const responseText = `### 🎨 Live Canvas Drawing: ${metrics.name}

I have constructed a **${metrics.name}** with ${sides} equal sides centered on your canvas!

#### 1. Geometric Dimensions:
- **Number of Sides (n)**: \`${metrics.sides}\`
- **Circumradius (r)**: \`${metrics.radiusCm.toFixed(2)} cm\`
- **Each Side Length (s)**: \`${metrics.sideLengthCm.toFixed(2)} cm\` (\`s = 2r × sin(π/n)\`)
- **Total Perimeter (P)**: \`${metrics.perimeterCm.toFixed(2)} cm\` (\`P = n × s\`)
- **Total Area (A)**: \`${metrics.areaCm2.toFixed(2)} cm²\` (\`A = 1/2 × n × r² × sin(2π/n)\`)

#### 2. Interior Angles:
- **Each Interior Angle**: \`${metrics.interiorAngleDeg.toFixed(1)}°\` (\`Angle = ((n - 2) × 180°) / n\`)
- **Sum of All Interior Angles**: \`${((metrics.sides - 2) * 180).toFixed(1)}°\`

💡 *Tutor Canvas Control: Ask me to add a measurement ruler, construct an inscribed circle, or clear the canvas.*`;

    return { drew: true, actions, responseText };
  }

  // G. LINES & SEGMENTS
  if (/line|segment|connect/i.test(lower) && !lower.includes('shoelace')) {
    const p1 = { x: -3.0, y: -1.5 };
    const p2 = { x: 3.0, y: 2.0 };
    const len = distanceBetween(p1, p2);
    const angle = Math.round((Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI) * 10) / 10;

    const actions = [
      { type: 'add_line', from: p1, to: p2 },
      { type: 'set_view', params: { type: 'fit' } }
    ];

    const responseText = `### 🎨 Live Canvas Drawing: Line Segment AB

I have drawn a straight line segment from \`A(${p1.x}, ${p1.y}) cm\` to \`B(${p2.x}, ${p2.y}) cm\`!

#### 1. Segment Properties:
- **Start Point A**: \`(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}) cm\`
- **End Point B**: \`(${p2.x.toFixed(2)}, ${p2.y.toFixed(2)}) cm\`
- **Length (d)**: \`${len.toFixed(2)} cm\` (\`d = √((x₂ - x₁)² + (y₂ - y₁)²)\`)
- **Inclination Angle (θ)**: \`${angle.toFixed(1)}°\` with horizontal axis
- **Midpoint (M)**: \`${((p1.x + p2.x) / 2).toFixed(2)}, ${((p1.y + p2.y) / 2).toFixed(2)}) cm\`

💡 *Tutor Canvas Control: Ask me to construct a perpendicular bisector, add a ruler, or draw a shape.*`;

    return { drew: true, actions, responseText };
  }

  // H. RULER / MEASUREMENT
  if (/ruler|measure/i.test(lower) && !lower.includes('shoelace')) {
    const p1 = { x: -3.0, y: 0 };
    const p2 = { x: 3.0, y: 0 };
    const dist = distanceBetween(p1, p2);

    const actions = [
      { type: 'add_ruler', from: p1, to: p2 },
      { type: 'set_view', params: { type: 'fit' } }
    ];

    const responseText = `### 📏 Measurement Ruler Placed

I have placed a high-precision Photoshop-style measurement ruler on the canvas between \`(-3.00, 0.00)\` and \`(3.00, 0.00)\`!

- **Measured Distance**: \`${dist.toFixed(2)} cm\` (120px)
- **Angle**: \`0.0°\`
- **ΔX**: \`6.00 cm\`, **ΔY**: \`0.00 cm\`

*Tip: You can drag ruler endpoints directly on the canvas to measure any dimension!*`;

    return { drew: true, actions, responseText };
  }

  // I. Educational Theory Fallbacks (Pythagoras, Circles, Trig, Shoelace, Quadratics)
  return {
    drew: false,
    actions: [],
    responseText: getOfflineTutorResponse(userText)
  };
}

// 7. Backward-compatible offline educational response generator
export function getOfflineTutorResponse(prompt) {
  const query = (prompt || '').toLowerCase();

  // Polygon / N-gon / Shoelace formula questions
  if (query.includes('polygon') || query.includes('shoelace') || query.includes('n-gon') || query.includes('pentagon') || query.includes('hexagon')) {
    return `### Understanding Polygons and Area Calculation

A **polygon** is a closed 2D geometric figure formed by 3 or more straight line segments called edges or sides.

1. **Sum of Interior Angles**:
   For any $n$-sided polygon:
   \`Sum = (n - 2) × 180°\`
   - Triangle ($n=3$): \`(3 - 2) × 180° = 180°\`
   - Quadrilateral ($n=4$): \`(4 - 2) × 180° = 360°\`
   - Pentagon ($n=5$): \`(5 - 2) × 180° = 540°\`
   - Hexagon ($n=6$): \`(6 - 2) × 180° = 720°\`

2. **Each Interior Angle in a Regular Polygon**:
   \`Angle = \\frac{(n - 2) × 180°}{n}\`

3. **Perimeter ($P$)**:
   The sum of all side lengths:
   \`P = s_1 + s_2 + s_3 + ... + s_n\`

4. **Area via the Shoelace Formula (Gauss's Area Formula)**:
   For any polygon with vertices ordered sequentially $(x_1, y_1), (x_2, y_2), ..., (x_n, y_n)$:
   \`Area = \\frac{1}{2} |(x_1 y_2 + x_2 y_3 + ... + x_n y_1) - (y_1 x_2 + y_2 x_3 + ... + y_n x_1)|\`
   
   **How to apply it**:
   - Step 1: List the vertices in counter-clockwise order.
   - Step 2: Multiply cross-diagonals downwards and sum them: \`\\sum (x_i \\cdot y_{i+1})\`.
   - Step 3: Multiply cross-diagonals upwards and sum them: \`\\sum (y_i \\cdot x_{i+1})\`.
   - Step 4: Subtract the upward sum from the downward sum, take absolute value, and divide by 2.

*Tip: Type "draw a triangle" or "draw a pentagon" in the chat and I will construct it live on your canvas with all side lengths and angles!*`;
  }

  // Ruler, Distance, Measurement, Delta X, Delta Y questions
  if (query.includes('ruler') || query.includes('measure') || query.includes('distance') || query.includes('delta')) {
    return `### Coordinate Distance and Measurement Guide

When measuring distance between two points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ on a 2D plane:

1. **Horizontal Distance ($\\Delta x$)**:
   \`\\Delta x = |x_2 - x_1|\`

2. **Vertical Distance ($\\Delta y$)**:
   \`\\Delta y = |y_2 - y_1|\`

3. **Euclidean Distance Formula (Pythagorean Theorem)**:
   The straight-line distance $d$ is the hypotenuse of the right triangle formed by $\\Delta x$ and $\\Delta y$:
   \`d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2} = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}\`

4. **Inclination Angle ($\\theta$)**:
   \`\\theta° = \\arctan\\left(\\frac{y_2 - y_1}{x_2 - x_1}\\right) × \\frac{180°}{\\pi}\`

*Tip: Type "add a ruler" and I will place a measurement ruler directly on your canvas!*`;
  }

  // Pythagoras theorem
  if (query.includes('pythagor') || query.includes('right triangle') || query.includes('hypotenuse')) {
    return `### Pythagorean Theorem (Class 10 Geometry)

In any right-angled triangle where the angle between legs $a$ and $b$ is 90°:

1. **Formula**:
   \`a² + b² = c²\`
   where:
   - \`a\` = perpendicular side (height)
   - \`b\` = base side
   - \`c\` = hypotenuse (the longest side opposite to 90°)

2. **Finding the Hypotenuse**:
   \`c = \\sqrt{a² + b²}\`

3. **Common Pythagorean Triples**:
   - \`(3, 4, 5)\` since \`3² + 4² = 9 + 16 = 25 = 5²\`
   - \`(5, 12, 13)\` since \`5² + 12² = 25 + 144 = 169 = 13²\`
   - \`(8, 15, 17)\` since \`8² + 15² = 64 + 225 = 289 = 17²\`
   - \`(7, 24, 25)\`

*Tip: Ask me to "draw a 3-4-5 triangle" and I will draw it live on your canvas with all side lengths and 90° angle!*`;
  }

  // Circle / Circumference / Area
  if (query.includes('circle') || query.includes('radius') || query.includes('diameter') || query.includes('pi') || query.includes('circumference')) {
    return `### Circle Geometry Fundamentals

For a circle of radius $r$ and diameter $d = 2r$:

1. **Circumference ($C$)**:
   \`C = 2\\pi r = \\pi d\`
   For $r = 7\\text{ cm}$:
   \`C = 2 × \\frac{22}{7} × 7 = 44\\text{ cm}\`

2. **Area ($A$)**:
   \`A = \\pi r²\`
   For $r = 7\\text{ cm}$:
   \`A = \\frac{22}{7} × 7² = 154\\text{ cm}²\`

3. **Cartesian Equation**:
   Centered at origin $(0, 0)$: \`x² + y² = r²\`

*Tip: Ask me to "draw a circle radius 5" to see it live on your canvas!*`;
  }

  // Trigonometry
  if (query.includes('trig') || query.includes('sin') || query.includes('cos') || query.includes('tan')) {
    return `### Class 10 Trigonometry Ratios & Values

In a right triangle with acute angle $\\theta$:
- \`\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}\`
- \`\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}\`
- \`\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{\\sin(\\theta)}{\\cos(\\theta)}\`

**Key Angles Table**:
- \`0°\`: $\\sin = 0$, $\\cos = 1$, $\\tan = 0$
- \`30°\`: $\\sin = 1/2$, $\\cos = \\sqrt{3}/2$, $\\tan = 1/\\sqrt{3}$
- \`45°\`: $\\sin = 1/\\sqrt{2}$, $\\cos = 1/\\sqrt{2}$, $\\tan = 1$
- \`60°\`: $\\sin = \\sqrt{3}/2$, $\\cos = 1/2$, $\\tan = \\sqrt{3}$
- \`90°\`: $\\sin = 1$, $\\cos = 0$, $\\tan = \\text{undefined}$

**Identities**:
1. \`\\sin²(\\theta) + \\cos²(\\theta) = 1\`
2. \`1 + \\tan²(\\theta) = \\sec²(\\theta)\`
3. \`1 + \\cot²(\\theta) = \\csc²(\\theta)\``;
  }

  // General Step-by-Step Explanation
  return `### Step-by-Step Mathematical Explanation

Thank you for your question: **"${prompt}"**

1. **Concept Overview**:
   In geometry and algebra, we break the problem down into given quantities, unknown targets, and relevant formulas.

2. **Core Formulas to Apply**:
   - **Distance**: \`d = \\sqrt{(x_2 - x_1)² + (y_2 - y_1)²}\`
   - **Perimeter of Polygon**: \`P = \\sum_{i=1}^n s_i\`
   - **Shoelace Area of Polygon**: \`A = \\frac{1}{2} |\\sum (x_i y_{i+1} - y_i x_{i+1})|\`
   - **Slope / Angle**: \`m = \\frac{y_2 - y_1}{x_2 - x_1} = \\tan(\\theta)\`

3. **Step-by-Step Solution Strategy**:
   - **Step 1**: Identify your coordinate points or dimensions on the canvas.
   - **Step 2**: Use the Snap-to-Grid feature and Photoshop-style Rulers to align coordinates accurately.
   - **Step 3**: Verify units (e.g. \`cm\`, \`mm\`, or \`px\`).
   - **Step 4**: Substitute the numerical values into the formula and calculate.

*Tip: Ask me to draw any geometric shape (e.g. "create a triangle", "draw circle radius 4", "draw a rectangle") and I will construct it live on the canvas and calculate all side lengths and angles!*`;
}
