import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculatePolygonArea, calculatePolygonPerimeter, getPolygonName } from '../../canvas/geoEngine';
import styles from './PropertiesPanel.module.css';

export default function PropertiesPanel({ selectedObj, selectedObjs = [], onUpdateObj, onDeleteObj, onClose }) {
  const { gridSettings } = useApp();
  const unit = gridSettings?.unit || 'cm';
  const unitScale = gridSettings?.gridSize || 40;

  if (!selectedObj && (!selectedObjs || selectedObjs.length === 0)) return null;

  const isMulti = selectedObjs && selectedObjs.length > 1;

  const handleLabelChange = (e) => {
    if (selectedObj) {
      onUpdateObj(selectedObj.id, { label: e.target.value });
    }
  };

  const handleColorChange = (newColor) => {
    if (isMulti) {
      selectedObjs.forEach(o => {
        if (o.type === 'polygon' || o.type === 'triangle' || o.type === 'rectangle') {
          onUpdateObj(o.id, { strokeColor: newColor });
        } else {
          onUpdateObj(o.id, { color: newColor });
        }
      });
      return;
    }
    if (selectedObj) {
      if (selectedObj.type === 'polygon' || selectedObj.type === 'triangle' || selectedObj.type === 'rectangle') {
        onUpdateObj(selectedObj.id, { strokeColor: newColor });
      } else {
        onUpdateObj(selectedObj.id, { color: newColor });
      }
    }
  };

  const palette = ['#ffffff', '#f0a500', '#38bdf8', '#3dd68c', '#ff7b35', '#a78bfa', '#f87171'];

  // Compute object specific metrics
  let content = null;
  let title = 'Object';

  if (isMulti) {
    const typeCounts = {};
    selectedObjs.forEach(o => {
      const t = o.type.charAt(0).toUpperCase() + o.type.slice(1);
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    title = `${selectedObjs.length} Items Selected`;
    content = (
      <>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          All covered items:
        </div>
        {Object.entries(typeCounts).map(([typeName, count]) => (
          <div key={typeName} className={styles.propRow}>
            <span className={styles.propLabel}>{typeName}</span>
            <span className={styles.propValue}>{count}</span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onDeleteObj()}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '7px 12px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          title="Delete all selected items (Del / Backspace)"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          Delete All Selected ({selectedObjs.length})
        </button>
      </>
    );
  } else if (selectedObj?.type === 'point') {
    title = `Point ${selectedObj.label || ''}`;
    const xUnit = (selectedObj.x / unitScale).toFixed(2);
    const yUnit = (-selectedObj.y / unitScale).toFixed(2);
    content = (
      <>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Label</span>
          <input
            type="text"
            className={styles.labelInput}
            value={selectedObj.label || ''}
            onChange={handleLabelChange}
            placeholder="A, B, C..."
            title="Edit point label"
          />
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>X</span>
          <span className={styles.propValue}>{xUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Y</span>
          <span className={styles.propValue}>{yUnit} {unit}</span>
        </div>
        {selectedObj.dependency && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Type</span>
            <span className={styles.propValue} style={{ color: 'var(--accent)' }}>
              {selectedObj.dependency.type === 'midpoint' ? 'Midpoint' : 'Intersection'}
            </span>
          </div>
        )}
      </>
    );
  } else if (selectedObj.type === 'line') {
    title = selectedObj.dependency?.type ? `${selectedObj.dependency.type.replace('_', ' ').toUpperCase()} Line` : 'Line Segment';
    const dx = selectedObj.x2 - selectedObj.x1;
    const dy = selectedObj.y2 - selectedObj.y1;
    const lenPx = Math.hypot(dx, dy);
    const lenUnit = (lenPx / unitScale).toFixed(2);
    const angleDeg = ((-Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1);
    content = (
      <>
        {selectedObj.label !== undefined && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Label</span>
            <input
              type="text"
              className={styles.labelInput}
              value={selectedObj.label || ''}
              onChange={handleLabelChange}
              placeholder="e.g. AB"
              title="Edit line label"
            />
          </div>
        )}
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Length</span>
          <span className={styles.propValue}>{lenUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Angle</span>
          <span className={styles.propValue}>{angleDeg}°</span>
        </div>
      </>
    );
  } else if (selectedObj.type === 'circle') {
    title = 'Circle';
    const rUnit = (selectedObj.r / unitScale).toFixed(2);
    const areaUnit = (Math.PI * (selectedObj.r / unitScale) ** 2).toFixed(2);
    const circUnit = (2 * Math.PI * (selectedObj.r / unitScale)).toFixed(2);
    const cxUnit = (selectedObj.cx / unitScale).toFixed(2);
    const cyUnit = (-selectedObj.cy / unitScale).toFixed(2);
    content = (
      <>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Center</span>
          <span className={styles.propValue}>({cxUnit}, {cyUnit}) {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Radius</span>
          <span className={styles.propValue}>{rUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Circumference</span>
          <span className={styles.propValue}>{circUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Area</span>
          <span className={styles.propValue}>{areaUnit} {unit}²</span>
        </div>
      </>
    );
  } else if (selectedObj.type === 'polygon' || selectedObj.type === 'triangle') {
    const pts = selectedObj.pts || [];
    const n = pts.length;
    title = getPolygonName(n);
    const areaPx = calculatePolygonArea(pts);
    const perimPx = calculatePolygonPerimeter(pts);
    const areaUnit = (areaPx / (unitScale ** 2)).toFixed(2);
    const perimUnit = (perimPx / unitScale).toFixed(2);
    content = (
      <>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Vertices</span>
          <span className={styles.propValue}>{n} sides</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Perimeter</span>
          <span className={styles.propValue}>{perimUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Area</span>
          <span className={styles.propValue}>{areaUnit} {unit}²</span>
        </div>
      </>
    );
  } else if (selectedObj.type === 'rectangle') {
    title = 'Rectangle';
    const wUnit = (Math.abs(selectedObj.w) / unitScale).toFixed(2);
    const hUnit = (Math.abs(selectedObj.h) / unitScale).toFixed(2);
    const perimUnit = (2 * (Math.abs(selectedObj.w) + Math.abs(selectedObj.h)) / unitScale).toFixed(2);
    const areaUnit = ((Math.abs(selectedObj.w) * Math.abs(selectedObj.h)) / (unitScale ** 2)).toFixed(2);
    content = (
      <>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Width × Height</span>
          <span className={styles.propValue}>{wUnit} × {hUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Perimeter</span>
          <span className={styles.propValue}>{perimUnit} {unit}</span>
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Area</span>
          <span className={styles.propValue}>{areaUnit} {unit}²</span>
        </div>
      </>
    );
  } else if (selectedObj.type === 'angle') {
    title = 'Angle';
    const a1 = Math.atan2(selectedObj.r1y - selectedObj.vy, selectedObj.r1x - selectedObj.vx);
    const a2 = Math.atan2(selectedObj.r2y - selectedObj.vy, selectedObj.r2x - selectedObj.vx);
    let diffDeg = Math.round(Math.abs((a2 - a1) * 180 / Math.PI));
    if (diffDeg > 180) diffDeg = 360 - diffDeg;
    content = (
      <div className={styles.propRow}>
        <span className={styles.propLabel}>Measurement</span>
        <span className={styles.propValue}>{diffDeg}°</span>
      </div>
    );
  } else if (selectedObj.type === 'ruler') {
    title = 'Distance Measurement';
    const dx = selectedObj.x2 - selectedObj.x1;
    const dy = selectedObj.y2 - selectedObj.y1;
    const distPx = Math.hypot(dx, dy);
    const distUnit = (distPx / unitScale).toFixed(2);
    content = (
      <div className={styles.propRow}>
        <span className={styles.propLabel}>Distance</span>
        <span className={styles.propValue}>{distUnit} {unit}</span>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {title}
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            onClick={() => onDeleteObj(selectedObj?.id)}
            title={isMulti ? "Delete all selected objects (Del / Backspace)" : "Delete this object (Del / Backspace)"}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            title="Close properties panel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.propsList}>
        {content}
      </div>

      <div className={styles.colorPickerRow}>
        <span className={styles.propLabel}>Color</span>
        <div className={styles.colorDots}>
          {palette.map(c => (
            <button
              key={c}
              type="button"
              className={styles.colorDot}
              style={{ background: c }}
              onClick={() => handleColorChange(c)}
              title={`Set color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
