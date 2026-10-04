/**
 * canvasActions.js - Pure functions for executing canvas actions.
 * Converts coordinates between student math space (cm, origin at (0,0), X right, Y up)
 * and canvas world pixel space (1 cm = 40 world px, Y down).
 */

import { generateId } from './idGenerator';
import {
  DEFAULT_COLORS,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  getPolygonName
} from './geoEngine';
import {
  calculateTriangleMetrics,
  calculatePolygonMetrics
} from '../utils/mathTutorEngine';

export const CM_TO_PX = 40; // 1 cm = 40 world px

/**
 * Coordinate conversions:
 * Math space: cm, origin (0,0), X right, Y up.
 * Canvas space: world px, origin (0,0), X right, Y down.
 */
export function cmToWorld(xCm, yCm) {
  return {
    x: Math.round(xCm * CM_TO_PX * 100) / 100,
    y: Math.round(-yCm * CM_TO_PX * 100) / 100
  };
}

export function worldToCm(xPx, yPx) {
  return {
    x: Math.round((xPx / CM_TO_PX) * 100) / 100,
    y: Math.round((-yPx / CM_TO_PX) * 100) / 100
  };
}

/**
 * Generate next letter label for points (A, B, C ... Z, A1, B1 ...)
 */
export function getNextPointLabel(objects) {
  const existingLabels = new Set(
    objects
      .filter((o) => o.type === 'point' && o.label)
      .map((o) => o.label)
  );

  let count = 0;
  while (count < 1000) {
    const charCode = 65 + (count % 26);
    const suffix = Math.floor(count / 26);
    const label = String.fromCharCode(charCode) + (suffix > 0 ? suffix : '');
    if (!existingLabels.has(label)) return label;
    count++;
  }
  return 'P';
}

/**
 * Resolves a point argument that can be:
 * - A string label like "A"
 * - An object { x, y } in cm
 * - An object { x, y, label? }
 *
 * Returns { worldPos: { x, y }, cmPos: { x, y }, existingPoint?: object, label?: string } or throws error string.
 */
export function resolvePoint(ptArg, objects) {
  if (ptArg === null || ptArg === undefined) {
    return { error: 'Point argument cannot be null or undefined.' };
  }

  // Label string like "A", "B"
  if (typeof ptArg === 'string') {
    const trimmed = ptArg.trim();
    const found = objects.find(
      (o) => o.type === 'point' && (o.label === trimmed || o.id === trimmed)
    );
    if (!found) {
      return { error: `Point "${trimmed}" not found on canvas.` };
    }
    const cm = worldToCm(found.x, found.y);
    return {
      worldPos: { x: found.x, y: found.y },
      cmPos: cm,
      existingPoint: found,
      label: found.label
    };
  }

  // Coordinate object { x, y, label? } in cm
  if (typeof ptArg === 'object') {
    const x = Number(ptArg.x);
    const y = Number(ptArg.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { error: `Invalid point coordinates: x=${ptArg.x}, y=${ptArg.y}` };
    }

    const world = cmToWorld(x, y);

    // Check if an existing point matches coordinates within 0.05 cm (~2px)
    const existing = objects.find((o) => {
      if (o.type !== 'point') return false;
      const dx = Math.abs(o.x - world.x);
      const dy = Math.abs(o.y - world.y);
      return dx <= 2 && dy <= 2;
    });

    if (existing) {
      const cm = worldToCm(existing.x, existing.y);
      return {
        worldPos: { x: existing.x, y: existing.y },
        cmPos: cm,
        existingPoint: existing,
        label: existing.label || ptArg.label
      };
    }

    return {
      worldPos: world,
      cmPos: { x, y },
      label: ptArg.label
    };
  }

  return { error: `Unsupported point format: ${JSON.stringify(ptArg)}` };
}

/**
 * Compact canvas state representation for AI system prompt and inspection.
 * Coordinates are returned in cm.
 */
