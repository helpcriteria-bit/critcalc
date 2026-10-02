import { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from './idGenerator';
import { getNextPointLabel } from './canvasActions';
import {
  drawPoint,
  drawLine,
  drawCircle,
  drawTriangle,
  drawRectangle,
  drawPolygon,
  drawRulerMeasure,
  pointInPolygon,
  drawAngle,
  drawRightAngle,
  drawLabel,
  drawProtractor,
  DEFAULT_COLORS,
  calculateLineLineIntersection,
  calculateCircleThreePoints,
  calculatePerpendicularLine,
  calculateParallelLine,
  calculatePerpendicularBisector,
  calculateAngleBisector,
  calculateCircleTangent,
  calculateRegularPolygonVertices,
  solveDependencies,
  drawSnapIndicator
} from './geoEngine';
import { CANVAS_SHORTCUTS } from './toolShortcuts';

export function useCanvas() {
  const canvasRef = useRef(null);
  const {
    geoObjects,
    setGeoObjects,
    activeTool,
    setActiveTool,
    gridSettings,
    transform,
    setTransform,
    selectedId,
    setSelectedId,
    selectedIds = [],
    setSelectedIds,
    pushHistory,
    undo: appUndo,
    redo: appRedo,
    clearCanvas: appClearCanvas
  } = useApp();

  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Selected & Hovered objects
  const [hoveredId, setHoveredId] = useState(null);

  // Marquee selection box state
  const [selectionBox, setSelectionBox] = useState(null);
  const selectionBoxRef = useRef(null);

  // Keyboard shortcuts modal toggle
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Panning interaction state
  const [isPanning, setIsPanning] = useState(false);

  // Status & Tooltip state
  const [cursorWorldPos, setCursorWorldPos] = useState({ x: 0, y: 0 });
  const [cursorScreenPos, setCursorScreenPos] = useState({ x: 0, y: 0 });
  const [floatingTooltip, setFloatingTooltip] = useState(null);
  const [snapInfo, setSnapInfo] = useState(null);

  // Interactive Tool state (in progress construction)
  const [draftState, setDraftState] = useState(null);

  const undo = useCallback(() => {
    appUndo();
    if (setSelectedIds) setSelectedIds([]);
    else setSelectedId(null);
    setDraftState(null);
  }, [appUndo, setSelectedId, setSelectedIds]);

  const redo = useCallback(() => {
    if (appRedo) appRedo();
    if (setSelectedIds) setSelectedIds([]);
    else setSelectedId(null);
    setDraftState(null);
  }, [appRedo, setSelectedId, setSelectedIds]);

  const clearCanvas = useCallback(() => {
    appClearCanvas();
    if (setSelectedIds) setSelectedIds([]);
    else setSelectedId(null);
    setDraftState(null);
  }, [appClearCanvas, setSelectedId, setSelectedIds]);

  // Coordinate Transformers
  const toScreen = useCallback((wx, wy) => {
    const { offsetX, offsetY, scale } = transformRef.current;
    return {
      x: wx * scale + offsetX,
      y: wy * scale + offsetY
    };
  }, []);

  const toWorld = useCallback((sx, sy) => {
    const { offsetX, offsetY, scale } = transformRef.current;
    return {
      x: (sx - offsetX) / scale,
      y: (sy - offsetY) / scale
    };
  }, []);

  // Smart Snapping Resolver
  const getSnapTarget = useCallback((rawWorld, baseDraftPt = null) => {
    const { scale } = transformRef.current;
    const thresholdScreen = 14;
    const thresholdWorld = thresholdScreen / scale;

    // 1. Snap to existing points
    for (const obj of geoObjects) {
      if (obj.type === 'point') {
        const d = Math.hypot(rawWorld.x - obj.x, rawWorld.y - obj.y);
        if (d <= thresholdWorld) {
          return {
            pos: { x: obj.x, y: obj.y },
            snapType: 'point',
            label: obj.label ? `Point ${obj.label}` : 'Point',
            targetObj: obj
          };
        }
      }
    }

    // 2. Snap to line midpoints
    for (const obj of geoObjects) {
      if (obj.type === 'line') {
        const mx = (obj.x1 + obj.x2) / 2;
        const my = (obj.y1 + obj.y2) / 2;
        const d = Math.hypot(rawWorld.x - mx, rawWorld.y - my);
        if (d <= thresholdWorld) {
          return {
            pos: { x: mx, y: my },
            snapType: 'midpoint',
            label: 'Midpoint',
            targetLine: obj
          };
        }
      }
    }

    // 3. Snap to line-line intersections
    const lines = geoObjects.filter(o => o.type === 'line');
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const pt = calculateLineLineIntersection(
          { x: lines[i].x1, y: lines[i].y1 }, { x: lines[i].x2, y: lines[i].y2 },
          { x: lines[j].x1, y: lines[j].y1 }, { x: lines[j].x2, y: lines[j].y2 },
          true
        );
        if (pt) {
          const d = Math.hypot(rawWorld.x - pt.x, rawWorld.y - pt.y);
          if (d <= thresholdWorld) {
            return {
              pos: { x: Math.round(pt.x * 10) / 10, y: Math.round(pt.y * 10) / 10 },
              snapType: 'intersection',
              label: 'Intersection',
              lines: [lines[i], lines[j]]
            };
          }
        }
      }
    }

    // 4. Snap to Horizontal / Vertical alignment
    if (baseDraftPt) {
      const dxScreen = Math.abs((rawWorld.x - baseDraftPt.x) * scale);
      const dyScreen = Math.abs((rawWorld.y - baseDraftPt.y) * scale);

      if (dxScreen <= 12) {
        return {
          pos: { x: baseDraftPt.x, y: rawWorld.y },
          snapType: 'vertical',
          label: 'Vertical (90°)'
        };
      }
      if (dyScreen <= 12) {
        return {
          pos: { x: rawWorld.x, y: baseDraftPt.y },
          snapType: 'horizontal',
          label: 'Horizontal (0°)'
        };
      }
    }

    // 5. Snap to Grid
    if (gridSettings?.snapToGrid) {
      const step = gridSettings.gridSize || 40;
      const gx = Math.round(rawWorld.x / step) * step;
      const gy = Math.round(rawWorld.y / step) * step;
      const d = Math.hypot(rawWorld.x - gx, rawWorld.y - gy);
      if (d <= thresholdWorld * 1.5) {
        return {
          pos: { x: gx, y: gy },
          snapType: 'grid',
          label: 'Grid'
        };
      }
    }

    return null;
  }, [geoObjects, gridSettings]);

  // Centering canvas on initial load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setTransform(prev => ({
      ...prev,
      offsetX: rect.width / 2,
      offsetY: rect.height / 2
    }));
  }, [setTransform]);

  // Keyboard events: Full shortcut support for all tools and canvas actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;

      // 1. Undo: Ctrl+Z / Cmd+Z
      if ((e.key === 'z' || e.key === 'Z') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // 2. Redo: Ctrl+Y / Cmd+Y
      if ((e.key === 'y' || e.key === 'Y') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        redo();
        return;
      }

      // 3. Clear Canvas: Alt+Delete / Alt+Backspace or Ctrl+Shift+Delete
      if (
        (e.altKey && (e.key === 'Backspace' || e.key === 'Delete')) ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'Backspace' || e.key === 'Delete'))
      ) {
        e.preventDefault();
        clearCanvas();
        return;
      }

      // 4. Delete / Backspace: Remove selected objects
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const toDeleteIds = (selectedIds && selectedIds.length > 0) ? selectedIds : (selectedId ? [selectedId] : []);
        if (toDeleteIds.length > 0) {
          e.preventDefault();
          pushHistory(geoObjects);
          const toDelete = new Set(toDeleteIds);
          setGeoObjects(prev => solveDependencies(prev.filter(o => !toDelete.has(o.id))));
          if (setSelectedIds) setSelectedIds([]);
          else setSelectedId(null);
          return;
        }
      }

      // 5. Escape: Close modals, cancel drafting, or clear selection
      if (e.key === 'Escape') {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
        }
        setDraftState(null);
        setSelectionBox(null);
        selectionBoxRef.current = null;
        if (setSelectedIds) setSelectedIds([]);
        else setSelectedId(null);
        return;
      }

      // 6. Select All: Ctrl+A / Cmd+A
      if ((e.key === 'a' || e.key === 'A') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (setSelectedIds) {
          setSelectedIds(geoObjects.map(o => o.id));
        }
        return;
      }

      // 7. Toggle Shortcuts modal: ? (or Shift + /)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // 8. Tool selection shortcuts
      for (const item of CANVAS_SHORTCUTS) {
        if (item.match && item.match(e)) {
          e.preventDefault();
          if (item.id === 'eraser') {
            const toDeleteIds = (selectedIds && selectedIds.length > 0) ? selectedIds : (selectedId ? [selectedId] : []);
            if (toDeleteIds.length > 0) {
              pushHistory(geoObjects);
              const toDelete = new Set(toDeleteIds);
              setGeoObjects(prev => solveDependencies(prev.filter(o => !toDelete.has(o.id))));
              if (setSelectedIds) setSelectedIds([]);
              else setSelectedId(null);
            } else {
              setDraftState(null);
              setActiveTool('eraser');
            }
          } else {
            setDraftState(null);
            setActiveTool(item.id);
          }
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedIds, geoObjects, undo, redo, clearCanvas, pushHistory, setGeoObjects, setSelectedId, setSelectedIds, setActiveTool, showShortcutsModal]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Retina display scaling
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Grid & Coordinate Axes
    const {
      showGrid = true,
      gridStyle = 'subdivided',
      gridSize = 40,
      showAxes = true,
      unit = 'cm'
    } = gridSettings || {};

    const { scale } = transform;
    const gridStepWorld = gridSize || 40;

    const startWorld = toWorld(0, 0);
    const endWorld = toWorld(width, height);

    const minGridX = Math.floor(startWorld.x / gridStepWorld) * gridStepWorld;
    const maxGridX = Math.ceil(endWorld.x / gridStepWorld) * gridStepWorld;
    const minGridY = Math.floor(startWorld.y / gridStepWorld) * gridStepWorld;
    const maxGridY = Math.ceil(endWorld.y / gridStepWorld) * gridStepWorld;

    if (showGrid) {
      if (gridStyle === 'dots') {
        ctx.fillStyle = '#2d3748';
        for (let gx = minGridX; gx <= maxGridX; gx += gridStepWorld) {
          for (let gy = minGridY; gy <= maxGridY; gy += gridStepWorld) {
            const sp = toScreen(gx, gy);
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (gridStyle === 'lines') {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = minGridX; gx <= maxGridX; gx += gridStepWorld) {
          const sp = toScreen(gx, 0);
          ctx.moveTo(sp.x, 0);
          ctx.lineTo(sp.x, height);
        }
        for (let gy = minGridY; gy <= maxGridY; gy += gridStepWorld) {
          const sp = toScreen(0, gy);
          ctx.moveTo(0, sp.y);
          ctx.lineTo(width, sp.y);
        }
        ctx.stroke();
      } else if (gridStyle === 'subdivided') {
        const subStep = gridStepWorld / 5;
        const minSubX = Math.floor(startWorld.x / subStep) * subStep;
        const maxSubX = Math.ceil(endWorld.x / subStep) * subStep;
        const minSubY = Math.floor(startWorld.y / subStep) * subStep;
        const maxSubY = Math.ceil(endWorld.y / subStep) * subStep;

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let sx = minSubX; sx <= maxSubX; sx += subStep) {
          const sp = toScreen(sx, 0);
          ctx.moveTo(sp.x, 0);
          ctx.lineTo(sp.x, height);
        }
        for (let sy = minSubY; sy <= maxSubY; sy += subStep) {
          const sp = toScreen(0, sy);
          ctx.moveTo(0, sp.y);
          ctx.lineTo(width, sp.y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = minGridX; gx <= maxGridX; gx += gridStepWorld) {
          const sp = toScreen(gx, 0);
          ctx.moveTo(sp.x, 0);
          ctx.lineTo(sp.x, height);
        }
        for (let gy = minGridY; gy <= maxGridY; gy += gridStepWorld) {
          const sp = toScreen(0, gy);
          ctx.moveTo(0, sp.y);
          ctx.lineTo(width, sp.y);
        }
        ctx.stroke();
      } else if (gridStyle === 'isometric') {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = minGridX; gx <= maxGridX; gx += gridStepWorld) {
          const sp = toScreen(gx, 0);
          ctx.moveTo(sp.x, 0);
          ctx.lineTo(sp.x, height);
        }
        const diagStep = gridStepWorld * 1.732;
        const minDiag = Math.floor((startWorld.x - startWorld.y) / diagStep) * diagStep;
        const maxDiag = Math.ceil((endWorld.x + endWorld.y) / diagStep) * diagStep;
        for (let d = minDiag; d <= maxDiag; d += diagStep) {
          const p1 = toScreen(d, 0);
          const p2 = toScreen(d + height / 1.732 / scale, height / scale);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const p3 = toScreen(d - height / 1.732 / scale, height / scale);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
        }
        ctx.stroke();
      }
    }

    // Coordinate Axes (X = 0 and Y = 0) with numbering
    if (showAxes) {
      const origin = toScreen(0, 0);
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.6;

      // X-Axis
      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(width, origin.y);
      ctx.stroke();

      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, height);
      ctx.stroke();

      // Axis arrows
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.beginPath();
      ctx.moveTo(width - 4, origin.y);
      ctx.lineTo(width - 12, origin.y - 4);
      ctx.lineTo(width - 12, origin.y + 4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(origin.x, 4);
      ctx.lineTo(origin.x - 4, 12);
      ctx.lineTo(origin.x + 4, 12);
      ctx.fill();

      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillText('X', width - 20, origin.y - 8);
      ctx.fillText('Y', origin.x + 8, 20);

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let gx = minGridX; gx <= maxGridX; gx += gridStepWorld) {
        if (Math.abs(gx) < 0.001) continue;
        const sp = toScreen(gx, 0);
        const val = Math.round(gx / gridStepWorld);
        ctx.beginPath();
        ctx.moveTo(sp.x, origin.y - 3);
        ctx.lineTo(sp.x, origin.y + 3);
        ctx.stroke();
        ctx.fillText(`${val}`, sp.x, origin.y + 5);
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let gy = minGridY; gy <= maxGridY; gy += gridStepWorld) {
        if (Math.abs(gy) < 0.001) continue;
        const sp = toScreen(0, gy);
        const val = -Math.round(gy / gridStepWorld);
        ctx.beginPath();
        ctx.moveTo(origin.x - 3, sp.y);
        ctx.lineTo(origin.x + 3, sp.y);
        ctx.stroke();
        ctx.fillText(`${val}`, origin.x - 6, sp.y);
      }

      ctx.fillText('0', origin.x - 6, origin.y + 6);
      ctx.restore();
    }

    // 2. Draw GeoObjects
    geoObjects.forEach(obj => {
      const isHovered = obj.id === hoveredId;
      const isSelected = (selectedIds && selectedIds.length > 0) ? selectedIds.includes(obj.id) : obj.id === selectedId;

      switch (obj.type) {
        case 'point':
          drawPoint(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'line':
          drawLine(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'circle':
          drawCircle(ctx, obj, toScreen, isHovered, isSelected, scale);
          break;
        case 'triangle':
          drawTriangle(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'rectangle':
          drawRectangle(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'polygon':
          drawPolygon(ctx, obj, toScreen, isHovered, isSelected, gridStepWorld, unit);
          break;
        case 'ruler':
          drawRulerMeasure(ctx, obj, toScreen, isHovered, isSelected, gridStepWorld, unit);
          break;
        case 'angle':
          drawAngle(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'rightangle':
          drawRightAngle(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'label':
          drawLabel(ctx, obj, toScreen, isHovered, isSelected);
          break;
        case 'protractor':
          drawProtractor(ctx, obj, toScreen);
          break;
        default:
          break;
      }
    });

    // 3. Draw In-Progress Construction Draft Preview
    if (draftState) {
      ctx.save();
      ctx.strokeStyle = DEFAULT_COLORS.helper;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      if (draftState.type === 'line' && draftState.pt1) {
        const p1 = toScreen(draftState.pt1.x, draftState.pt1.y);
        const p2 = toScreen(cursorWorldPos.x, cursorWorldPos.y);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (draftState.type === 'circle' && draftState.center) {
        const center = toScreen(draftState.center.x, draftState.center.y);
        const dx = cursorWorldPos.x - draftState.center.x;
        const dy = cursorWorldPos.y - draftState.center.y;
        const rWorld = Math.sqrt(dx * dx + dy * dy);
        const rPx = rWorld * scale;

        ctx.beginPath();
        ctx.arc(center.x, center.y, rPx, 0, Math.PI * 2);
        ctx.stroke();
      } else if (draftState.type === 'circle3p') {
        const pts = draftState.pts || [];
        if (pts.length === 1) {
          const p1 = toScreen(pts[0].x, pts[0].y);
          const curr = toScreen(cursorWorldPos.x, cursorWorldPos.y);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        } else if (pts.length === 2) {
          const circle = calculateCircleThreePoints(pts[0], pts[1], cursorWorldPos);
          if (circle) {
            const sc = toScreen(circle.cx, circle.cy);
            ctx.beginPath();
            ctx.arc(sc.x, sc.y, circle.r * scale, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      } else if (draftState.type === 'regpoly' && draftState.center) {
        const rad = Math.hypot(cursorWorldPos.x - draftState.center.x, cursorWorldPos.y - draftState.center.y);
        if (rad > 2) {
          const vts = calculateRegularPolygonVertices(draftState.center, cursorWorldPos, draftState.sides || 5);
          const scVts = vts.map(p => toScreen(p.x, p.y));
          ctx.beginPath();
          ctx.moveTo(scVts[0].x, scVts[0].y);
          for (let i = 1; i < scVts.length; i++) ctx.lineTo(scVts[i].x, scVts[i].y);
          ctx.closePath();
          ctx.strokeStyle = '#38bdf8';
          ctx.stroke();
        }
      } else if (draftState.type === 'perpendicular' && draftState.baseLine) {
        const perp = calculatePerpendicularLine(
          { x: draftState.baseLine.x1, y: draftState.baseLine.y1 },
          { x: draftState.baseLine.x2, y: draftState.baseLine.y2 },
          cursorWorldPos,
          180
        );
        const p1 = toScreen(perp.x1, perp.y1);
        const p2 = toScreen(perp.x2, perp.y2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (draftState.type === 'parallel' && draftState.baseLine) {
        const par = calculateParallelLine(
          { x: draftState.baseLine.x1, y: draftState.baseLine.y1 },
          { x: draftState.baseLine.x2, y: draftState.baseLine.y2 },
          cursorWorldPos,
          180
        );
        const p1 = toScreen(par.x1, par.y1);
        const p2 = toScreen(par.x2, par.y2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (draftState.type === 'rectangle' && draftState.start) {
        const p1 = toScreen(draftState.start.x, draftState.start.y);
        const p2 = toScreen(cursorWorldPos.x, cursorWorldPos.y);
        ctx.beginPath();
        ctx.rect(
          Math.min(p1.x, p2.x),
          Math.min(p1.y, p2.y),
          Math.abs(p2.x - p1.x),
          Math.abs(p2.y - p1.y)
        );
        ctx.stroke();
      } else if (draftState.type === 'triangle') {
        const pts = draftState.pts || [];
        if (pts.length > 0) {
          ctx.beginPath();
          const first = toScreen(pts[0].x, pts[0].y);
          ctx.moveTo(first.x, first.y);
          pts.slice(1).forEach(pt => {
            const p = toScreen(pt.x, pt.y);
            ctx.lineTo(p.x, p.y);
          });
          const curr = toScreen(cursorWorldPos.x, cursorWorldPos.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      } else if (draftState.type === 'angle' || draftState.type === 'angle_bisector') {
        const pts = draftState.pts || [];
        if (pts.length > 0) {
          ctx.beginPath();
          const p1 = toScreen(pts[0].x, pts[0].y);
          ctx.moveTo(p1.x, p1.y);
          if (pts.length >= 2) {
            const vertex = toScreen(pts[1].x, pts[1].y);
            ctx.lineTo(vertex.x, vertex.y);
            const curr = toScreen(cursorWorldPos.x, cursorWorldPos.y);
            ctx.lineTo(curr.x, curr.y);
          } else {
            const curr = toScreen(cursorWorldPos.x, cursorWorldPos.y);
            ctx.lineTo(curr.x, curr.y);
          }
          ctx.stroke();
        }
      } else if (draftState.type === 'polygon') {
        const pts = draftState.pts || [];
        if (pts.length > 0) {
          const screenPts = pts.map(p => toScreen(p.x, p.y));
          ctx.beginPath();
          ctx.moveTo(screenPts[0].x, screenPts[0].y);
          for (let i = 1; i < screenPts.length; i++) {
            ctx.lineTo(screenPts[i].x, screenPts[i].y);
          }
          const curr = toScreen(cursorWorldPos.x, cursorWorldPos.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          screenPts.forEach(sp => {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
          });
        }
      } else if (draftState.type === 'ruler' && draftState.pt1) {
        const p1 = toScreen(draftState.pt1.x, draftState.pt1.y);
        const p2 = toScreen(cursorWorldPos.x, cursorWorldPos.y);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Draw Snap Indicator
    if (snapInfo) {
      drawSnapIndicator(ctx, snapInfo, toScreen);
    }

    // 5. Draw Marquee Selection Box
    if (selectionBox) {
      const p1 = toScreen(selectionBox.x1, selectionBox.y1);
      const p2 = toScreen(selectionBox.x2, selectionBox.y2);
      const minX = Math.min(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x);
      const h = Math.abs(p2.y - p1.y);

      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.fillRect(minX, minY, w, h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(minX, minY, w, h);
      ctx.restore();
    }

    ctx.restore();
  }, [geoObjects, transform, hoveredId, selectedId, selectedIds, selectionBox, draftState, cursorWorldPos, cursorScreenPos, snapInfo, gridSettings, toScreen, toWorld]);

  // Object Hit Testing (Prioritizes points first so vertices are easily selected)
  const findObjectAt = useCallback((sx, sy) => {
    const thresholdPx = 10;
    const { scale } = transformRef.current;
    const worldPos = toWorld(sx, sy);

    // 1. Points first
    for (let i = geoObjects.length - 1; i >= 0; i--) {
      const obj = geoObjects[i];
      if (obj.type === 'point') {
        const dx = (obj.x - worldPos.x) * scale;
        const dy = (obj.y - worldPos.y) * scale;
        if (Math.hypot(dx, dy) <= 12) return obj.id;
      }
    }

    // 2. Lines, circles, polygons
    for (let i = geoObjects.length - 1; i >= 0; i--) {
      const obj = geoObjects[i];
      if (obj.type === 'line') {
        const p1 = toScreen(obj.x1, obj.y1);
        const p2 = toScreen(obj.x2, obj.y2);
        if (distToSegment({ x: sx, y: sy }, p1, p2) <= thresholdPx) return obj.id;
      } else if (obj.type === 'circle') {
        const dx = obj.cx - worldPos.x;
        const dy = obj.cy - worldPos.y;
        const distWorld = Math.hypot(dx, dy);
        const diffPx = Math.abs(distWorld - obj.r) * scale;
        if (diffPx <= thresholdPx || distWorld <= obj.r) return obj.id;
      } else if (obj.type === 'rectangle') {
        const p1 = toScreen(obj.x, obj.y);
        const p2 = toScreen(obj.x + obj.w, obj.y + obj.h);
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) return obj.id;
      } else if (obj.type === 'triangle') {
        if (obj.pts && obj.pts.length === 3) {
          const sps = obj.pts.map(p => toScreen(p.x, p.y));
          if (pointInTriangle({ x: sx, y: sy }, sps[0], sps[1], sps[2])) return obj.id;
        }
      } else if (obj.type === 'polygon') {
        if (obj.pts && obj.pts.length >= 3) {
          if (pointInPolygon(worldPos, obj.pts)) return obj.id;
          for (let j = 0; j < obj.pts.length; j++) {
            const k = (j + 1) % obj.pts.length;
            const sp1 = toScreen(obj.pts[j].x, obj.pts[j].y);
            const sp2 = toScreen(obj.pts[k].x, obj.pts[k].y);
            if (distToSegment({ x: sx, y: sy }, sp1, sp2) <= thresholdPx) return obj.id;
          }
        }
      } else if (obj.type === 'ruler') {
        const p1 = toScreen(obj.x1, obj.y1);
        const p2 = toScreen(obj.x2, obj.y2);
        if (distToSegment({ x: sx, y: sy }, p1, p2) <= thresholdPx) return obj.id;
      }
    }
    return null;
  }, [geoObjects, toScreen, toWorld]);

  // Pointer Interaction state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, worldX: 0, worldY: 0, objectId: null });

  // Helper to ensure a point object exists at pos or retrieve existing point
  const getOrCreatePoint = useCallback((pos, existingObj = null) => {
    if (existingObj && existingObj.type === 'point') return existingObj;
    const existing = geoObjects.find(o => o.type === 'point' && Math.hypot(o.x - pos.x, o.y - pos.y) < 1);
    if (existing) return existing;

    const label = getNextPointLabel(geoObjects);
    const newPt = {
      id: generateId('pt'),
      type: 'point',
      x: Math.round(pos.x * 10) / 10,
      y: Math.round(pos.y * 10) / 10,
      color: DEFAULT_COLORS.point,
      label,
      labelOffset: { x: 8, y: -8 }
    };
    return newPt;
  }, [geoObjects]);

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const rawWorld = toWorld(sx, sy);
    const snap = getSnapTarget(rawWorld, draftState?.pt1 || draftState?.center);
    const effectivePos = snap ? snap.pos : rawWorld;

    // Pan mode check (Middle click, Alt key, or Hand tool)
    if (e.button === 1 || e.altKey || activeTool === 'hand') {
      isDraggingRef.current = true;
      setIsPanning(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: transformRef.current.offsetX,
        offsetY: transformRef.current.offsetY,
        isPan: true
      };
      return;
    }

    if (e.button !== 0) return;

    const hitId = findObjectAt(sx, sy);
    const hitObj = hitId ? geoObjects.find(o => o.id === hitId) : null;

    // ERASER TOOL
    if (activeTool === 'eraser') {
      if (hitId) {
        pushHistory(geoObjects);
        setGeoObjects(prev => solveDependencies(prev.filter(o => o.id !== hitId)));
        if (setSelectedIds) setSelectedIds(prev => prev.filter(id => id !== hitId));
        else setSelectedId(null);
      }
      return;
    }

    // SELECT TOOL
    if (activeTool === 'select') {
      if (hitId) {
        if (e.shiftKey) {
          // Toggle selection
          if (setSelectedIds) {
            setSelectedIds(prev => prev.includes(hitId) ? prev.filter(id => id !== hitId) : [...prev, hitId]);
          } else {
            setSelectedId(hitId);
          }
        } else {
          // If hitId not in currently selected items, select only hitId
          const isAlreadySelected = (selectedIds && selectedIds.includes(hitId)) || selectedId === hitId;
          if (!isAlreadySelected) {
            if (setSelectedIds) setSelectedIds([hitId]);
            else setSelectedId(hitId);
          }
        }

        isDraggingRef.current = true;
        dragStartRef.current = {
          x: sx,
          y: sy,
          worldX: effectivePos.x,
          worldY: effectivePos.y,
          objectId: hitId,
          isMovingObjects: true,
          moved: false
        };
      } else {
        // Dragging empty canvas with Select Tool -> Marquee Selection Box (DOES NOT PAN)
        if (!e.shiftKey) {
          if (setSelectedIds) setSelectedIds([]);
          else setSelectedId(null);
        }

        isDraggingRef.current = true;
        const initialBox = {
          x1: rawWorld.x,
          y1: rawWorld.y,
          x2: rawWorld.x,
          y2: rawWorld.y,
          screenX1: sx,
          screenY1: sy,
          screenX2: sx,
          screenY2: sy,
          isMarquee: true
        };
        selectionBoxRef.current = initialBox;
        setSelectionBox(initialBox);
        dragStartRef.current = {
          x: sx,
          y: sy,
          isMarquee: true
        };
      }
      return;
    }

    // POINT TOOL
    if (activeTool === 'point') {
      pushHistory(geoObjects);
      const label = getNextPointLabel(geoObjects);
      const newPoint = {
        id: generateId('pt'),
        type: 'point',
        x: Math.round(effectivePos.x * 10) / 10,
        y: Math.round(effectivePos.y * 10) / 10,
        color: DEFAULT_COLORS.point,
        label,
        labelOffset: { x: 8, y: -8 }
      };
      setGeoObjects(prev => [...prev, newPoint]);
      return;
    }

    // LINE / SEGMENT TOOL
    if (activeTool === 'line') {
      if (!draftState) {
        const pt1 = getOrCreatePoint(effectivePos, hitObj);
        setDraftState({ type: 'line', pt1, p1Obj: pt1 });
      } else {
        pushHistory(geoObjects);
        const p1 = draftState.p1Obj;
        const p2 = getOrCreatePoint(effectivePos, hitObj);
        const toAdd = [];
        if (!geoObjects.some(o => o.id === p1.id)) toAdd.push(p1);
        if (!geoObjects.some(o => o.id === p2.id) && p2.id !== p1.id) toAdd.push(p2);

        const newLine = {
          id: generateId('line'),
          type: 'line',
          p1Id: p1.id,
          p2Id: p2.id,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          color: DEFAULT_COLORS.line,
          width: 2
        };
        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, newLine]));
        setDraftState(null);
      }
      return;
    }

    // CIRCLE TOOL
    if (activeTool === 'circle') {
      if (!draftState) {
        const center = getOrCreatePoint(effectivePos, hitObj);
        setDraftState({ type: 'circle', center, centerObj: center });
      } else {
        const center = draftState.centerObj;
        const radPt = getOrCreatePoint(effectivePos, hitObj);
        const dx = radPt.x - center.x;
        const dy = radPt.y - center.y;
        const r = Math.hypot(dx, dy);

        if (r > 1) {
          pushHistory(geoObjects);
          const toAdd = [];
          if (!geoObjects.some(o => o.id === center.id)) toAdd.push(center);
          if (!geoObjects.some(o => o.id === radPt.id) && radPt.id !== center.id) toAdd.push(radPt);

          const newCircle = {
            id: generateId('circle'),
            type: 'circle',
            centerPointId: center.id,
            radiusPointId: radPt.id,
            cx: center.x,
            cy: center.y,
            r,
            color: DEFAULT_COLORS.circle,
            width: 2
          };
          setGeoObjects(prev => solveDependencies([...prev, ...toAdd, newCircle]));
        }
        setDraftState(null);
      }
      return;
    }

    // THREE-POINT CIRCLE
    if (activeTool === 'circle3p') {
      const pts = draftState?.pts || [];
      const pt = getOrCreatePoint(effectivePos, hitObj);
      const newPts = [...pts, pt];

      if (newPts.length < 3) {
        setDraftState({ type: 'circle3p', pts: newPts });
      } else {
        const circleData = calculateCircleThreePoints(newPts[0], newPts[1], newPts[2]);
        if (circleData) {
          pushHistory(geoObjects);
          const toAdd = newPts.filter(p => !geoObjects.some(o => o.id === p.id));
          const newCircle = {
            id: generateId('circle3p'),
            type: 'circle',
            cx: circleData.cx,
            cy: circleData.cy,
            r: circleData.r,
            dependency: {
              type: 'three_point_circle',
              p1Id: newPts[0].id,
              p2Id: newPts[1].id,
              p3Id: newPts[2].id
            },
            color: DEFAULT_COLORS.circle,
            width: 2
          };
          setGeoObjects(prev => solveDependencies([...prev, ...toAdd, newCircle]));
        }
        setDraftState(null);
      }
      return;
    }

    // REGULAR POLYGON
    if (activeTool === 'regpoly') {
      if (!draftState) {
        const center = getOrCreatePoint(effectivePos, hitObj);
        setDraftState({ type: 'regpoly', center, centerObj: center, sides: 5 });
      } else {
        const center = draftState.centerObj;
        const radPt = getOrCreatePoint(effectivePos, hitObj);
        const sides = draftState.sides || 5;
        const vertices = calculateRegularPolygonVertices(center, radPt, sides);

        pushHistory(geoObjects);
        const toAdd = [];
        if (!geoObjects.some(o => o.id === center.id)) toAdd.push(center);
        if (!geoObjects.some(o => o.id === radPt.id) && radPt.id !== center.id) toAdd.push(radPt);

        const newPoly = {
          id: generateId('regpoly'),
          type: 'polygon',
          pts: vertices,
          dependency: {
            type: 'regular_polygon',
            centerPointId: center.id,
            radiusPointId: radPt.id,
            sides
          },
          fillColor: 'rgba(56, 189, 248, 0.14)',
          strokeColor: DEFAULT_COLORS.polygon
        };
        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, newPoly]));
        setDraftState(null);
      }
      return;
    }

    // MIDPOINT TOOL
    if (activeTool === 'midpoint') {
      // If user clicked an existing line
      if (hitObj && hitObj.type === 'line') {
        pushHistory(geoObjects);
        const label = getNextPointLabel(geoObjects);
        const mx = Math.round(((hitObj.x1 + hitObj.x2) / 2) * 10) / 10;
        const my = Math.round(((hitObj.y1 + hitObj.y2) / 2) * 10) / 10;
        const midPoint = {
          id: generateId('pt_mid'),
          type: 'point',
          x: mx,
          y: my,
          label,
          color: '#f0a500',
          dependency: { type: 'midpoint', lineId: hitObj.id }
        };
        setGeoObjects(prev => solveDependencies([...prev, midPoint]));
        return;
      }

      // If user clicks points
      const pt = getOrCreatePoint(effectivePos, hitObj);
      if (!draftState) {
        setDraftState({ type: 'midpoint', p1: pt });
      } else {
        pushHistory(geoObjects);
        const p1 = draftState.p1;
        const p2 = pt;
        const toAdd = [];
        if (!geoObjects.some(o => o.id === p1.id)) toAdd.push(p1);
        if (!geoObjects.some(o => o.id === p2.id) && p2.id !== p1.id) toAdd.push(p2);

        const label = getNextPointLabel(geoObjects);
        const mx = Math.round(((p1.x + p2.x) / 2) * 10) / 10;
        const my = Math.round(((p1.y + p2.y) / 2) * 10) / 10;
        const midPoint = {
          id: generateId('pt_mid'),
          type: 'point',
          x: mx,
          y: my,
          label,
          color: '#f0a500',
          dependency: { type: 'midpoint', p1Id: p1.id, p2Id: p2.id }
        };
        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, midPoint]));
        setDraftState(null);
      }
      return;
    }

    // PERPENDICULAR TOOL
    if (activeTool === 'perpendicular') {
      if (!draftState) {
        if (hitObj && hitObj.type === 'line') {
          setDraftState({ type: 'perpendicular', baseLine: hitObj });
        }
      } else {
        const baseLine = draftState.baseLine;
        const throughPt = getOrCreatePoint(effectivePos, hitObj);
        pushHistory(geoObjects);

        const toAdd = [];
        if (!geoObjects.some(o => o.id === throughPt.id)) toAdd.push(throughPt);

        const perpCoords = calculatePerpendicularLine(
          { x: baseLine.x1, y: baseLine.y1 },
          { x: baseLine.x2, y: baseLine.y2 },
          throughPt,
          180
        );

        const perpLineId = generateId('perp');
        const perpLine = {
          id: perpLineId,
          type: 'line',
          x1: perpCoords.x1,
          y1: perpCoords.y1,
          x2: perpCoords.x2,
          y2: perpCoords.y2,
          color: DEFAULT_COLORS.helper,
          dash: [4, 4],
          dependency: {
            type: 'perpendicular',
            baseLineId: baseLine.id,
            throughPointId: throughPt.id
          }
        };

        const ra = {
          id: generateId('ra'),
          type: 'rightangle',
          vx: throughPt.x,
          vy: throughPt.y,
          dir1: { x: perpCoords.nx, y: perpCoords.ny },
          dir2: { x: (baseLine.x2 - baseLine.x1) / (Math.hypot(baseLine.x2 - baseLine.x1, baseLine.y2 - baseLine.y1) || 1), y: (baseLine.y2 - baseLine.y1) / (Math.hypot(baseLine.x2 - baseLine.x1, baseLine.y2 - baseLine.y1) || 1) },
          dependency: {
            type: 'rightangle',
            baseLineId: baseLine.id,
            perpLineId: perpLineId
          },
          color: DEFAULT_COLORS.helper
        };

        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, perpLine, ra]));
        setDraftState(null);
      }
      return;
    }

    // PARALLEL TOOL
    if (activeTool === 'parallel') {
      if (!draftState) {
        if (hitObj && hitObj.type === 'line') {
          setDraftState({ type: 'parallel', baseLine: hitObj });
        }
      } else {
        const baseLine = draftState.baseLine;
        const throughPt = getOrCreatePoint(effectivePos, hitObj);
        pushHistory(geoObjects);

        const toAdd = [];
        if (!geoObjects.some(o => o.id === throughPt.id)) toAdd.push(throughPt);

        const parCoords = calculateParallelLine(
          { x: baseLine.x1, y: baseLine.y1 },
          { x: baseLine.x2, y: baseLine.y2 },
          throughPt,
          180
        );

        const parLine = {
          id: generateId('par'),
          type: 'line',
          x1: parCoords.x1,
          y1: parCoords.y1,
          x2: parCoords.x2,
          y2: parCoords.y2,
          color: '#38bdf8',
          dash: [5, 3],
          dependency: {
            type: 'parallel',
            baseLineId: baseLine.id,
            throughPointId: throughPt.id
          }
        };

        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, parLine]));
        setDraftState(null);
      }
      return;
    }

    // PERPENDICULAR BISECTOR TOOL
    if (activeTool === 'perp_bisector') {
      if (hitObj && hitObj.type === 'line') {
        pushHistory(geoObjects);
        const pb = calculatePerpendicularBisector({ x: hitObj.x1, y: hitObj.y1 }, { x: hitObj.x2, y: hitObj.y2 }, 180);
        const pbLine = {
          id: generateId('pb'),
          type: 'line',
          x1: pb.x1,
          y1: pb.y1,
          x2: pb.x2,
          y2: pb.y2,
          color: DEFAULT_COLORS.helper,
          dash: [4, 4],
          dependency: { type: 'perp_bisector', baseLineId: hitObj.id }
        };
        setGeoObjects(prev => solveDependencies([...prev, pbLine]));
        return;
      }
      const pt = getOrCreatePoint(effectivePos, hitObj);
      if (!draftState) {
        setDraftState({ type: 'perp_bisector', p1: pt });
      } else {
        pushHistory(geoObjects);
        const p1 = draftState.p1;
        const p2 = pt;
        const toAdd = [];
        if (!geoObjects.some(o => o.id === p1.id)) toAdd.push(p1);
        if (!geoObjects.some(o => o.id === p2.id) && p2.id !== p1.id) toAdd.push(p2);

        const pb = calculatePerpendicularBisector(p1, p2, 180);
        const pbLine = {
          id: generateId('pb'),
          type: 'line',
          x1: pb.x1,
          y1: pb.y1,
          x2: pb.x2,
          y2: pb.y2,
          color: DEFAULT_COLORS.helper,
          dash: [4, 4],
          dependency: { type: 'perp_bisector', p1Id: p1.id, p2Id: p2.id }
        };
        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, pbLine]));
        setDraftState(null);
      }
      return;
    }

    // ANGLE BISECTOR TOOL
    if (activeTool === 'angle_bisector') {
      const pt = getOrCreatePoint(effectivePos, hitObj);
      const pts = draftState?.pts || [];
      const newPts = [...pts, pt];

      if (newPts.length < 3) {
        setDraftState({ type: 'angle_bisector', pts: newPts });
      } else {
        pushHistory(geoObjects);
        const toAdd = newPts.filter(p => !geoObjects.some(o => o.id === p.id));
        const bis = calculateAngleBisector(newPts[0], newPts[1], newPts[2], 180);
        const bisLine = {
          id: generateId('abis'),
          type: 'line',
          x1: bis.x1,
          y1: bis.y1,
          x2: bis.x2,
          y2: bis.y2,
          color: '#f0a500',
          dash: [4, 4],
          dependency: {
            type: 'angle_bisector',
            p1Id: newPts[0].id,
            vertexId: newPts[1].id,
            p2Id: newPts[2].id
          }
        };
        setGeoObjects(prev => solveDependencies([...prev, ...toAdd, bisLine]));
        setDraftState(null);
      }
      return;
    }

    // INTERSECTION TOOL
    if (activeTool === 'intersection') {
      if (snap && snap.snapType === 'intersection' && snap.lines) {
        pushHistory(geoObjects);
        const label = getNextPointLabel(geoObjects);
        const intPt = {
          id: generateId('pt_int'),
          type: 'point',
          x: snap.pos.x,
          y: snap.pos.y,
          label,
          color: '#f0a500',
          dependency: {
            type: 'intersection',
            line1Id: snap.lines[0].id,
            line2Id: snap.lines[1].id
          }
        };
        setGeoObjects(prev => solveDependencies([...prev, intPt]));
        return;
      }

      if (hitObj && hitObj.type === 'line') {
        if (!draftState) {
          setDraftState({ type: 'intersection', l1: hitObj });
        } else {
          const l1 = draftState.l1;
          const l2 = hitObj;
          const pt = calculateLineLineIntersection(
            { x: l1.x1, y: l1.y1 }, { x: l1.x2, y: l1.y2 },
            { x: l2.x1, y: l2.y1 }, { x: l2.x2, y: l2.y2 }
          );
          if (pt) {
            pushHistory(geoObjects);
            const label = getNextPointLabel(geoObjects);
            const intPt = {
              id: generateId('pt_int'),
              type: 'point',
              x: Math.round(pt.x * 10) / 10,
              y: Math.round(pt.y * 10) / 10,
              label,
              color: '#f0a500',
              dependency: {
                type: 'intersection',
                line1Id: l1.id,
                line2Id: l2.id
              }
            };
            setGeoObjects(prev => solveDependencies([...prev, intPt]));
          }
          setDraftState(null);
        }
      }
      return;
    }

    // TANGENT TOOL
    if (activeTool === 'tangent') {
      if (!draftState) {
        if (hitObj && hitObj.type === 'circle') {
          setDraftState({ type: 'tangent', circle: hitObj });
        }
      } else {
        const circle = draftState.circle;
        const pt = getOrCreatePoint(effectivePos, hitObj);
        pushHistory(geoObjects);

        const toAdd = [];
        if (!geoObjects.some(o => o.id === pt.id)) toAdd.push(pt);

        const tanCoords = calculateCircleTangent({ x: circle.cx, y: circle.cy }, circle.r, pt, 180);
        if (tanCoords) {
          const tanLine = {
            id: generateId('tangent'),
            type: 'line',
            x1: tanCoords.x1,
            y1: tanCoords.y1,
            x2: tanCoords.x2,
            y2: tanCoords.y2,
            color: '#f0a500',
            dependency: {
              type: 'tangent',
              circleId: circle.id,
              throughPointId: pt.id
            }
          };
          setGeoObjects(prev => solveDependencies([...prev, ...toAdd, tanLine]));
        }
        setDraftState(null);
      }
      return;
    }

    // TRIANGLE TOOL
    if (activeTool === 'triangle') {
      const pts = draftState?.pts || [];
      const newPts = [...pts, effectivePos];

      if (newPts.length < 3) {
        setDraftState({ type: 'triangle', pts: newPts });
      } else {
        pushHistory(geoObjects);
        const newTriangle = {
          id: generateId('tri'),
          type: 'triangle',
          pts: newPts,
          fillColor: 'rgba(255, 123, 53, 0.12)',
          strokeColor: DEFAULT_COLORS.triangle
        };
        setGeoObjects(prev => solveDependencies([...prev, newTriangle]));
        setDraftState(null);
      }
      return;
    }

    // RECTANGLE TOOL
    if (activeTool === 'rectangle') {
      if (!draftState) {
        setDraftState({ type: 'rectangle', start: effectivePos });
        isDraggingRef.current = true;
      } else {
        const w = effectivePos.x - draftState.start.x;
        const h = effectivePos.y - draftState.start.y;
        if (Math.abs(w) > 0.5 && Math.abs(h) > 0.5) {
          pushHistory(geoObjects);
          const newRect = {
            id: generateId('rect'),
            type: 'rectangle',
            x: draftState.start.x,
            y: draftState.start.y,
            w,
            h,
            fillColor: 'rgba(167, 139, 250, 0.12)',
            strokeColor: DEFAULT_COLORS.rectangle
          };
          setGeoObjects(prev => solveDependencies([...prev, newRect]));
        }
        setDraftState(null);
        isDraggingRef.current = false;
      }
      return;
    }

    // ANGLE TOOL
    if (activeTool === 'angle') {
      const pts = draftState?.pts || [];
      const newPts = [...pts, effectivePos];
      if (newPts.length < 3) {
        setDraftState({ type: 'angle', pts: newPts });
      } else {
        pushHistory(geoObjects);
        const newAngle = {
          id: generateId('angle'),
          type: 'angle',
          vx: newPts[0].x,
          vy: newPts[0].y,
          r1x: newPts[1].x,
          r1y: newPts[1].y,
          r2x: newPts[2].x,
          r2y: newPts[2].y,
          color: DEFAULT_COLORS.angle
        };
        setGeoObjects(prev => solveDependencies([...prev, newAngle]));
        setDraftState(null);
      }
      return;
    }

    // PROTRACTOR TOOL
    if (activeTool === 'protractor') {
      pushHistory(geoObjects);
      const newProtractor = {
        id: generateId('prot'),
        type: 'protractor',
        x: effectivePos.x,
        y: effectivePos.y
      };
      setGeoObjects(prev => solveDependencies([...prev, newProtractor]));
      setActiveTool('select');
      return;
    }

    // POLYGON TOOL
    if (activeTool === 'polygon') {
      if (!draftState || draftState.type !== 'polygon') {
        setDraftState({ type: 'polygon', pts: [effectivePos] });
      } else {
        const pts = draftState.pts;
        const startPt = pts[0];
        const startScreen = toScreen(startPt.x, startPt.y);
        const distToStartPx = Math.hypot(sx - startScreen.x, sy - startScreen.y);

        if (distToStartPx <= 18 && pts.length >= 3) {
          pushHistory(geoObjects);
          const newPolygon = {
            id: generateId('poly'),
            type: 'polygon',
            pts: [...pts],
            fillColor: 'rgba(56, 189, 248, 0.14)',
            strokeColor: DEFAULT_COLORS.polygon
          };
          setGeoObjects(prev => solveDependencies([...prev, newPolygon]));
          setDraftState(null);
          return;
        }

        const lastPt = pts[pts.length - 1];
        if (Math.hypot(effectivePos.x - lastPt.x, effectivePos.y - lastPt.y) > 0.5) {
          setDraftState({ type: 'polygon', pts: [...pts, effectivePos] });
        }
      }
      return;
    }

    // RULER / MEASUREMENT TOOL
    if (activeTool === 'ruler') {
      if (!draftState || draftState.type !== 'ruler') {
        const pt1 = getOrCreatePoint(effectivePos, hitObj);
        setDraftState({ type: 'ruler', pt1, p1Obj: pt1 });
        isDraggingRef.current = true;
      } else {
        const pt2 = getOrCreatePoint(effectivePos, hitObj);
        const dist = Math.hypot(pt2.x - draftState.pt1.x, pt2.y - draftState.pt1.y);
        if (dist > 1) {
          pushHistory(geoObjects);
          const newRuler = {
            id: generateId('ruler'),
            type: 'ruler',
            p1Id: draftState.p1Obj.id,
            p2Id: pt2.id,
            x1: draftState.pt1.x,
            y1: draftState.pt1.y,
            x2: pt2.x,
            y2: pt2.y,
            color: DEFAULT_COLORS.ruler
          };
          setGeoObjects(prev => solveDependencies([...prev, newRuler]));
        }
        setDraftState(null);
        isDraggingRef.current = false;
      }
      return;
    }
  };

  const handleDoubleClick = () => {
    if (activeTool === 'polygon' && draftState && draftState.type === 'polygon' && draftState.pts.length >= 3) {
      pushHistory(geoObjects);
      const newPolygon = {
        id: generateId('poly'),
        type: 'polygon',
        pts: [...draftState.pts],
        fillColor: 'rgba(56, 189, 248, 0.14)',
        strokeColor: DEFAULT_COLORS.polygon
      };
      setGeoObjects(prev => solveDependencies([...prev, newPolygon]));
      setDraftState(null);
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const rawWorld = toWorld(sx, sy);

    const baseDraftPt = draftState?.pt1 || draftState?.center || draftState?.start;
    const snap = getSnapTarget(rawWorld, baseDraftPt);
    const effectivePos = snap ? snap.pos : rawWorld;

    setCursorScreenPos({ x: sx, y: sy });
    setCursorWorldPos(effectivePos);
    setSnapInfo(snap);

    const hitId = findObjectAt(sx, sy);
    setHoveredId(hitId);

    // Dragging action
    if (isDraggingRef.current) {
      if (dragStartRef.current?.isPan) {
        // Pan canvas
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setTransform(prev => ({
          ...prev,
          offsetX: dragStartRef.current.offsetX + dx,
          offsetY: dragStartRef.current.offsetY + dy
        }));
      } else if (selectionBoxRef.current?.isMarquee) {
        const box = {
          x1: selectionBoxRef.current.x1,
          y1: selectionBoxRef.current.y1,
          x2: rawWorld.x,
          y2: rawWorld.y,
          screenX1: selectionBoxRef.current.screenX1,
          screenY1: selectionBoxRef.current.screenY1,
          screenX2: sx,
          screenY2: sy,
          isMarquee: true
        };
        selectionBoxRef.current = box;
        setSelectionBox(box);

        // Live calculation of covered objects
        const covered = geoObjects.filter(o => isObjectCoveredByBox(o, box));
        if (setSelectedIds) {
          setSelectedIds(covered.map(o => o.id));
        }
      } else if (dragStartRef.current?.isMovingObjects) {
        const dx = effectivePos.x - dragStartRef.current.worldX;
        const dy = effectivePos.y - dragStartRef.current.worldY;

        const movingIds = new Set(
          (selectedIds && selectedIds.includes(dragStartRef.current.objectId))
            ? selectedIds
            : [dragStartRef.current.objectId]
        );

        setGeoObjects(prev => {
          const moved = prev.map(o => {
            if (!movingIds.has(o.id)) return o;
            if (o.type === 'point') return { ...o, x: Math.round((o.x + dx) * 10) / 10, y: Math.round((o.y + dy) * 10) / 10 };
            if (o.type === 'circle') return { ...o, cx: o.cx + dx, cy: o.cy + dy };
            if (o.type === 'line') return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
            if (o.type === 'rectangle') return { ...o, x: o.x + dx, y: o.y + dy };
            if (o.type === 'polygon' || o.type === 'triangle') return { ...o, pts: (o.pts || []).map(p => ({ x: p.x + dx, y: p.y + dy })) };
            if (o.type === 'ruler') return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
            if (o.type === 'protractor') return { ...o, x: o.x + dx, y: o.y + dy };
            return o;
          });
          return solveDependencies(moved);
        });

        dragStartRef.current.worldX = effectivePos.x;
        dragStartRef.current.worldY = effectivePos.y;
        dragStartRef.current.moved = true;
      }
    }

    // Dynamic Tooltips
    const unitName = gridSettings?.unit || 'cm';
    const unitScale = gridSettings?.gridSize || 40;

    if (activeTool === 'circle' && draftState && draftState.center) {
      const dx = effectivePos.x - draftState.center.x;
      const dy = effectivePos.y - draftState.center.y;
      const r = Math.hypot(dx, dy);
      const rUnit = (r / unitScale).toFixed(2);
      setFloatingTooltip(`Radius: ${rUnit} ${unitName}`);
    } else if (activeTool === 'point') {
      const xUnit = (effectivePos.x / unitScale).toFixed(2);
      const yUnit = (-effectivePos.y / unitScale).toFixed(2);
      setFloatingTooltip(`(${xUnit}${unitName}, ${yUnit}${unitName})`);
    } else if (activeTool === 'polygon') {
      if (draftState?.pts?.length > 0) {
        const pts = draftState.pts;
        const startPt = pts[0];
        const startScreen = toScreen(startPt.x, startPt.y);
        const distToStartPx = Math.hypot(sx - startScreen.x, sy - startScreen.y);
        if (distToStartPx <= 18 && pts.length >= 3) {
          setFloatingTooltip(`🎯 Click or Double-click to close Polygon (${pts.length} vertices)`);
        } else {
          setFloatingTooltip(`Vertex ${pts.length + 1} | Click to place`);
        }
      }
    } else if (activeTool === 'ruler') {
      if (draftState?.pt1) {
        const dx = effectivePos.x - draftState.pt1.x;
        const dy = effectivePos.y - draftState.pt1.y;
        const distWorld = Math.hypot(dx, dy);
        const distUnit = (distWorld / unitScale).toFixed(2);
        const angle = ((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1);
        setFloatingTooltip(`📏 ${distUnit} ${unitName} | ∠ ${angle}°`);
      }
    } else {
      setFloatingTooltip(null);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      if (dragStartRef.current?.isPan) {
        setIsPanning(false);
      } else if (selectionBoxRef.current?.isMarquee) {
        const box = selectionBoxRef.current;
        const dist = Math.hypot(box.screenX2 - box.screenX1, box.screenY2 - box.screenY1);
        if (dist > 3) {
          const covered = geoObjects.filter(o => isObjectCoveredByBox(o, box));
          if (setSelectedIds) setSelectedIds(covered.map(o => o.id));
        } else {
          if (setSelectedIds) setSelectedIds([]);
          else setSelectedId(null);
        }
        selectionBoxRef.current = null;
        setSelectionBox(null);
      } else if (dragStartRef.current?.isMovingObjects && dragStartRef.current?.moved) {
        pushHistory(geoObjects);
      }

      if (draftState) {
        const worldPos = cursorWorldPos;
        if (draftState.type === 'circle' && draftState.center) {
          const dx = worldPos.x - draftState.center.x;
          const dy = worldPos.y - draftState.center.y;
          const r = Math.hypot(dx, dy);
          if (r > 2) {
            pushHistory(geoObjects);
            const center = draftState.centerObj;
            const newCircle = {
              id: generateId('circle'),
              type: 'circle',
              centerPointId: center.id,
              cx: center.x,
              cy: center.y,
              r,
              color: DEFAULT_COLORS.circle,
              width: 2
            };
            const toAdd = geoObjects.some(o => o.id === center.id) ? [] : [center];
            setGeoObjects(prev => solveDependencies([...prev, ...toAdd, newCircle]));
          }
          setDraftState(null);
        } else if (draftState.type === 'rectangle' && draftState.start) {
          const w = worldPos.x - draftState.start.x;
          const h = worldPos.y - draftState.start.y;
          if (Math.abs(w) > 1 && Math.abs(h) > 1) {
            pushHistory(geoObjects);
            const newRect = {
              id: generateId('rect'),
              type: 'rectangle',
              x: draftState.start.x,
              y: draftState.start.y,
              w,
              h,
              fillColor: 'rgba(167, 139, 250, 0.12)',
              strokeColor: DEFAULT_COLORS.rectangle
            };
            setGeoObjects(prev => solveDependencies([...prev, newRect]));
          }
          setDraftState(null);
        } else if (draftState.type === 'ruler' && draftState.pt1) {
          const dist = Math.hypot(worldPos.x - draftState.pt1.x, worldPos.y - draftState.pt1.y);
          if (dist > 3) {
            pushHistory(geoObjects);
            const newRuler = {
              id: generateId('ruler'),
              type: 'ruler',
              x1: draftState.pt1.x,
              y1: draftState.pt1.y,
              x2: worldPos.x,
              y2: worldPos.y,
              color: DEFAULT_COLORS.ruler
            };
            setGeoObjects(prev => solveDependencies([...prev, newRuler]));
          }
          setDraftState(null);
        }
      }
      isDraggingRef.current = false;
    }
  };

  // Zoom on scroll wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * zoomFactor, 0.15), 10);
      const newOffsetX = sx - (sx - prev.offsetX) * (newScale / prev.scale);
      const newOffsetY = sy - (sy - prev.offsetY) * (newScale / prev.scale);
      return {
        offsetX: newOffsetX,
        offsetY: newOffsetY,
        scale: newScale
      };
    });
  };

  // Properties panel object update and deletion helpers
  const updateSelectedObj = useCallback((id, props) => {
    pushHistory(geoObjects);
    setGeoObjects(prev => solveDependencies(prev.map(o => o.id === id ? { ...o, ...props } : o)));
  }, [geoObjects, pushHistory, setGeoObjects]);

  const deleteSelectedObj = useCallback((id = null) => {
    pushHistory(geoObjects);
    const toDeleteIds = id ? ((selectedIds && selectedIds.includes(id)) ? selectedIds : [id]) : (selectedIds && selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []));
    const deleteSet = new Set(toDeleteIds);
    setGeoObjects(prev => solveDependencies(prev.filter(o => !deleteSet.has(o.id))));
    if (setSelectedIds) setSelectedIds([]);
    else setSelectedId(null);
  }, [geoObjects, pushHistory, selectedId, selectedIds, setGeoObjects, setSelectedId, setSelectedIds]);

  const selectedObjs = geoObjects.filter(o => (selectedIds || []).includes(o.id));
  const selectedObj = selectedObjs.length > 0 ? selectedObjs[0] : (selectedId ? geoObjects.find(o => o.id === selectedId) : null);

  return {
    canvasRef,
    transform,
    setTransform,
    cursorWorldPos,
    cursorScreenPos,
    floatingTooltip,
    snapInfo,
    draftState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleWheel,
    undo,
    redo,
    clearCanvas,
    toScreen,
    toWorld,
    selectedId,
    setSelectedId,
    selectedIds,
    setSelectedIds,
    selectedObj,
    selectedObjs,
    updateSelectedObj,
    deleteSelectedObj,
    isPanning,
    selectionBox,
    hoveredId,
    showShortcutsModal,
    setShowShortcutsModal
  };
}

