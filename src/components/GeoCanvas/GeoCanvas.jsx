import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from '../../canvas/useCanvas';
import { useApp } from '../../context/AppContext';
import PropertiesPanel from '../PropertiesPanel/PropertiesPanel';
import ContextHelp from '../ContextHelp/ContextHelp';
import ShortcutsModal from '../ShortcutsModal/ShortcutsModal';
import styles from './GeoCanvas.module.css';

export default function GeoCanvas({ onRegisterControls }) {
  const { activeTool, gridSettings, setGridSettings, geoObjects, registerCanvasElement } = useApp();
  const {
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
    handlePointerCancel,
    handleDoubleClick,
    handleWheel,
    undo,
    redo,
    clearCanvas,
    selectedId,
    setSelectedId,
    selectedIds = [],
    setSelectedIds,
    selectedObj,
    selectedObjs = [],
    updateSelectedObj,
    deleteSelectedObj,
    isPanning,
    selectionBox,
    hoveredId,
    showShortcutsModal,
    setShowShortcutsModal
  } = useCanvas();

  const getCanvasCursor = () => {
    if (activeTool === 'hand') {
      return isPanning ? 'grabbing' : 'grab';
    }
    if (activeTool === 'select') {
      if (selectionBox) return 'crosshair';
      if (hoveredId) return 'pointer';
      return 'default';
    }
    if (activeTool === 'eraser') {
      return 'pointer';
    }
    return 'crosshair';
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const topRulerRef = useRef(null);
  const leftRulerRef = useRef(null);

  // Pass control triggers back if requested by parent layout
  useEffect(() => {
    if (onRegisterControls) {
      onRegisterControls({ undo, redo, clearCanvas });
    }
  }, [onRegisterControls, undo, redo, clearCanvas]);

  // Register canvas element for cloud thumbnail snapshots
  useEffect(() => {
    if (canvasRef.current && registerCanvasElement) {
      registerCanvasElement(canvasRef.current);
    }
  }, [canvasRef, registerCanvasElement]);

  const toolName = activeTool.charAt(0).toUpperCase() + activeTool.slice(1);
  const zoomPercent = Math.round(transform.scale * 100);

  const units = ['cm', 'mm', 'px', 'in'];
  const cycleUnit = () => {
    const curIdx = units.indexOf(gridSettings.unit || 'cm');
    const nextUnit = units[(curIdx + 1) % units.length];
    setGridSettings(prev => ({ ...prev, unit: nextUnit }));
  };

  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (setTransform) {
      setTransform({
        offsetX: rect.width / 2,
        offsetY: rect.height / 2,
        scale: 1.2
      });
    }
  };

  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 8)
    }));
  };

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.2)
    }));
  };

  const fitToScreen = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!geoObjects || geoObjects.length === 0) {
      resetView();
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    geoObjects.forEach(o => {
      if (o.type === 'point') {
        minX = Math.min(minX, o.x); maxX = Math.max(maxX, o.x);
        minY = Math.min(minY, o.y); maxY = Math.max(maxY, o.y);
      } else if (o.type === 'line' || o.type === 'ruler') {
        minX = Math.min(minX, o.x1, o.x2); maxX = Math.max(maxX, o.x1, o.x2);
        minY = Math.min(minY, o.y1, o.y2); maxY = Math.max(maxY, o.y1, o.y2);
      } else if (o.type === 'circle') {
        minX = Math.min(minX, o.cx - o.r); maxX = Math.max(maxX, o.cx + o.r);
        minY = Math.min(minY, o.cy - o.r); maxY = Math.max(maxY, o.cy + o.r);
      } else if (o.type === 'polygon' || o.type === 'triangle') {
        (o.pts || []).forEach(p => {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        });
      } else if (o.type === 'rectangle') {
        minX = Math.min(minX, o.x, o.x + o.w); maxX = Math.max(maxX, o.x, o.x + o.w);
        minY = Math.min(minY, o.y, o.y + o.h); maxY = Math.max(maxY, o.y, o.y + o.h);
      }
    });
    if (!isFinite(minX) || !isFinite(maxX)) {
      resetView();
      return;
    }
    const padding = 80;
    const boxW = Math.max(maxX - minX, 40);
    const boxH = Math.max(maxY - minY, 40);
    const scaleX = (rect.width - padding * 2) / boxW;
    const scaleY = (rect.height - padding * 2) / boxH;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 3);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    setTransform({
      scale: newScale,
      offsetX: rect.width / 2 - midX * newScale,
      offsetY: rect.height / 2 - midY * newScale
    });
  };

  // Render Top & Left Rulers
  useEffect(() => {
    if (!gridSettings?.showRulers) return;

    const topCanvas = topRulerRef.current;
    const leftCanvas = leftRulerRef.current;
    const mainCanvas = canvasRef.current;
    if (!topCanvas || !leftCanvas || !mainCanvas) return;

    const mainRect = mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const topW = mainRect.width;
    const topH = 24;
    const leftW = 24;
    const leftH = mainRect.height;

    if (topCanvas.width !== topW * dpr || topCanvas.height !== topH * dpr) {
      topCanvas.width = topW * dpr;
      topCanvas.height = topH * dpr;
    }
    if (leftCanvas.width !== leftW * dpr || leftCanvas.height !== leftH * dpr) {
      leftCanvas.width = leftW * dpr;
      leftCanvas.height = leftH * dpr;
    }

    const gridStep = gridSettings.gridSize || 40;
    const scale = transform.scale;
    const stepPx = gridStep * scale;

    let multiplier = 1;
    if (stepPx < 25) multiplier = 5;
    else if (stepPx < 50) multiplier = 2;
    else if (stepPx > 180) multiplier = 0.5;

    const effectiveStepPx = stepPx * multiplier;

    // --- 1. Draw Top Ruler ---
    const tCtx = topCanvas.getContext('2d');
    tCtx.save();
    tCtx.scale(dpr, dpr);
    tCtx.clearRect(0, 0, topW, topH);

    tCtx.fillStyle = '#1e242e';
    tCtx.fillRect(0, 0, topW, topH);
    tCtx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    tCtx.lineWidth = 1;
    tCtx.beginPath();
    tCtx.moveTo(0, topH - 0.5);
    tCtx.lineTo(topW, topH - 0.5);
    tCtx.stroke();

    tCtx.fillStyle = 'rgba(203, 213, 225, 0.75)';
    tCtx.font = '500 9px "JetBrains Mono", monospace';
    tCtx.textAlign = 'left';
    tCtx.textBaseline = 'top';

    const startIdxX = Math.floor(-transform.offsetX / effectiveStepPx) - 1;
    const endIdxX = Math.ceil((topW - transform.offsetX) / effectiveStepPx) + 1;

    for (let i = startIdxX; i <= endIdxX; i++) {
      const sx = Math.round(transform.offsetX + i * effectiveStepPx);
      if (sx < 0 || sx > topW) continue;

      tCtx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      tCtx.beginPath();
      tCtx.moveTo(sx + 0.5, 12);
      tCtx.lineTo(sx + 0.5, topH);
      tCtx.stroke();

      const unitVal = Number((i * multiplier).toFixed(1));
      tCtx.fillText(`${unitVal}`, sx + 3, 2);

      tCtx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      const midX = Math.round(sx + effectiveStepPx / 2);
      if (midX >= 0 && midX <= topW) {
        tCtx.beginPath();
        tCtx.moveTo(midX + 0.5, 17);
        tCtx.lineTo(midX + 0.5, topH);
        tCtx.stroke();
      }
    }

    if (cursorScreenPos.x >= 0 && cursorScreenPos.x <= topW) {
      tCtx.strokeStyle = '#f0a500';
      tCtx.lineWidth = 1.5;
      tCtx.beginPath();
      tCtx.moveTo(cursorScreenPos.x + 0.5, 0);
      tCtx.lineTo(cursorScreenPos.x + 0.5, topH);
      tCtx.stroke();

      tCtx.fillStyle = '#f0a500';
      tCtx.beginPath();
      tCtx.moveTo(cursorScreenPos.x + 0.5, topH - 1);
      tCtx.lineTo(cursorScreenPos.x - 3, topH - 5);
      tCtx.lineTo(cursorScreenPos.x + 4, topH - 5);
      tCtx.closePath();
      tCtx.fill();
    }
    tCtx.restore();

    // --- 2. Draw Left Ruler ---
    const lCtx = leftCanvas.getContext('2d');
    lCtx.save();
    lCtx.scale(dpr, dpr);
    lCtx.clearRect(0, 0, leftW, leftH);

    lCtx.fillStyle = '#1e242e';
    lCtx.fillRect(0, 0, leftW, leftH);
    lCtx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    lCtx.lineWidth = 1;
    lCtx.beginPath();
    lCtx.moveTo(leftW - 0.5, 0);
    lCtx.lineTo(leftW - 0.5, leftH);
    lCtx.stroke();

    lCtx.fillStyle = 'rgba(203, 213, 225, 0.75)';
    lCtx.font = '500 9px "JetBrains Mono", monospace';
    lCtx.textAlign = 'right';
    lCtx.textBaseline = 'middle';

    const startIdxY = Math.floor(-transform.offsetY / effectiveStepPx) - 1;
    const endIdxY = Math.ceil((leftH - transform.offsetY) / effectiveStepPx) + 1;

    for (let j = startIdxY; j <= endIdxY; j++) {
      const sy = Math.round(transform.offsetY + j * effectiveStepPx);
      if (sy < 0 || sy > leftH) continue;

      lCtx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      lCtx.beginPath();
      lCtx.moveTo(12, sy + 0.5);
      lCtx.lineTo(leftW, sy + 0.5);
      lCtx.stroke();

      const unitVal = Number((-j * multiplier).toFixed(1));
      lCtx.fillText(`${unitVal}`, 10, sy);

      lCtx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      const midY = Math.round(sy + effectiveStepPx / 2);
      if (midY >= 0 && midY <= leftH) {
        lCtx.beginPath();
        lCtx.moveTo(17, midY + 0.5);
        lCtx.lineTo(leftW, midY + 0.5);
        lCtx.stroke();
      }
    }

    if (cursorScreenPos.y >= 0 && cursorScreenPos.y <= leftH) {
      lCtx.strokeStyle = '#f0a500';
      lCtx.lineWidth = 1.5;
      lCtx.beginPath();
      lCtx.moveTo(0, cursorScreenPos.y + 0.5);
      lCtx.lineTo(leftW, cursorScreenPos.y + 0.5);
      lCtx.stroke();

      lCtx.fillStyle = '#f0a500';
      lCtx.beginPath();
      lCtx.moveTo(leftW - 1, cursorScreenPos.y + 0.5);
      lCtx.lineTo(leftW - 5, cursorScreenPos.y - 3);
      lCtx.lineTo(leftW - 5, cursorScreenPos.y + 3);
      lCtx.closePath();
      lCtx.fill();
    }
    lCtx.restore();

  }, [transform, cursorScreenPos, gridSettings]);

  const hasRulers = !!gridSettings?.showRulers;

  return (
    <div className={styles.canvasContainer}>
      {hasRulers && (
        <>
          <button
            type="button"
            className={styles.rulerCorner}
            onClick={cycleUnit}
            title={`Current Unit: ${gridSettings.unit || 'cm'}. Click to cycle.`}
          >
            {gridSettings.unit || 'cm'}
          </button>
          <canvas ref={topRulerRef} className={styles.topRuler} />
          <canvas ref={leftRulerRef} className={styles.leftRuler} />
        </>
      )}

      {/* Contextual Help Banner for Active Tool */}
      <ContextHelp activeTool={activeTool} isDrafting={!!draftState} />

      {/* Student Properties Panel for Selected Object(s) */}
      {(selectedObj || (selectedObjs && selectedObjs.length > 0)) && (
        <PropertiesPanel
          selectedObj={selectedObj}
          selectedObjs={selectedObjs}
          onUpdateObj={updateSelectedObj}
          onDeleteObj={deleteSelectedObj}
          onClose={() => {
            if (setSelectedIds) setSelectedIds([]);
            else setSelectedId(null);
          }}
        />
      )}

      {/* Floating Canvas Controls Bar */}
      <div className={styles.quickGridBar}>
        {/* Zoom Controls */}
        <button
          type="button"
          className={styles.quickBtn}
          onClick={zoomIn}
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.quickBtn}
          onClick={zoomOut}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.quickBtn}
          onClick={fitToScreen}
          title="Fit to Screen — Zooms to show all objects"
          aria-label="Fit to Screen"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.quickBtn}
          onClick={resetView}
          title="Reset View — Reset center & 100% scale"
          aria-label="Reset View"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <span className={styles.barDivider} />

        {/* Display Toggles */}
        <button
          type="button"
          className={`${styles.quickBtn} ${gridSettings.showGrid ? styles.quickBtnActive : ''}`}
          onClick={() => setGridSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
          title="Grid — Show or hide canvas grid"
          aria-label="Toggle Grid"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          Grid
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${gridSettings.showAxes ? styles.quickBtnActive : ''}`}
          onClick={() => setGridSettings(prev => ({ ...prev, showAxes: !prev.showAxes }))}
          title="Axes — Show or hide X and Y coordinate axes"
          aria-label="Toggle Axes"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          Axes
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${gridSettings.snapToGrid ? styles.quickBtnActive : ''}`}
          onClick={() => setGridSettings(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }))}
          title="Snap — Toggle snapping to grid, points, midpoints and intersections"
          aria-label="Toggle Snap"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          Snap
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${gridSettings.showRulers ? styles.quickBtnActive : ''}`}
          onClick={() => setGridSettings(prev => ({ ...prev, showRulers: !prev.showRulers }))}
          title="Rulers — Show or hide top and left canvas rulers"
          aria-label="Toggle Rulers"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 4v16h20V4H2zm18 14H4V6h16v12z" />
            <line x1="8" y1="6" x2="8" y2="10" />
            <line x1="12" y1="6" x2="12" y2="12" />
            <line x1="16" y1="6" x2="16" y2="10" />
          </svg>
          Rulers
        </button>

        <span className={styles.barDivider} />

        <button
          type="button"
          className={`${styles.quickBtn} ${showShortcutsModal ? styles.quickBtnActive : ''}`}
          onClick={() => setShowShortcutsModal(!showShortcutsModal)}
          title="Shortcuts (?) — View keyboard shortcuts for all tools"
          aria-label="Keyboard Shortcuts"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
          </svg>
          Shortcuts
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${showSettingsModal ? styles.quickBtnActive : ''}`}
          onClick={() => setShowSettingsModal(!showSettingsModal)}
          title="Settings — Customize grid style, paper spacing, and units"
          aria-label="Grid Settings"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
      </div>

      {/* Grid Settings Popover Modal */}
      {showSettingsModal && (
        <div className={styles.gridModal}>
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              Student Grid & Ruler Setup
            </span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setShowSettingsModal(false)}
              title="Close settings"
            >
              ✕
            </button>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Show Grid</span>
            <label className={styles.toggleSwitch} title="Toggle grid lines">
              <input
                type="checkbox"
                checked={gridSettings.showGrid}
                onChange={(e) => setGridSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                className={styles.toggleInput}
              />
            </label>
          </div>

          <div style={{ marginBottom: '6px' }}>
            <span className={styles.settingLabel}>Grid Paper Style</span>
          </div>
          <div className={styles.styleGrid}>
            {[
              { id: 'subdivided', label: 'Graph Paper' },
              { id: 'lines', label: 'Standard Lines' },
              { id: 'dots', label: 'Dot Grid' },
              { id: 'isometric', label: 'Isometric 3D' }
            ].map(style => (
              <button
                key={style.id}
                type="button"
                className={`${styles.styleOption} ${gridSettings.gridStyle === style.id ? styles.styleOptionActive : ''}`}
                onClick={() => setGridSettings(prev => ({ ...prev, gridStyle: style.id }))}
                title={`Switch to ${style.label} style`}
              >
                {style.label}
              </button>
            ))}
          </div>

          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Cell Spacing</span>
            <select
              value={gridSettings.gridSize}
              onChange={(e) => setGridSettings(prev => ({ ...prev, gridSize: Number(e.target.value) }))}
              className={styles.selectInput}
              title="Select grid cell spacing"
            >
              <option value="20">Fine (20px)</option>
              <option value="30">Medium (30px)</option>
              <option value="40">Standard 1 cm (40px)</option>
              <option value="60">Large (60px)</option>
              <option value="80">Wide 2 cm (80px)</option>
            </select>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Measurement Unit</span>
            <select
              value={gridSettings.unit || 'cm'}
              onChange={(e) => setGridSettings(prev => ({ ...prev, unit: e.target.value }))}
              className={styles.selectInput}
              title="Select measurement unit"
            >
              <option value="cm">Centimeters (cm)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="px">Pixels (px)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Coordinate Axes (X / Y)</span>
            <label className={styles.toggleSwitch} title="Show or hide X and Y axes">
              <input
                type="checkbox"
                checked={gridSettings.showAxes}
                onChange={(e) => setGridSettings(prev => ({ ...prev, showAxes: e.target.checked }))}
                className={styles.toggleInput}
              />
            </label>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Snap Points to Grid</span>
            <label className={styles.toggleSwitch} title="Snap drawing points to nearest grid intersection">
              <input
                type="checkbox"
                checked={gridSettings.snapToGrid}
                onChange={(e) => setGridSettings(prev => ({ ...prev, snapToGrid: e.target.checked }))}
                className={styles.toggleInput}
              />
            </label>
          </div>

          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Photoshop Rulers</span>
            <label className={styles.toggleSwitch} title="Show or hide top and left measurement rulers">
              <input
                type="checkbox"
                checked={gridSettings.showRulers}
                onChange={(e) => setGridSettings(prev => ({ ...prev, showRulers: e.target.checked }))}
                className={styles.toggleInput}
              />
            </label>
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={resetView}
              className={styles.quickBtn}
              style={{ width: '100%', justifyContent: 'center', background: 'var(--bg3)' }}
              title="Reset view zoom to 100% and center"
            >
              Reset Center & Zoom (100%)
            </button>
          </div>
        </div>
      )}

      {/* Main Geometry Canvas Area */}
      <div className={hasRulers ? styles.canvasWrapperWithRulers : styles.canvasWrapperFull}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ cursor: getCanvasCursor() }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
        />
      </div>

      {/* Floating Selection Quick Action Pill */}
      {selectedIds && selectedIds.length > 0 && (
        <div className={styles.selectionActionBar}>
          <div className={styles.selectionInfo}>
            <span className={styles.selectionBadge}>{selectedIds.length}</span>
            <span>{selectedIds.length === 1 ? 'item selected' : 'items selected'}</span>
          </div>
          <button
            type="button"
            className={styles.selectionDeleteBtn}
            onClick={() => deleteSelectedObj()}
            title="Delete all selected items (Del / Backspace)"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
          <button
            type="button"
            className={styles.selectionClearBtn}
            onClick={() => {
              if (setSelectedIds) setSelectedIds([]);
              else setSelectedId(null);
            }}
            title="Deselect all (Escape)"
          >
            ✕
          </button>
        </div>
      )}

      {floatingTooltip && (
        <div
          className={styles.floatingTooltip}
          style={{
            left: `${cursorScreenPos.x + (hasRulers ? 38 : 14)}px`,
            top: `${cursorScreenPos.y + (hasRulers ? 38 : 14)}px`
          }}
        >
          {floatingTooltip}
        </div>
      )}

      {/* Status Bar with Dynamic Indicators */}
      <div className={styles.statusBar} style={hasRulers ? { left: '36px' } : { left: '12px' }}>
        <span>x: {cursorWorldPos.x.toFixed(1)} &nbsp; y: {cursorWorldPos.y.toFixed(1)}</span>
        <span className={styles.divider}>|</span>
        <span>Zoom: {zoomPercent}%</span>
        <span className={styles.divider}>|</span>
        <span>Tool: {toolName}</span>
        {snapInfo && (
          <>
            <span className={styles.divider}>|</span>
            <span style={{ color: '#f0a500', fontWeight: 600 }}>Snap: {snapInfo.label}</span>
          </>
        )}
        {selectedIds && selectedIds.length > 1 ? (
          <>
            <span className={styles.divider}>|</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Selected: {selectedIds.length} items</span>
          </>
        ) : selectedObj ? (
          <>
            <span className={styles.divider}>|</span>
            <span style={{ color: '#38bdf8' }}>Selected: {selectedObj.type} {selectedObj.label || ''}</span>
          </>
        ) : null}
      </div>
      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