export function getCanvasState(objects = [], gridSettings = {}) {
  const capped = objects.slice(0, 50);

  const formatted = capped.map((o) => {
    switch (o.type) {
      case 'point': {
        const cm = worldToCm(o.x, o.y);
        return {
          id: o.id,
          type: 'point',
          label: o.label || null,
          x: cm.x,
          y: cm.y
        };
      }
      case 'line': {
        const p1 = worldToCm(o.x1, o.y1);
        const p2 = worldToCm(o.x2, o.y2);
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        return {
          id: o.id,
          type: 'line',
          from: p1,
          to: p2,
          lengthCm: Math.round(len * 100) / 100
        };
      }
      case 'circle': {
        const center = worldToCm(o.cx, o.cy);
        const radiusCm = Math.round((o.r / CM_TO_PX) * 100) / 100;
        const area = Math.round(Math.PI * radiusCm * radiusCm * 100) / 100;
        const circumference = Math.round(2 * Math.PI * radiusCm * 100) / 100;
        return {
          id: o.id,
          type: 'circle',
          center,
          radiusCm,
          areaCm2: area,
          circumferenceCm: circumference
        };
      }
      case 'triangle': {
        const cmPts = (o.pts || []).map((p) => worldToCm(p.x, p.y));
        const labels = o.labels || ['A', 'B', 'C'];
        const metrics = cmPts.length >= 3 ? calculateTriangleMetrics(cmPts[0], cmPts[1], cmPts[2], labels) : null;
        return {
          id: o.id,
          type: 'triangle',
          vertices: metrics ? metrics.vertices : cmPts,
          sideLengths: metrics?.sideLengths || [],
          angles: metrics?.angles || [],
          areaCm2: metrics?.areaCm2 || 0,
          perimeterCm: metrics?.perimeterCm || 0
        };
      }
      case 'rectangle': {
        const p = worldToCm(o.x, o.y);
        const wCm = Math.round((Math.abs(o.w) / CM_TO_PX) * 100) / 100;
        const hCm = Math.round((Math.abs(o.h) / CM_TO_PX) * 100) / 100;
        return {
          id: o.id,
          type: 'rectangle',
          corner: p,
          widthCm: wCm,
          heightCm: hCm,
          areaCm2: Math.round(wCm * hCm * 100) / 100,
          perimeterCm: Math.round(2 * (wCm + hCm) * 100) / 100
        };
      }
      case 'polygon': {
        const cmPts = (o.pts || []).map((p) => worldToCm(p.x, p.y));
        const areaPx = calculatePolygonArea(o.pts || []);
        const perimPx = calculatePolygonPerimeter(o.pts || []);
        const areaCm2 = Math.round((areaPx / (CM_TO_PX * CM_TO_PX)) * 100) / 100;
        const perimCm = Math.round((perimPx / CM_TO_PX) * 100) / 100;
        return {
          id: o.id,
          type: 'polygon',
          name: getPolygonName(o.pts?.length || 0),
          vertices: cmPts,
          areaCm2,
          perimeterCm: perimCm
        };
      }
      case 'angle': {
        const v = worldToCm(o.vx, o.vy);
        const p1 = worldToCm(o.r1x, o.r1y);
        const p2 = worldToCm(o.r2x, o.r2y);
        const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
        const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
        let diffDeg = Math.round(Math.abs(((a2 - a1) * 180) / Math.PI));
        if (diffDeg > 180) diffDeg = 360 - diffDeg;
        return {
          id: o.id,
          type: 'angle',
          vertex: v,
          arm1: p1,
          arm2: p2,
          degrees: diffDeg
        };
      }
      case 'rightangle': {
        const v = worldToCm(o.vx, o.vy);
        return {
          id: o.id,
          type: 'rightangle',
          vertex: v,
          degrees: 90
        };
      }
      case 'ruler': {
        const p1 = worldToCm(o.x1, o.y1);
        const p2 = worldToCm(o.x2, o.y2);
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        return {
          id: o.id,
          type: 'ruler',
          from: p1,
          to: p2,
          measuredLengthCm: Math.round(len * 100) / 100
        };
      }
      case 'protractor': {
        const p = worldToCm(o.x, o.y);
        return {
          id: o.id,
          type: 'protractor',
          position: p
        };
      }
      default:
        return { id: o.id, type: o.type };
    }
  });

  return {
    unit: gridSettings.unit || 'cm',
    totalObjects: objects.length,
    objects: formatted
  };
}

/**
 * Pure function: apply a single action.
 * Returns { objects, result, error, isConfirmationNeeded, pendingAction }
 */
