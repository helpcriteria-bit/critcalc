import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  getStudentCanvases,
  deleteStudentCanvas,
  duplicateStudentCanvas,
  renameStudentCanvas
} from '../../firebase/canvasStorage';
import styles from './CanvasDashboard.module.css';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export default function CanvasDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { resetCanvasToNew, loadCanvasDocument } = useApp();

  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest' | 'alpha'

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCanvases = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await getStudentCanvases(user.uid);
      setCanvases(list);
    } catch (err) {
      console.error('Error fetching student canvases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, [user]);

  // Close card menu on window click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.menuBtn}`) && !e.target.closest(`.${styles.menuDropdown}`)) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleOpenCanvas = (canvas) => {
    loadCanvasDocument(canvas);
    navigate(`/canvas?id=${canvas.id}`);
  };

  const handleCreateNew = () => {
    resetCanvasToNew();
    navigate('/canvas');
  };

  const handleDuplicate = async (canvasId) => {
    if (!user) return;
    setActionLoading(true);
    setActiveMenuId(null);
    try {
      await duplicateStudentCanvas(user.uid, canvasId);
      await fetchCanvases();
    } catch (err) {
      console.error('Duplicate failed:', err);
      alert('Failed to duplicate canvas. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!user || !deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteStudentCanvas(user.uid, deleteTarget.id);
      setCanvases((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete canvas. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRename = async (e) => {
    e.preventDefault();
    if (!user || !renameTarget || !renameValue.trim()) return;
    setActionLoading(true);
    try {
      await renameStudentCanvas(user.uid, renameTarget.id, renameValue.trim());
      setCanvases((prev) =>
        prev.map((c) =>
          c.id === renameTarget.id ? { ...c, name: renameValue.trim(), updatedAt: new Date().toISOString() } : c
        )
      );
      setRenameTarget(null);
    } catch (err) {
      console.error('Rename failed:', err);
      alert('Failed to rename canvas.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCanvases = useMemo(() => {
    let result = [...canvases];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) => c.name?.toLowerCase().includes(term));
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [canvases, searchTerm, sortBy]);

  if (authLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
          <span>Connecting to student account...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.unauthCard}>
          <div className={styles.unauthIcon}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
            </svg>
          </div>
          <div className={styles.unauthTitle}>Student Cloud Storage</div>
          <div className={styles.unauthDesc}>
            Sign in with your Google or school account to access your saved geometric canvases, share constructions, and sync your work across all your devices.
          </div>
          <button
            type="button"
            className={styles.newBtn}
            onClick={() => openAuthModal('Sign in to view and save your geometry canvases')}
          >
            <span>Sign In / Create Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>My Canvases</h1>
          <div className={styles.subtitle}>
            {canvases.length} {canvases.length === 1 ? 'project' : 'projects'} saved in student cloud
          </div>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.newBtn} onClick={handleCreateNew}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Canvas</span>
          </button>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by canvas title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort canvases"
        >
          <option value="recent">Recently Updated</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">Name (A-Z)</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}>
          <span>Loading your cloud canvases...</span>
        </div>
      ) : filteredCanvases.length > 0 ? (
        <div className={styles.grid}>
          {filteredCanvases.map((canvas) => (
            <div key={canvas.id} className={styles.card}>
              <div
                className={styles.thumbContainer}
                onClick={() => handleOpenCanvas(canvas)}
                title="Click to open canvas"
              >
                {canvas.thumbnail ? (
                  <img
                    src={canvas.thumbnail}
                    alt={canvas.name || 'Canvas preview'}
                    className={styles.thumbImg}
                  />
                ) : (
                  <div className={styles.placeholderThumb}>
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 2 22 22 22" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    <span>Geometric Canvas</span>
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <div
                    className={styles.cardTitle}
                    onClick={() => handleOpenCanvas(canvas)}
                    title={canvas.name}
                  >
                    {canvas.name || 'Untitled Geometry Canvas'}
                  </div>

                  <button
                    type="button"
                    className={styles.menuBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === canvas.id ? null : canvas.id);
                    }}
                    title="Canvas options"
                    aria-label="Options"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>

                  {activeMenuId === canvas.id && (
                    <div className={styles.menuDropdown} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => handleOpenCanvas(canvas)}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <span>Open Canvas</span>
                      </button>

                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => {
                          setActiveMenuId(null);
                          setRenameTarget(canvas);
                          setRenameValue(canvas.name || '');
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Rename</span>
                      </button>

                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => handleDuplicate(canvas.id)}
                        disabled={actionLoading}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        className={`${styles.menuItem} ${styles.deleteItem}`}
                        onClick={() => {
                          setActiveMenuId(null);
                          setDeleteTarget(canvas);
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.cardMeta}>
                  <span>Updated {formatRelativeTime(canvas.updatedAt)}</span>
                  <span>{canvas.canvasData?.geoObjects?.length || 0} objects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className={styles.emptyTitle}>
            {searchTerm ? 'No matching canvases found' : 'No saved canvases yet'}
          </div>
          <div className={styles.emptyDesc}>
            {searchTerm
              ? `No canvases matching "${searchTerm}". Try another search keyword.`
              : 'Create geometric constructions, proofs, and angle measurements, then save them safely to the cloud.'}
          </div>
          <button type="button" className={styles.newBtn} onClick={handleCreateNew}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create First Canvas</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalBackdrop} onClick={() => setDeleteTarget(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>Delete Canvas?</div>
            <div className={styles.modalText}>
              Are you sure you want to delete <b>&quot;{deleteTarget.name}&quot;</b>? This will permanently remove the canvas and all its geometry objects from your cloud account.
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelActionBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className={styles.modalBackdrop} onClick={() => setRenameTarget(null)}>
          <form className={styles.confirmModal} onSubmit={confirmRename} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>Rename Canvas</div>
            <input
              type="text"
              className={styles.renameInput}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter canvas name..."
              autoFocus
              required
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelActionBtn}
                onClick={() => setRenameTarget(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.confirmSaveBtn}
                disabled={actionLoading || !renameValue.trim()}
              >
                {actionLoading ? 'Renaming...' : 'Save Name'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