// Math Utility Helpers
function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function pointInTriangle(p, p0, p1, p2) {
  const A = 0.5 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
  const sign = A < 0 ? -1 : 1;
  const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
  const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
  return s > 0 && t > 0 && s + t < 2 * A * sign;
}

// Comprehensive Collision / Containment tester for Box Selection
function isObjectCoveredByBox(obj, box) {
  if (!box || !obj) return false;
  const minX = Math.min(box.x1, box.x2);
  const maxX = Math.max(box.x1, box.x2);
  const minY = Math.min(box.y1, box.y2);
  const maxY = Math.max(box.y1, box.y2);

  const ptInBox = (x, y) => x >= minX && x <= maxX && y >= minY && y <= maxY;

  const segmentsIntersect = (p1, p2, p3, p4) => {
    const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
  };

  const segInBox = (x1, y1, x2, y2) => {
    if (ptInBox(x1, y1) || ptInBox(x2, y2)) return true;
    const p1 = { x: x1, y: y1 };
    const p2 = { x: x2, y: y2 };
    const bTL = { x: minX, y: minY };
    const bTR = { x: maxX, y: minY };
    const bBL = { x: minX, y: maxY };
    const bBR = { x: maxX, y: maxY };
    return segmentsIntersect(p1, p2, bTL, bTR) ||
           segmentsIntersect(p1, p2, bTR, bBR) ||
           segmentsIntersect(p1, p2, bBR, bBL) ||
           segmentsIntersect(p1, p2, bBL, bTL);
  };

  switch (obj.type) {
    case 'point':
      return ptInBox(obj.x, obj.y);

    case 'line':
    case 'ruler':
      return segInBox(obj.x1, obj.y1, obj.x2, obj.y2);

    case 'circle': {
      if (ptInBox(obj.cx, obj.cy)) return true;
      const closestX = Math.max(minX, Math.min(obj.cx, maxX));
      const closestY = Math.max(minY, Math.min(obj.cy, maxY));
      const d = Math.hypot(obj.cx - closestX, obj.cy - closestY);
      return d <= (obj.r || 0);
    }

    case 'rectangle': {
      const rx1 = Math.min(obj.x, obj.x + (obj.w || 0));
      const rx2 = Math.max(obj.x, obj.x + (obj.w || 0));
      const ry1 = Math.min(obj.y, obj.y + (obj.h || 0));
      const ry2 = Math.max(obj.y, obj.y + (obj.h || 0));
      return !(rx2 < minX || rx1 > maxX || ry2 < minY || ry1 > maxY);
    }

    case 'polygon':
    case 'triangle': {
      const pts = obj.pts || [];
      if (pts.length === 0) return false;
      if (pts.some(p => ptInBox(p.x, p.y))) return true;
      for (let i = 0; i < pts.length; i++) {
        const pA = pts[i];
        const pB = pts[(i + 1) % pts.length];
        if (segInBox(pA.x, pA.y, pB.x, pB.y)) return true;
      }
      const centerBox = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
      return pointInPolygon(centerBox, pts);
    }

    case 'angle':
    case 'rightangle':
      return ptInBox(obj.vx, obj.vy);

    case 'protractor':
      return ptInBox(obj.x, obj.y) || Math.hypot(obj.x - (minX + maxX) / 2, obj.y - (minY + maxY) / 2) < 70;

    case 'label':
      return ptInBox(obj.x, obj.y);

    default:
      return false;
  }
}