export function applyAction(objects, action, context = {}) {
  try {
    const actType = action.type || action.name || action.action;
    const params = action.params || action.arguments || action;

    if (!actType) {
      return { objects, error: 'Action type is required.' };
    }

    // Capacity check (max 200 objects)
    const addingActions = [
      'add_point',
      'add_line',
      'add_circle',
      'add_triangle',
      'add_rectangle',
      'add_polygon',
      'add_regular_polygon',
      'add_angle',
      'add_right_angle',
      'add_perpendicular',
      'add_ruler',
      'add_protractor'
    ];
    if (addingActions.includes(actType) && objects.length >= 200) {
      return { objects, error: 'Maximum canvas capacity (200 objects) reached.' };
    }

    const source = params.source || action.source || 'ai';

    switch (actType) {
      // 1. ADD POINT
      case 'add_point': {
        const x = Number(params.x);
        const y = Number(params.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          return { objects, error: `Invalid coordinates: x=${params.x}, y=${params.y}` };
        }

        const world = cmToWorld(x, y);

        // Check if point already exists at this position
        const existing = objects.find((o) => {
          if (o.type !== 'point') return false;
          return Math.abs(o.x - world.x) <= 2 && Math.abs(o.y - world.y) <= 2;
        });

        if (existing) {
          if (params.label && !existing.label) {
            const updated = objects.map((o) =>
              o.id === existing.id ? { ...o, label: params.label } : o
            );
            return {
              objects: updated,
              result: { id: existing.id, label: params.label, x, y, reused: true }
            };
          }
          return {
            objects,
            result: { id: existing.id, label: existing.label, x, y, reused: true }
          };
        }

        const label = params.label || getNextPointLabel(objects);
        const newPoint = {
          id: generateId('pt'),
          type: 'point',
          x: world.x,
          y: world.y,
          color: params.color || DEFAULT_COLORS.point,
          label,
          labelOffset: { x: 8, y: -8 },
          source
        };

        return {
          objects: [...objects, newPoint],
          result: { id: newPoint.id, label, x, y }
        };
      }

      // 2. ADD LINE
      case 'add_line': {
        const fromRes = resolvePoint(params.from, objects);
        if (fromRes.error) return { objects, error: `Invalid "from": ${fromRes.error}` };

        const toRes = resolvePoint(params.to, objects);
        if (toRes.error) return { objects, error: `Invalid "to": ${toRes.error}` };

        let currentObjects = [...objects];

        // Ensure endpoint points exist on canvas if needed
        let p1Id = fromRes.existingPoint?.id;
        if (!fromRes.existingPoint) {
          const ptLabel = fromRes.label || getNextPointLabel(currentObjects);
          const pt1 = {
            id: generateId('pt'),
            type: 'point',
            x: fromRes.worldPos.x,
            y: fromRes.worldPos.y,
            color: DEFAULT_COLORS.point,
            label: ptLabel,
            labelOffset: { x: 8, y: -8 },
            source
          };
          currentObjects.push(pt1);
          p1Id = pt1.id;
        }

        let p2Id = toRes.existingPoint?.id;
        if (!toRes.existingPoint) {
          const ptLabel = toRes.label || getNextPointLabel(currentObjects);
          const pt2 = {
            id: generateId('pt'),
            type: 'point',
            x: toRes.worldPos.x,
            y: toRes.worldPos.y,
            color: DEFAULT_COLORS.point,
            label: ptLabel,
            labelOffset: { x: 8, y: -8 },
            source
          };
          currentObjects.push(pt2);
          p2Id = pt2.id;
        }

        const newLine = {
          id: generateId('line'),
          type: 'line',
          x1: fromRes.worldPos.x,
          y1: fromRes.worldPos.y,
          x2: toRes.worldPos.x,
          y2: toRes.worldPos.y,
          color: params.color || DEFAULT_COLORS.line,
          width: params.width || 2,
          dash: params.dash || [],
          source
        };

        const lenCm = Math.round(
          Math.hypot(toRes.cmPos.x - fromRes.cmPos.x, toRes.cmPos.y - fromRes.cmPos.y) * 100
        ) / 100;
        const angleDeg = Math.round(
          (Math.atan2(toRes.cmPos.y - fromRes.cmPos.y, toRes.cmPos.x - fromRes.cmPos.x) * 180 / Math.PI) * 10
        ) / 10;
        const midCm = {
          x: Math.round(((fromRes.cmPos.x + toRes.cmPos.x) / 2) * 100) / 100,
          y: Math.round(((fromRes.cmPos.y + toRes.cmPos.y) / 2) * 100) / 100
        };

        return {
          objects: [...currentObjects, newLine],
          result: {
            id: newLine.id,
            from: fromRes.cmPos,
            to: toRes.cmPos,
            lengthCm: lenCm,
            angleDeg,
            midpointCm: midCm
          }
        };
      }

      // 3. ADD CIRCLE
      case 'add_circle': {
        const centerRes = resolvePoint(params.center, objects);
        if (centerRes.error) return { objects, error: `Invalid "center": ${centerRes.error}` };

        const radiusCm = Number(params.radius);
        if (!Number.isFinite(radiusCm) || radiusCm <= 0) {
          return { objects, error: `Radius must be a positive number: got ${params.radius}` };
        }

        let currentObjects = [...objects];
        if (!centerRes.existingPoint) {
          const pt = {
            id: generateId('pt'),
            type: 'point',
            x: centerRes.worldPos.x,
            y: centerRes.worldPos.y,
            color: DEFAULT_COLORS.point,
            label: centerRes.label || getNextPointLabel(currentObjects),
            labelOffset: { x: 8, y: -8 },
            source
          };
          currentObjects.push(pt);
        }

        const rPx = radiusCm * CM_TO_PX;
        const newCircle = {
          id: generateId('circle'),
          type: 'circle',
          cx: centerRes.worldPos.x,
          cy: centerRes.worldPos.y,
          r: rPx,
          color: params.color || DEFAULT_COLORS.circle,
          width: params.width || 2,
          source
        };

        const area = Math.round(Math.PI * radiusCm * radiusCm * 100) / 100;
        return {
          objects: [...currentObjects, newCircle],
          result: { id: newCircle.id, center: centerRes.cmPos, radiusCm, areaCm2: area }
        };
      }

      // 4. ADD TRIANGLE
      case 'add_triangle': {
        const p1Res = resolvePoint(params.p1, objects);
        if (p1Res.error) return { objects, error: `Invalid p1: ${p1Res.error}` };
        const p2Res = resolvePoint(params.p2, objects);
        if (p2Res.error) return { objects, error: `Invalid p2: ${p2Res.error}` };
        const p3Res = resolvePoint(params.p3, objects);
        if (p3Res.error) return { objects, error: `Invalid p3: ${p3Res.error}` };

        let currentObjects = [...objects];
        const resPts = [p1Res, p2Res, p3Res];
        const labels = params.labels || [];

        // Ensure vertex point objects exist and have labels
        resPts.forEach((r, idx) => {
          if (!r.existingPoint) {
            const lbl = labels[idx] || r.label || getNextPointLabel(currentObjects);
            const pt = {
              id: generateId('pt'),
              type: 'point',
              x: r.worldPos.x,
              y: r.worldPos.y,
              color: DEFAULT_COLORS.point,
              label: lbl,
              labelOffset: { x: 8, y: -8 },
              source
            };
            currentObjects.push(pt);
          } else if (labels[idx] && !r.existingPoint.label) {
            currentObjects = currentObjects.map((o) =>
              o.id === r.existingPoint.id ? { ...o, label: labels[idx] } : o
            );
          }
        });

        const worldPts = resPts.map((r) => r.worldPos);
        const resolvedLabels = resPts.map((r, idx) => labels[idx] || r.label || String.fromCharCode(65 + idx));
        const newTri = {
          id: generateId('tri'),
          type: 'triangle',
          pts: worldPts,
          labels: resolvedLabels,
          fillColor: params.fillColor || 'rgba(255, 123, 53, 0.12)',
          strokeColor: params.strokeColor || DEFAULT_COLORS.triangle,
          source
        };

        const metrics = calculateTriangleMetrics(resPts[0].cmPos, resPts[1].cmPos, resPts[2].cmPos, resolvedLabels);

        return {
          objects: [...currentObjects, newTri],
          result: {
            id: newTri.id,
            vertices: metrics.vertices,
            sideLengths: metrics.sideLengths,
            angles: metrics.angles,
            areaCm2: metrics.areaCm2,
            perimeterCm: metrics.perimeterCm,
            classification: metrics.classification
          }
        };
      }

      // 5. ADD RECTANGLE
      case 'add_rectangle': {
        const x = Number(params.x);
        const y = Number(params.y);
        const w = Number(params.w ?? params.width);
        const h = Number(params.h ?? params.height);

        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) {
          return { objects, error: `Invalid rectangle coordinates or dimensions: x=${x}, y=${y}, w=${w}, h=${h}` };
        }
        if (Math.abs(w) <= 0.1 || Math.abs(h) <= 0.1) {
          return { objects, error: 'Rectangle width and height must be greater than 0.' };
        }

        const world = cmToWorld(x, y);
        const wPx = w * CM_TO_PX;
        const hPx = -h * CM_TO_PX; // Y is inverted

        const newRect = {
          id: generateId('rect'),
          type: 'rectangle',
          x: world.x,
          y: world.y,
          w: wPx,
          h: hPx,
          fillColor: params.fillColor || 'rgba(167, 139, 250, 0.12)',
          strokeColor: params.strokeColor || DEFAULT_COLORS.rectangle,
          source
        };

        const areaCm2 = Math.round(Math.abs(w * h) * 100) / 100;
        const perimCm = Math.round(2 * (Math.abs(w) + Math.abs(h)) * 100) / 100;
        const diagCm = Math.round(Math.hypot(w, h) * 100) / 100;

        return {
          objects: [...objects, newRect],
          result: {
            id: newRect.id,
            corner: { x, y },
            widthCm: Math.abs(w),
            heightCm: Math.abs(h),
            diagonalCm: diagCm,
            sideLengths: [
              { from: 'Top/Bottom', lengthCm: Math.abs(w) },
              { from: 'Left/Right', lengthCm: Math.abs(h) }
            ],
            angles: [{ vertex: 'All 4 Corners', degrees: 90.0 }],
            areaCm2,
            perimeterCm: perimCm
          }
        };
      }

      // 6. ADD POLYGON
      case 'add_polygon': {
        const rawPoints = params.points || params.pts || [];
        if (!Array.isArray(rawPoints) || rawPoints.length < 3) {
          return { objects, error: 'A polygon requires at least 3 points.' };
        }

        let currentObjects = [...objects];
        const resolved = [];

        for (let i = 0; i < rawPoints.length; i++) {
          const res = resolvePoint(rawPoints[i], currentObjects);
          if (res.error) {
            return { objects, error: `Invalid polygon point at index ${i}: ${res.error}` };
          }
          resolved.push(res);
          if (!res.existingPoint) {
            const pt = {
              id: generateId('pt'),
              type: 'point',
              x: res.worldPos.x,
              y: res.worldPos.y,
              color: DEFAULT_COLORS.point,
              label: res.label || getNextPointLabel(currentObjects),
              labelOffset: { x: 8, y: -8 },
              source
            };
            currentObjects.push(pt);
          }
        }

        const worldPts = resolved.map((r) => r.worldPos);
        const resolvedLabels = resolved.map((r, idx) => r.label || String.fromCharCode(65 + (idx % 26)));
        const newPoly = {
          id: generateId('poly'),
          type: 'polygon',
          pts: worldPts,
          labels: resolvedLabels,
          fillColor: params.fillColor || 'rgba(56, 189, 248, 0.14)',
          strokeColor: params.strokeColor || DEFAULT_COLORS.polygon,
          source
        };

        const metrics = calculatePolygonMetrics(resolved.map((r) => r.cmPos), resolvedLabels);
        const areaPx = calculatePolygonArea(worldPts);
        const perimPx = calculatePolygonPerimeter(worldPts);
        const areaCm2 = Math.round((areaPx / (CM_TO_PX * CM_TO_PX)) * 100) / 100;
        const perimCm = Math.round((perimPx / CM_TO_PX) * 100) / 100;

        return {
          objects: [...currentObjects, newPoly],
          result: {
            id: newPoly.id,
            name: getPolygonName(worldPts.length),
            sides: worldPts.length,
            sideLengths: metrics?.sideLengths || [],
            angles: metrics?.angles || [],
            areaCm2: metrics?.areaCm2 || areaCm2,
            perimeterCm: metrics?.perimeterCm || perimCm
          }
        };
      }

      // 7. ADD REGULAR POLYGON
      case 'add_regular_polygon': {
        const centerRes = resolvePoint(params.center || { x: 0, y: 0 }, objects);
        if (centerRes.error) return { objects, error: `Invalid center: ${centerRes.error}` };

        const radiusCm = Number(params.radius);
        const sides = Number(params.sides);

        if (!Number.isFinite(radiusCm) || radiusCm <= 0) {
          return { objects, error: 'Radius must be a positive number.' };
        }
        if (!Number.isInteger(sides) || sides < 3) {
          return { objects, error: 'Sides must be an integer >= 3.' };
        }
        if (sides > 64) {
          return { objects, error: 'Regular polygons are limited to 64 sides.' };
        }
        if (objects.length + sides + 1 > 200) {
          return { objects, error: 'This polygon would exceed the 200-object canvas capacity.' };
        }

        let currentObjects = [...objects];

        // Compute vertices in math space (cm): start pointing upward at 90 deg
        const cmVertices = [];
        const worldPts = [];

        for (let i = 0; i < sides; i++) {
          const angle = Math.PI / 2 + (2 * Math.PI * i) / sides;
          const vx = Math.round((centerRes.cmPos.x + radiusCm * Math.cos(angle)) * 1000) / 1000;
          const vy = Math.round((centerRes.cmPos.y + radiusCm * Math.sin(angle)) * 1000) / 1000;
          cmVertices.push({ x: vx, y: vy });

          const world = cmToWorld(vx, vy);
          worldPts.push(world);

          // Add point label for each vertex
          const lbl = getNextPointLabel(currentObjects);
          const pt = {
            id: generateId('pt'),
            type: 'point',
            x: world.x,
            y: world.y,
            color: DEFAULT_COLORS.point,
            label: lbl,
            labelOffset: { x: 8, y: -8 },
            source
          };
          currentObjects.push(pt);
        }

        const newPoly = {
          id: generateId('poly'),
          type: 'polygon',
          pts: worldPts,
          fillColor: params.fillColor || 'rgba(56, 189, 248, 0.14)',
          strokeColor: params.strokeColor || DEFAULT_COLORS.polygon,
          source
        };

        const areaPx = calculatePolygonArea(worldPts);
        const perimPx = calculatePolygonPerimeter(worldPts);
        const areaCm2 = Math.round((areaPx / (CM_TO_PX * CM_TO_PX)) * 100) / 100;
        const perimCm = Math.round((perimPx / CM_TO_PX) * 100) / 100;
        const sideLen = Math.round((2 * radiusCm * Math.sin(Math.PI / sides)) * 100) / 100;
        const interiorAngle = Math.round((((sides - 2) * 180) / sides) * 10) / 10;

        return {
          objects: [...currentObjects, newPoly],
          result: {
            id: newPoly.id,
            name: getPolygonName(sides),
            sides,
            radiusCm,
            sideLengthCm: sideLen,
            interiorAngleDeg: interiorAngle,
            areaCm2,
            perimeterCm: perimCm,
            vertices: cmVertices
          }
        };
      }

      // 8. ADD ANGLE ARC
      case 'add_angle': {
        const vRes = resolvePoint(params.vertex, objects);
        if (vRes.error) return { objects, error: `Invalid vertex: ${vRes.error}` };
        const p1Res = resolvePoint(params.p1, objects);
        if (p1Res.error) return { objects, error: `Invalid p1: ${p1Res.error}` };
        const p2Res = resolvePoint(params.p2, objects);
        if (p2Res.error) return { objects, error: `Invalid p2: ${p2Res.error}` };

        const newAngle = {
          id: generateId('angle'),
          type: 'angle',
          vx: vRes.worldPos.x,
          vy: vRes.worldPos.y,
          r1x: p1Res.worldPos.x,
          r1y: p1Res.worldPos.y,
          r2x: p2Res.worldPos.x,
          r2y: p2Res.worldPos.y,
          color: params.color || DEFAULT_COLORS.angle,
          source
        };

        const a1 = Math.atan2(p1Res.cmPos.y - vRes.cmPos.y, p1Res.cmPos.x - vRes.cmPos.x);
        const a2 = Math.atan2(p2Res.cmPos.y - vRes.cmPos.y, p2Res.cmPos.x - vRes.cmPos.x);
        let diffDeg = Math.round(Math.abs(((a2 - a1) * 180) / Math.PI));
        if (diffDeg > 180) diffDeg = 360 - diffDeg;

        return {
          objects: [...objects, newAngle],
          result: { id: newAngle.id, degrees: diffDeg }
        };
      }

      // 9. ADD RIGHT ANGLE SYMBOL
      case 'add_right_angle': {
        const vRes = resolvePoint(params.vertex, objects);
        if (vRes.error) return { objects, error: `Invalid vertex: ${vRes.error}` };
        const p1Res = resolvePoint(params.p1, objects);
        if (p1Res.error) return { objects, error: `Invalid p1: ${p1Res.error}` };
        const p2Res = resolvePoint(params.p2, objects);
        if (p2Res.error) return { objects, error: `Invalid p2: ${p2Res.error}` };

        const dx1 = p1Res.worldPos.x - vRes.worldPos.x;
        const dy1 = p1Res.worldPos.y - vRes.worldPos.y;
        const len1 = Math.hypot(dx1, dy1) || 1;

        const dx2 = p2Res.worldPos.x - vRes.worldPos.x;
        const dy2 = p2Res.worldPos.y - vRes.worldPos.y;
        const len2 = Math.hypot(dx2, dy2) || 1;

        const newRightAngle = {
          id: generateId('ra'),
          type: 'rightangle',
          vx: vRes.worldPos.x,
          vy: vRes.worldPos.y,
          dir1: { x: dx1 / len1, y: dy1 / len1 },
          dir2: { x: dx2 / len2, y: dy2 / len2 },
          color: params.color || DEFAULT_COLORS.helper,
          source
        };

        return {
          objects: [...objects, newRightAngle],
          result: { id: newRightAngle.id, vertex: vRes.cmPos, degrees: 90 }
        };
      }

      // 10. ADD PERPENDICULAR LINE
      case 'add_perpendicular': {
        // Can identify target line by lineId, or from/to
        let lineObj = null;
        if (params.lineId) {
          lineObj = objects.find((o) => o.id === params.lineId && o.type === 'line');
        } else if (params.lineRef) {
          lineObj = objects.find(
            (o) =>
              (o.id === params.lineRef || o.label === params.lineRef) &&
              o.type === 'line'
          );
        }

        let p1World, p2World;
        if (lineObj) {
          p1World = { x: lineObj.x1, y: lineObj.y1 };
          p2World = { x: lineObj.x2, y: lineObj.y2 };
        } else if (params.from && params.to) {
          const fRes = resolvePoint(params.from, objects);
          const tRes = resolvePoint(params.to, objects);
          if (fRes.error || tRes.error) {
            return { objects, error: fRes.error || tRes.error };
          }
          p1World = fRes.worldPos;
          p2World = tRes.worldPos;
        } else {
          // If no line specified, search for the most recent line
          const lines = objects.filter((o) => o.type === 'line');
          if (lines.length > 0) {
            lineObj = lines[lines.length - 1];
            p1World = { x: lineObj.x1, y: lineObj.y1 };
            p2World = { x: lineObj.x2, y: lineObj.y2 };
          } else {
            return { objects, error: 'No line found to construct perpendicular to.' };
          }
        }

        const dx = p2World.x - p1World.x;
        const dy = p2World.y - p1World.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        // Origin of perpendicular: throughPoint if provided, else line midpoint
        let mx = (p1World.x + p2World.x) / 2;
        let my = (p1World.y + p2World.y) / 2;

        if (params.throughPoint) {
          const tpRes = resolvePoint(params.throughPoint, objects);
          if (!tpRes.error) {
            // Project throughPoint onto the line to find foot of perpendicular
            const vx = tpRes.worldPos.x - p1World.x;
            const vy = tpRes.worldPos.y - p1World.y;
            const u = (vx * dx + vy * dy) / (len * len);
            mx = p1World.x + u * dx;
            my = p1World.y + u * dy;
          }
        }

        const perpLengthPx = (params.lengthCm ? params.lengthCm * CM_TO_PX : 120);

        const perpLine = {
          id: generateId('perp'),
          type: 'line',
          x1: mx - nx * (perpLengthPx / 2),
          y1: my - ny * (perpLengthPx / 2),
          x2: mx + nx * (perpLengthPx / 2),
          y2: my + ny * (perpLengthPx / 2),
          color: params.color || DEFAULT_COLORS.helper,
          dash: [4, 4],
          source
        };

        const raSymbol = {
          id: generateId('ra'),
          type: 'rightangle',
          vx: mx,
          vy: my,
          dir1: { x: dx / len, y: dy / len },
          dir2: { x: nx, y: ny },
          color: params.color || DEFAULT_COLORS.helper,
          source
        };

        const footCm = worldToCm(mx, my);

        return {
          objects: [...objects, perpLine, raSymbol],
          result: { id: perpLine.id, footOfPerpendicular: footCm }
        };
      }

      // 11. ADD RULER / MEASUREMENT
      case 'add_ruler': {
        const fromRes = resolvePoint(params.from, objects);
        if (fromRes.error) return { objects, error: `Invalid "from": ${fromRes.error}` };
        const toRes = resolvePoint(params.to, objects);
        if (toRes.error) return { objects, error: `Invalid "to": ${toRes.error}` };

        const newRuler = {
          id: generateId('ruler'),
          type: 'ruler',
          x1: fromRes.worldPos.x,
          y1: fromRes.worldPos.y,
          x2: toRes.worldPos.x,
          y2: toRes.worldPos.y,
          color: params.color || DEFAULT_COLORS.ruler,
          source
        };

        const distCm = Math.round(
          Math.hypot(toRes.cmPos.x - fromRes.cmPos.x, toRes.cmPos.y - fromRes.cmPos.y) * 100
        ) / 100;

        return {
          objects: [...objects, newRuler],
          result: { id: newRuler.id, from: fromRes.cmPos, to: toRes.cmPos, distanceCm: distCm }
        };
      }

      // 12. ADD PROTRACTOR
      case 'add_protractor': {
        let wx, wy;
        if (params.position) {
          const pRes = resolvePoint(params.position, objects);
          if (pRes.error) return { objects, error: pRes.error };
          wx = pRes.worldPos.x;
          wy = pRes.worldPos.y;
        } else {
          const x = Number(params.x ?? 0);
          const y = Number(params.y ?? 0);
          const w = cmToWorld(x, y);
          wx = w.x;
          wy = w.y;
        }

        const newProt = {
          id: generateId('prot'),
          type: 'protractor',
          x: wx,
          y: wy,
          source
        };

        return {
          objects: [...objects, newProt],
          result: { id: newProt.id, position: worldToCm(wx, wy) }
        };
      }

      // 13. UPDATE OBJECT
      case 'update_object': {
        const id = params.id;
        const target = objects.find((o) => o.id === id);
        if (!target) return { objects, error: `Object with id "${id}" not found.` };
        if (!params.props || typeof params.props !== 'object' || Array.isArray(params.props)) {
          return { objects, error: 'Object properties must be provided as an object.' };
        }

        const editableKeys = new Set([
          'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'radius',
          'vx', 'vy', 'r1x', 'r1y', 'r2x', 'r2y', 'color', 'strokeColor',
          'fillColor', 'width', 'label', 'labelOffset', 'visible'
        ]);
        const numericKeys = new Set([
          'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'radius',
          'vx', 'vy', 'r1x', 'r1y', 'r2x', 'r2y', 'width'
        ]);
        for (const [key, value] of Object.entries(params.props)) {
          if (!editableKeys.has(key)) {
            return { objects, error: `Property "${key}" cannot be updated.` };
          }
          if (numericKeys.has(key) && (!Number.isFinite(value) || Math.abs(value) > 1_000_000)) {
            return { objects, error: `Property "${key}" must be a finite number within the canvas bounds.` };
          }
          if (key === 'width' && value <= 0) {
            return { objects, error: 'Line width must be a positive number.' };
          }
          if (['color', 'strokeColor', 'fillColor', 'label'].includes(key) &&
              (typeof value !== 'string' || value.length > 100)) {
            return { objects, error: `Property "${key}" must be a string of at most 100 characters.` };
          }
          if (key === 'visible' && typeof value !== 'boolean') {
            return { objects, error: 'Property "visible" must be a boolean.' };
          }
          if (key === 'labelOffset' && (
            !value || typeof value !== 'object' ||
            !Number.isFinite(value.x) || !Number.isFinite(value.y)
          )) {
            return { objects, error: 'Label offset must contain finite x and y values.' };
          }
        }
        if (Object.keys(params.props).length === 0) {
          return { objects, error: 'At least one editable property is required.' };
        }

        const updated = objects.map((o) => {
          if (o.id !== id) return o;
          return { ...o, ...params.props };
        });

        return {
          objects: updated,
          result: { id, updated: true }
        };
      }

      // 14. DELETE OBJECT (Needs student confirmation when called by AI)
      case 'delete_object': {
        const id = params.id;
        const target = objects.find((o) => o.id === id);
        if (!target) return { objects, error: `Object with id "${id}" not found.` };

        if (context.requestConfirmation && !params.confirmed) {
          context.requestConfirmation({
            type: 'delete_object',
            description: `Delete ${target.type} (${target.label || id})`,
            id
          });
          return {
            objects,
            result: { id, pendingConfirmation: true },
            isConfirmationNeeded: true
          };
        }

        return {
          objects: objects.filter((o) => o.id !== id),
          result: { id, deleted: true }
        };
      }

      // 15. CLEAR CANVAS (Needs student confirmation when called by AI)
      case 'clear_canvas': {
        if (context.requestConfirmation && !params.confirmed) {
          context.requestConfirmation({
            type: 'clear_canvas',
            description: 'Clear all objects from the canvas'
          });
          return {
            objects,
            result: { pendingConfirmation: true },
            isConfirmationNeeded: true
          };
        }

        return {
          objects: [],
          result: { cleared: true }
        };
      }

      // 16. UNDO
      case 'undo': {
        if (context.undo) {
          context.undo();
          return { objects, result: { undone: true } };
        }
        return { objects, error: 'Undo context function not available.' };
      }

      // 17. SELECT OBJECT
      case 'select_object': {
        const id = params.id;
        if (context.selectObject) {
          context.selectObject(id);
          return { objects, result: { selectedId: id } };
        }
        return { objects, result: { selectedId: id } };
      }

      // 18. SET GRID SETTINGS
      case 'set_grid': {
        if (context.setGridSettings) {
          const allowed = ['showGrid', 'showAxes', 'snapToGrid', 'showRulers', 'gridStyle', 'gridSize', 'unit'];
          const settings = {};
          for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
              settings[key] = params[key];
            }
          }
          if (Object.keys(settings).length === 0) {
            return { objects, error: 'At least one valid grid setting is required.' };
          }
          for (const key of ['showGrid', 'showAxes', 'snapToGrid', 'showRulers']) {
            if (Object.prototype.hasOwnProperty.call(settings, key) && typeof settings[key] !== 'boolean') {
              return { objects, error: `${key} must be a boolean.` };
            }
          }
          if (Object.prototype.hasOwnProperty.call(settings, 'gridStyle') &&
              !['subdivided', 'lines', 'dots', 'isometric'].includes(settings.gridStyle)) {
            return { objects, error: 'Grid style is not supported.' };
          }
          if (Object.prototype.hasOwnProperty.call(settings, 'gridSize') &&
              (!Number.isFinite(settings.gridSize) || settings.gridSize < 10 || settings.gridSize > 200)) {
            return { objects, error: 'Grid size must be between 10 and 200 world units.' };
          }
          if (Object.prototype.hasOwnProperty.call(settings, 'unit') &&
              !['cm', 'px', 'mm', 'in'].includes(settings.unit)) {
            return { objects, error: 'Measurement unit is not supported.' };
          }
          context.setGridSettings(settings);
          return { objects, result: { gridUpdated: true } };
        }
        return { objects, error: 'setGridSettings not available in context.' };
      }

      // 19. SET VIEW (fit | zoom | pan | reset)
      case 'set_view': {
        if (!context.setTransform) {
          return { objects, error: 'setTransform not available in context.' };
        }

        const viewType = params.type || 'fit';
        if (!['fit', 'zoom', 'pan', 'reset'].includes(viewType)) {
          return { objects, error: `Unsupported view type: "${viewType}".` };
        }
        const viewport = context.getCanvasViewport?.();
        const viewportWidth = viewport?.width || (typeof window !== 'undefined' ? window.innerWidth : 800);
        const viewportHeight = viewport?.height || (typeof window !== 'undefined' ? window.innerHeight : 600);

        if (viewType === 'reset') {
          context.setTransform((prev) => ({
            ...prev,
            scale: 1.2,
            offsetX: viewportWidth / 2,
            offsetY: viewportHeight / 2
          }));
          return { objects, result: { view: 'reset' } };
        }

        if (viewType === 'zoom') {
          if (!Number.isFinite(params.scale) || params.scale <= 0) {
            return { objects, error: 'Zoom scale must be a positive finite number.' };
          }
          const scale = Math.max(0.15, Math.min(params.scale, 10));
          context.setTransform((prev) => ({ ...prev, scale }));
          return { objects, result: { view: 'zoom', scale } };
        }

        if (viewType === 'pan') {
          if (!Number.isFinite(params.offsetX) || !Number.isFinite(params.offsetY) ||
              Math.abs(params.offsetX) > 1_000_000 || Math.abs(params.offsetY) > 1_000_000) {
            return { objects, error: 'Pan offsets must be finite values within the canvas bounds.' };
          }
          context.setTransform((prev) => ({
            ...prev,
            offsetX: params.offsetX,
            offsetY: params.offsetY
          }));
          return { objects, result: { view: 'pan' } };
        }

        if (viewType === 'fit') {
          if (objects.length === 0) {
            return { objects, result: { view: 'fit', empty: true } };
          }

          // Calculate bounding box of all objects in world coordinates
          let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;

          objects.forEach((o) => {
            if (o.x !== undefined && o.y !== undefined) {
              minX = Math.min(minX, o.x);
              maxX = Math.max(maxX, o.x);
              minY = Math.min(minY, o.y);
              maxY = Math.max(maxY, o.y);
            }
            if (o.x1 !== undefined) {
              minX = Math.min(minX, o.x1, o.x2);
              maxX = Math.max(maxX, o.x1, o.x2);
              minY = Math.min(minY, o.y1, o.y2);
              maxY = Math.max(maxY, o.y1, o.y2);
            }
            if (o.cx !== undefined) {
              minX = Math.min(minX, o.cx - o.r);
              maxX = Math.max(maxX, o.cx + o.r);
              minY = Math.min(minY, o.cy - o.r);
              maxY = Math.max(maxY, o.cy + o.r);
            }
            if (o.pts) {
              o.pts.forEach((pt) => {
                minX = Math.min(minX, pt.x);
                maxX = Math.max(maxX, pt.x);
                minY = Math.min(minY, pt.y);
                maxY = Math.max(maxY, pt.y);
              });
            }
          });

          if (Number.isFinite(minX) && Number.isFinite(maxX)) {
            const w = maxX - minX || 200;
            const h = maxY - minY || 200;
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;

            const viewportW = viewportWidth;
            const viewportH = viewportHeight;

            const scaleX = (viewportW * 0.75) / w;
            const scaleY = (viewportH * 0.75) / h;
            const targetScale = Math.max(0.5, Math.min(scaleX, scaleY, 2.5));

            context.setTransform({
              scale: targetScale,
              offsetX: viewportW / 2 - cx * targetScale,
              offsetY: viewportH / 2 - cy * targetScale
            });
            return { objects, result: { view: 'fit', scale: targetScale } };
          }
        }

        return { objects, result: { view: viewType } };
      }

      // 20. GET CANVAS STATE
      case 'get_canvas_state': {
        const state = getCanvasState(objects, context.gridSettings || {});
        return { objects, result: state };
      }

      default:
        return { objects, error: `Unknown canvas action: "${actType}"` };
    }
  } catch (err) {
    return { objects, error: `Action failed: ${err.message}` };
  }
}
