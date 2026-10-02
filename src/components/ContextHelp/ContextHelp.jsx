import React, { useState, useEffect } from 'react';
import { getShortcut } from '../../canvas/toolShortcuts';
import styles from './ContextHelp.module.css';

export const TOOL_DESCRIPTIONS = {
  select: {
    title: 'Select',
    does: 'Selects objects or covers multiple objects with a drag box.',
    how: 'Click an object to select it. Click and drag across empty canvas to box-select multiple items. Drag selected items to move them.'
  },
  hand: {
    title: 'Hand (Pan Canvas)',
    does: 'Pans and navigates around the canvas view.',
    how: 'Click and drag anywhere on the canvas to move the view smoothly.'
  },
  point: {
    title: 'Point',
    does: 'Creates a point on the canvas.',
    how: 'Click anywhere on the canvas to place point A, B, C...'
  },
  line: {
    title: 'Segment / Line',
    does: 'Draws a straight line between two points.',
    how: 'Click first point, then click second point.'
  },
  circle: {
    title: 'Circle',
    does: 'Draws a circle using a center and radius.',
    how: 'Click center point, then click or drag to radius point.'
  },
  circle3p: {
    title: 'Three-Point Circle',
    does: 'Creates a circle passing through three points.',
    how: 'Click 3 points on the canvas to form the circumcircle.'
  },
  regpoly: {
    title: 'Regular Polygon',
    does: 'Creates a shape with equal sides and equal angles.',
    how: 'Click center, then click radius point.'
  },
  polygon: {
    title: 'Polygon',
    does: 'Draws any N-sided closed polygon.',
    how: 'Click vertices in order. Click start vertex or double-click to close.'
  },
  triangle: {
    title: 'Triangle',
    does: 'Draws a triangle from 3 points.',
    how: 'Click 3 points on canvas.'
  },
  rectangle: {
    title: 'Rectangle',
    does: 'Draws a rectangle between opposite corners.',
    how: 'Click and drag from corner to opposite corner.'
  },
  midpoint: {
    title: 'Midpoint',
    does: 'Finds the exact middle of a line.',
    how: 'Select a line segment, or click two points.'
  },
  perpendicular: {
    title: 'Perpendicular',
    does: 'Creates a line at 90° to another line.',
    how: 'Select a line, then choose a point.'
  },
  parallel: {
    title: 'Parallel',
    does: 'Creates a line that never meets another line.',
    how: 'Select a line, then choose a point.'
  },
  perp_bisector: {
    title: 'Perpendicular Bisector',
    does: 'Divides a line into two equal parts at 90°.',
    how: 'Select a line segment or two points.'
  },
  angle_bisector: {
    title: 'Angle Bisector',
    does: 'Divides an angle into two equal angles.',
    how: 'Click first arm point, vertex point, then second arm point.'
  },
  intersection: {
    title: 'Intersection',
    does: 'Marks where two objects meet.',
    how: 'Click near where two lines cross each other.'
  },
  tangent: {
    title: 'Tangent',
    does: 'Draws a line that touches a circle at one point.',
    how: 'Select a circle, then click a point.'
  },
  ruler: {
    title: 'Distance / Ruler',
    does: 'Measures the distance between two points.',
    how: 'Click and drag between any two points to measure.'
  },
  angle: {
    title: 'Angle',
    does: 'Measures an angle between three points.',
    how: 'Click vertex point, then click points on each arm.'
  },
  protractor: {
    title: 'Protractor',
    does: 'Places an interactive angle protractor on the canvas.',
    how: 'Click on the canvas to place the protractor.'
  },
  eraser: {
    title: 'Eraser',
    does: 'Removes the selected object.',
    how: 'Click on any object to delete it.'
  }
};

export default function ContextHelp({ activeTool, isDrafting }) {
  const [dismissedTool, setDismissedTool] = useState(null);

  // Reset dismissed state when tool changes
  useEffect(() => {
    setDismissedTool(null);
  }, [activeTool]);

  const info = TOOL_DESCRIPTIONS[activeTool];
  if (!info || dismissedTool === activeTool || isDrafting) return null;
  const shortcut = getShortcut(activeTool);

  return (
    <div className={styles.banner}>
      <div className={styles.topRow}>
        <div className={styles.titleWrap}>
          <span className={styles.title}>{info.title}</span>
          {shortcut && <kbd className={styles.shortcutKbd}>{shortcut}</kbd>}
        </div>
        <button
          type="button"
          className={styles.dismissBtn}
          onClick={() => setDismissedTool(activeTool)}
          title="Dismiss tip"
        >
          ✕
        </button>
      </div>
      <div className={styles.does}>{info.does}</div>
      <div className={styles.how}><b>How to use:</b> {info.how}</div>
    </div>
  );
}
