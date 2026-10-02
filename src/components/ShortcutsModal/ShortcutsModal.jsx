import React, { useState, useMemo } from 'react';
import { CANVAS_SHORTCUTS } from '../../canvas/toolShortcuts';
import styles from './ShortcutsModal.module.css';

const CATEGORY_NAMES = {
  DRAW: 'Drawing Tools',
  CONSTRUCT: 'Construction Tools',
  MEASURE: 'Measurement Tools',
  EDIT: 'Navigation & Editing',
  ACTIONS: 'Canvas Operations'
};

const CATEGORY_ORDER = ['DRAW', 'CONSTRUCT', 'MEASURE', 'EDIT', 'ACTIONS'];

export default function ShortcutsModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShortcuts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return CANVAS_SHORTCUTS;
    return CANVAS_SHORTCUTS.filter(
      item =>
        item.label.toLowerCase().includes(term) ||
        item.shortcut.toLowerCase().includes(term) ||
        (item.altShortcut && item.altShortcut.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const groupedShortcuts = useMemo(() => {
    const groups = {};
    for (const cat of CATEGORY_ORDER) {
      groups[cat] = [];
    }
    for (const item of filteredShortcuts) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredShortcuts]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconWrap}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
              </svg>
            </div>
            <div>
              <div id="shortcuts-title" className={styles.title}>
                Canvas Keyboard Shortcuts
              </div>
              <div className={styles.subtitle}>
                Fast single-key &amp; combo hotkeys for all tools and constructions
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search shortcuts or tool name (e.g. circle, perpendicular, L)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.body}>
          {CATEGORY_ORDER.map((catKey) => {
            const list = groupedShortcuts[catKey] || [];
            if (list.length === 0) return null;
            return (
              <div key={catKey} className={styles.categoryGroup}>
                <div className={styles.categoryTitle}>{CATEGORY_NAMES[catKey]}</div>
                <div className={styles.grid}>
                  {list.map((tool) => (
                    <div key={tool.id} className={styles.shortcutRow}>
                      <div className={styles.infoArea}>
                        <span className={styles.label}>{tool.label}</span>
                        {tool.description && (
                          <span className={styles.desc}>{tool.description}</span>
                        )}
                      </div>
                      <div className={styles.kbdWrap}>
                        <kbd className={styles.kbd}>{tool.shortcut}</kbd>
                        {tool.altShortcut && (
                          <span className={styles.altKbd}>or <kbd className={styles.kbd}>{tool.altShortcut}</kbd></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredShortcuts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)' }}>
              No matching shortcuts found for &quot;{searchTerm}&quot;
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerTip}>
            <span>Tip: Press <kbd className={styles.kbd}>?</kbd> anytime on the canvas to open this cheatsheet</span>
          </div>
          <div className={styles.footerTip}>
            <span>Press <kbd className={styles.kbd}>Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
