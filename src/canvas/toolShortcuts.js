/**
 * toolShortcuts.js
 * Centralized keyboard shortcuts configuration for all tools and canvas actions.
 */

export const isMac =
  typeof navigator !== 'undefined' &&
  (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Macintosh/.test(navigator.userAgent));

export const MODIFIER_LABEL = isMac ? '⌘' : 'Ctrl';

export const CANVAS_SHORTCUTS = [
  // --- DRAW TOOLS ---
  {
    id: 'point',
    label: 'Point',
    category: 'DRAW',
    shortcut: 'P',
    description: 'Create a point on the canvas',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'p' || e.key === 'P')
  },
  {
    id: 'line',
    label: 'Segment / Line',
    category: 'DRAW',
    shortcut: 'L',
    description: 'Draw a straight line between two points',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'l' || e.key === 'L')
  },
  {
    id: 'circle',
    label: 'Circle',
    category: 'DRAW',
    shortcut: 'C',
    description: 'Draw a circle using center and radius point',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'c' || e.key === 'C')
  },
  {
    id: 'circle3p',
    label: 'Three-Point Circle',
    category: 'DRAW',
    shortcut: 'Shift + C',
    altShortcut: '3',
    description: 'Create a circle passing through three points',
    match: (e) =>
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      ((e.shiftKey && (e.key === 'C' || e.key === 'c')) || (!e.shiftKey && e.key === '3'))
  },
  {
    id: 'triangle',
    label: 'Triangle',
    category: 'DRAW',
    shortcut: 'T',
    description: 'Draw a triangle from 3 points',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 't' || e.key === 'T')
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    category: 'DRAW',
    shortcut: 'R',
    description: 'Draw a rectangle from corner to corner',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'r' || e.key === 'R')
  },
  {
    id: 'regpoly',
    label: 'Regular Polygon',
    category: 'DRAW',
    shortcut: 'Shift + R',
    description: 'Create a polygon with equal sides and angles',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && e.shiftKey && (e.key === 'R' || e.key === 'r')
  },
  {
    id: 'polygon',
    label: 'Polygon',
    category: 'DRAW',
    shortcut: 'G',
    description: 'Draw an arbitrary closed polygon with any number of sides',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'g' || e.key === 'G')
  },

  // --- CONSTRUCT TOOLS ---
  {
    id: 'midpoint',
    label: 'Midpoint',
    category: 'CONSTRUCT',
    shortcut: 'M',
    description: 'Finds the exact middle of a line segment',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'm' || e.key === 'M')
  },
  {
    id: 'perpendicular',
    label: 'Perpendicular',
    category: 'CONSTRUCT',
    shortcut: 'Shift + P',
    altShortcut: 'K',
    description: 'Creates a line at 90° to another line',
    match: (e) =>
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      ((e.shiftKey && (e.key === 'P' || e.key === 'p')) || (!e.shiftKey && (e.key === 'k' || e.key === 'K')))
  },
  {
    id: 'parallel',
    label: 'Parallel',
    category: 'CONSTRUCT',
    shortcut: 'Shift + L',
    altShortcut: 'F',
    description: 'Creates a line that never meets another line',
    match: (e) =>
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      ((e.shiftKey && (e.key === 'L' || e.key === 'l')) || (!e.shiftKey && (e.key === 'f' || e.key === 'F')))
  },
  {
    id: 'perp_bisector',
    label: 'Perpendicular Bisector',
    category: 'CONSTRUCT',
    shortcut: 'B',
    description: 'Divides a line into two equal parts at 90°',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'b' || e.key === 'B')
  },
  {
    id: 'angle_bisector',
    label: 'Angle Bisector',
    category: 'CONSTRUCT',
    shortcut: 'Shift + B',
    altShortcut: 'J',
    description: 'Divides an angle into two equal angles',
    match: (e) =>
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      ((e.shiftKey && (e.key === 'B' || e.key === 'b')) || (!e.shiftKey && (e.key === 'j' || e.key === 'J')))
  },
  {
    id: 'intersection',
    label: 'Intersection',
    category: 'CONSTRUCT',
    shortcut: 'I',
    altShortcut: 'X',
    description: 'Marks where two objects meet',
    match: (e) =>
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.shiftKey &&
      (e.key === 'i' || e.key === 'I' || e.key === 'x' || e.key === 'X')
  },
  {
    id: 'tangent',
    label: 'Tangent',
    category: 'CONSTRUCT',
    shortcut: 'Shift + T',
    altShortcut: 'W',
    description: 'Draws a line that touches a circle at one point',
    match: (e) =>
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      ((e.shiftKey && (e.key === 'T' || e.key === 't')) || (!e.shiftKey && (e.key === 'w' || e.key === 'W')))
  },

  // --- MEASURE TOOLS ---
  {
    id: 'ruler',
    label: 'Distance / Ruler',
    category: 'MEASURE',
    shortcut: 'D',
    description: 'Measures the distance between two points',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'd' || e.key === 'D')
  },
  {
    id: 'angle',
    label: 'Angle Arc',
    category: 'MEASURE',
    shortcut: 'A',
    description: 'Measures the angle between points or lines',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'a' || e.key === 'A')
  },
  {
    id: 'protractor',
    label: 'Protractor',
    category: 'MEASURE',
    shortcut: 'O',
    description: 'Places an interactive angle protractor on the canvas',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'o' || e.key === 'O')
  },

  // --- EDIT & VIEW TOOLS ---
  {
    id: 'select',
    label: 'Select',
    category: 'EDIT',
    shortcut: 'V',
    description: 'Select objects or drag a selection box across the canvas',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'v' || e.key === 'V')
  },
  {
    id: 'hand',
    label: 'Hand',
    category: 'EDIT',
    shortcut: 'H',
    description: 'Pan and control canvas view by dragging freely',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'h' || e.key === 'H')
  },
  {
    id: 'eraser',
    label: 'Eraser',
    category: 'EDIT',
    shortcut: 'E',
    description: 'Removes objects from the canvas (or delete selected)',
    match: (e) => !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && (e.key === 'e' || e.key === 'E')
  },

  // --- ACTIONS ---
  {
    id: 'undo',
    label: 'Undo',
    category: 'ACTIONS',
    shortcut: `${MODIFIER_LABEL} + Z`,
    description: 'Reverse the last action'
  },
  {
    id: 'redo',
    label: 'Redo',
    category: 'ACTIONS',
    shortcut: `${MODIFIER_LABEL} + Y`,
    altShortcut: `${MODIFIER_LABEL} + Shift + Z`,
    description: 'Restore the last undone action'
  },
  {
    id: 'clear',
    label: 'Clear Canvas',
    category: 'ACTIONS',
    shortcut: 'Alt + Del',
    altShortcut: `${MODIFIER_LABEL} + Shift + Del`,
    description: 'Clear all objects from canvas'
  },
  {
    id: 'delete_selected',
    label: 'Delete Selected',
    category: 'ACTIONS',
    shortcut: 'Del / Backspace',
    description: 'Delete currently selected object(s)'
  },
  {
    id: 'select_all',
    label: 'Select All',
    category: 'ACTIONS',
    shortcut: `${MODIFIER_LABEL} + A`,
    description: 'Select all geometric objects on canvas'
  },
  {
    id: 'cancel_draft',
    label: 'Cancel / Deselect',
    category: 'ACTIONS',
    shortcut: 'Esc',
    description: 'Cancel in-progress drawing or clear selection'
  },
  {
    id: 'shortcuts_help',
    label: 'Shortcuts Reference',
    category: 'ACTIONS',
    shortcut: '?',
    description: 'Open canvas keyboard shortcuts cheatsheet'
  }
];

export const SHORTCUTS_BY_ID = CANVAS_SHORTCUTS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function getShortcut(toolId) {
  return SHORTCUTS_BY_ID[toolId]?.shortcut || null;
}
