import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getShortcut } from '../../canvas/toolShortcuts';
import styles from './Toolbar.module.css';

export default function Toolbar({ onUndo, onRedo, onClear }) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    clearCanvas,
    selectedIds,
    setSelectedIds,
    geoObjects,
    setGeoObjects,
    pushHistory
  } = useApp();
  const handleUndo = onUndo || undo;
  const handleRedo = onRedo || redo;
  const handleClear = onClear || clearCanvas;

  const handleEraserOrDelete = () => {
    if (selectedIds && selectedIds.length > 0) {
      pushHistory(geoObjects);
      const toDelete = new Set(selectedIds);
      setGeoObjects(prev => prev.filter(o => !toDelete.has(o.id)));
      setSelectedIds([]);
    } else {
      setActiveTool('eraser');
    }
  };

  const toolGroups = [
    {
      group: 'DRAW',
      tools: [
        {
          id: 'point',
          label: 'Point',
          description: 'Create a point on the canvas.',
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
            </svg>
          )
        },
        {
          id: 'line',
          label: 'Segment / Line',
          description: 'Draw a straight line between two points.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="20" x2="20" y2="4" />
              <circle cx="4" cy="20" r="2.5" fill="currentColor" />
              <circle cx="20" cy="4" r="2.5" fill="currentColor" />
            </svg>
          )
        },
        {
          id: 'circle',
          label: 'Circle',
          description: 'Draw a circle using a center and radius point.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          )
        },
        {
          id: 'circle3p',
          label: 'Three-Point Circle',
          description: 'Create a circle passing through three points.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
              <circle cx="12" cy="4" r="2" fill="currentColor" />
              <circle cx="4" cy="16" r="2" fill="currentColor" />
              <circle cx="20" cy="16" r="2" fill="currentColor" />
            </svg>
          )
        },
        {
          id: 'regpoly',
          label: 'Regular Polygon',
          description: 'Create a shape with equal sides and equal angles.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 3 20.5 9.2 17.3 19 6.7 19 3.5 9.2" />
            </svg>
          )
        },
        {
          id: 'polygon',
          label: 'Polygon',
          description: 'Draw an arbitrary closed polygon with any number of sides.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 3 21 8 18 19 6 19 3 8" />
              <circle cx="12" cy="3" r="1.5" fill="currentColor" />
              <circle cx="21" cy="8" r="1.5" fill="currentColor" />
              <circle cx="18" cy="19" r="1.5" fill="currentColor" />
              <circle cx="6" cy="19" r="1.5" fill="currentColor" />
              <circle cx="3" cy="8" r="1.5" fill="currentColor" />
            </svg>
          )
        },
        {
          id: 'triangle',
          label: 'Triangle',
          description: 'Draw a triangle from 3 points.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 4 20 20 4 20" />
            </svg>
          )
        },
        {
          id: 'rectangle',
          label: 'Rectangle',
          description: 'Draw a rectangle from corner to corner.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="5" width="16" height="14" rx="1" />
            </svg>
          )
        }
      ]
    },
    {
      group: 'CONSTRUCT',
      tools: [
        {
          id: 'midpoint',
          label: 'Midpoint',
          description: 'Finds the exact middle of a line segment.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="20" x2="21" y2="4" />
              <circle cx="3" cy="20" r="2" fill="currentColor" />
              <circle cx="21" cy="4" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="3" fill="#f0a500" stroke="#f0a500" />
            </svg>
          )
        },
        {
          id: 'perpendicular',
          label: 'Perpendicular',
          description: 'Creates a line at 90° to another line.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="19" x2="21" y2="19" />
              <line x1="12" y1="3" x2="12" y2="19" />
              <rect x="12" y="15" width="4" height="4" />
            </svg>
          )
        },
        {
          id: 'parallel',
          label: 'Parallel',
          description: 'Creates a line that never meets another line.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="17" x2="21" y2="17" />
              <path d="M10 5l2 2-2 2M10 15l2 2-2 2" strokeWidth="1.5" />
            </svg>
          )
        },
        {
          id: 'perp_bisector',
          label: 'Perpendicular Bisector',
          description: 'Divides a line into two equal parts at 90°.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="17" x2="21" y2="17" />
              <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="3 2" />
              <rect x="12" y="13" width="4" height="4" />
              <line x1="7" y1="15" x2="7" y2="19" />
              <line x1="17" y1="15" x2="17" y2="19" />
            </svg>
          )
        },
        {
          id: 'angle_bisector',
          label: 'Angle Bisector',
          description: 'Divides an angle into two equal angles.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20L20 20" />
              <path d="M4 20L18 4" />
              <line x1="4" y1="20" x2="20" y2="11" strokeDasharray="3 2" stroke="#f0a500" />
              <path d="M10 20 A 6 6 0 0 0 11 16" strokeWidth="1" />
            </svg>
          )
        },
        {
          id: 'intersection',
          label: 'Intersection',
          description: 'Marks where two objects meet.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="4" y1="20" x2="20" y2="4" />
              <circle cx="12" cy="12" r="3.5" fill="#f0a500" stroke="#f0a500" />
            </svg>
          )
        },
        {
          id: 'tangent',
          label: 'Tangent',
          description: 'Draws a line that touches a circle at one point.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="14" r="7" />
              <line x1="3" y1="7" x2="21" y2="7" stroke="#f0a500" />
              <circle cx="12" cy="7" r="2" fill="#f0a500" stroke="#f0a500" />
            </svg>
          )
        }
      ]
    },
    {
      group: 'MEASURE',
      tools: [
        {
          id: 'ruler',
          label: 'Distance / Ruler',
          description: 'Measures the distance between two points.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 17l14-14 4 4-14 14-4-4z" />
              <line x1="7" y1="5" x2="9" y2="7" />
              <line x1="10" y1="8" x2="13" y2="11" />
              <line x1="13" y1="11" x2="15" y2="13" />
              <line x1="16" y1="14" x2="19" y2="17" />
            </svg>
          )
        },
        {
          id: 'angle',
          label: 'Angle Arc',
          description: 'Measures the angle between points or lines.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20L20 20" />
              <path d="M4 20L16 4" />
              <path d="M9 20 A 5 5 0 0 0 11 16" />
            </svg>
          )
        },
        {
          id: 'protractor',
          label: 'Protractor',
          description: 'Places an interactive angle protractor on the canvas.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16 A 8 8 0 0 1 20 16 Z" />
              <line x1="12" y1="13" x2="12" y2="16" />
            </svg>
          )
        }
      ]
    },
    {
      group: 'EDIT',
      tools: [
        {
          id: 'select',
          label: 'Select',
          description: 'Select objects or drag a selection box across the canvas to select multiple items.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
          )
        },
        {
          id: 'hand',
          label: 'Hand',
          description: 'Pan and control canvas view by dragging freely.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-4 0v5" />
              <path d="M14 10V4a2 2 0 0 0-4 0v7" />
              <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          )
        },
        {
          id: 'eraser',
          label: selectedIds && selectedIds.length > 0 ? `Delete (${selectedIds.length})` : 'Eraser',
          description: selectedIds && selectedIds.length > 0 ? `Delete all ${selectedIds.length} selected items (Del / Backspace)` : 'Removes objects from the canvas (or click an object to erase).',
          action: handleEraserOrDelete,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2C14 1 16 1 17 2L21 6C22 7 22 9 21 10L12 19" />
            </svg>
          )
        },
        {
          id: 'undo',
          label: 'Undo',
          description: 'Reverse the last action. (Ctrl+Z)',
          action: handleUndo,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9h13a5 5 0 0 1 0 10H11" />
              <polyline points="7 5 3 9 7 13" />
            </svg>
          )
        },
        {
          id: 'redo',
          label: 'Redo',
          description: 'Restore the last undone action. (Ctrl+Y)',
          action: handleRedo,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 9H8a5 5 0 0 0 0 10h5" />
              <polyline points="17 5 21 9 17 13" />
            </svg>
          )
        },
        {
          id: 'clear',
          label: 'Clear Canvas',
          description: 'Clear all objects from canvas.',
          action: handleClear,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <aside className={`${styles.toolbar} ${mobileExpanded ? styles.toolbarExpanded : ''}`}>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setMobileExpanded((expanded) => !expanded)}
        aria-expanded={mobileExpanded}
        aria-label={`${mobileExpanded ? 'Close' : 'Open'} tools; current tool is ${activeTool}`}
      >
        <span className={styles.mobileToggleGrip} />
        <span className={styles.mobileToggleLabel}>
          <strong>Tools</strong>
          <span>{activeTool}</span>
        </span>
        <svg
          className={styles.mobileToggleIcon}
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d={mobileExpanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
        </svg>
      </button>
      <div className={styles.toolGroups}>
      {toolGroups.map((grp, gIdx) => (
        <div key={grp.group} className={styles.toolGroup}>
          {gIdx > 0 && <div className={styles.divider} />}
          <span className={styles.groupLabel}>{grp.group}</span>
          {grp.tools.map((tool) => {
            const shortcut = tool.shortcut || getShortcut(tool.id);
            return (
              <div key={tool.id} className={styles.btnWrapper}>
                <button
                  type="button"
                  className={`${styles.toolBtn} ${activeTool === tool.id ? styles.active : ''}`}
                  onClick={() => {
                    if (tool.action) tool.action();
                    else setActiveTool(tool.id);
                    setMobileExpanded(false);
                  }}
                  aria-label={`${tool.label}${shortcut ? ` (${shortcut})` : ''} — ${tool.description}`}
                  title={`${tool.label}${shortcut ? ` (${shortcut})` : ''} — ${tool.description}`}
                  data-label={tool.label}
                >
                  {tool.icon}
                </button>
                <div className={styles.tooltip}>
                  <div className={styles.tooltipHeader}>
                    <span className={styles.tooltipTitle}>{tool.label}</span>
                    {shortcut && <kbd className={styles.shortcutKbd}>{shortcut}</kbd>}
                  </div>
                  <span className={styles.tooltipDesc}>{tool.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </aside>
  );
}
