import React, { useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  saveStudentCanvas,
  saveLocalCanvasDraft,
  markPendingCanvasSync,
  clearPendingCanvasSync,
  getPendingCanvasSyncs
} from '../../firebase/canvasStorage';
import { generateThumbnail } from '../../utils/thumbnailHelper';
import { MODIFIER_LABEL } from '../../canvas/toolShortcuts';
import styles from './CanvasHeader.module.css';

export default function CanvasHeader() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const {
    geoObjects,
    gridSettings,
    transform,
    currentCanvasId,
    setCurrentCanvasId,
    canvasName,
    setCanvasName,
    saveStatus,
    setSaveStatus,
    lastSavedAt,
    setLastSavedAt,
    activeCanvasElementRef,
    isDocumentLoadingRef,
    resetCanvasToNew
  } = useApp();

  const isInitialMount = useRef(true);

  // Mark unsaved when objects or settings change, but ignore when loading or resetting a document
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isDocumentLoadingRef?.current) {
      isDocumentLoadingRef.current = false;
      return;
    }
    setSaveStatus('unsaved');
  }, [geoObjects, gridSettings, isDocumentLoadingRef, setSaveStatus]);

  const handleSave = useCallback(
    async (isAutosave = false) => {
      if (!user) {
        if (!isAutosave) {
          openAuthModal('Sign in to save your canvas to your student cloud.');
        }
        return;
      }

      // Check if browser is currently offline
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isOffline) {
        saveLocalCanvasDraft(user.uid, currentCanvasId, {
          name: canvasName,
          canvasData: { geoObjects, gridSettings, transform }
        });
        markPendingCanvasSync(user.uid, currentCanvasId);
        setSaveStatus('offline');
        return;
      }

      setSaveStatus('saving');
      try {
        // Save local backup immediately before remote write
        saveLocalCanvasDraft(user.uid, currentCanvasId, {
          name: canvasName,
          canvasData: { geoObjects, gridSettings, transform }
        });

        // Only generate thumbnail on manual user save to save costs and avoid continuous base64 writes
        let thumbnail = null;
        if (!isAutosave) {
          thumbnail = generateThumbnail(activeCanvasElementRef.current);
        }

        const savedId = await saveStudentCanvas(user.uid, currentCanvasId, {
          name: canvasName,
          canvasData: {
            geoObjects,
            gridSettings,
            transform
          },
          thumbnail
        });

        setCurrentCanvasId(savedId);
        clearPendingCanvasSync(user.uid, savedId);
        setSaveStatus('saved');
        setLastSavedAt(new Date().toISOString());

        // Update URL query param if this was a newly created canvas
        if (!currentCanvasId && savedId) {
          navigate(`/canvas?id=${savedId}`, { replace: true });
        }
      } catch (err) {
        console.error('Failed to save canvas:', err);
        markPendingCanvasSync(user.uid, currentCanvasId);
        const isNetError = typeof navigator !== 'undefined' && (!navigator.onLine || /network|offline|unavailable/i.test(err?.message || ''));
        setSaveStatus(isNetError ? 'offline' : 'failed');
      }
    },
    [
      user,
      currentCanvasId,
      canvasName,
      geoObjects,
      gridSettings,
      transform,
      activeCanvasElementRef,
      openAuthModal,
      setCurrentCanvasId,
      setSaveStatus,
      setLastSavedAt,
      navigate
    ]
  );

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Debounced Autosave (3.5 seconds after changes if user is logged in and canvas has been saved once)
  useEffect(() => {
    if (!user || !currentCanvasId || saveStatus !== 'unsaved') return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [user, currentCanvasId, saveStatus, geoObjects, canvasName, handleSave]);

  // Network connectivity listener to sync offline changes automatically
  useEffect(() => {
    const handleOnline = () => {
      if (user) {
        const pending = getPendingCanvasSyncs(user.uid);
        if (pending.length > 0 || saveStatus === 'offline' || saveStatus === 'failed') {
          handleSave(true);
        }
      }
    };

    const handleOffline = () => {
      if (saveStatus === 'saving' || saveStatus === 'unsaved') {
        saveLocalCanvasDraft(user?.uid, currentCanvasId, {
          name: canvasName,
          canvasData: { geoObjects, gridSettings, transform }
        });
        setSaveStatus('offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, currentCanvasId, canvasName, geoObjects, gridSettings, transform, saveStatus, handleSave, setSaveStatus]);

  const handleNew = () => {
    if (saveStatus === 'unsaved') {
      if (!window.confirm('You have unsaved changes on this canvas. Start a new canvas anyway?')) {
        return;
      }
    }
    resetCanvasToNew();
    navigate('/canvas', { replace: true });
  };

  const renderStatus = () => {
    if (saveStatus === 'saving') {
      return (
        <div className={styles.statusIndicator}>
          <div className={styles.spinner} />
          <span>Saving to cloud...</span>
        </div>
      );
    }
    if (saveStatus === 'unsaved') {
      return (
        <div className={styles.statusIndicator} title="Unsaved changes">
          <span className={`${styles.statusDot} ${styles.unsavedDot}`} />
          <span>Unsaved changes</span>
        </div>
      );
    }
    if (saveStatus === 'offline') {
      return (
        <div
          className={styles.statusIndicator}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSave(false)}
          title="Offline: Saved locally on this device. Will sync to the cloud when internet returns."
        >
          <span className={`${styles.statusDot} ${styles.offlineDot}`} />
          <span style={{ color: '#38bdf8' }}>Offline (Saved locally)</span>
        </div>
      );
    }
    if (saveStatus === 'failed') {
      return (
        <div
          className={styles.statusIndicator}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSave(false)}
          title="Save failed. Check network or click here to retry."
        >
          <span className={`${styles.statusDot} ${styles.failedDot}`} />
          <span style={{ color: '#f87171' }}>Save failed · Retry</span>
        </div>
      );
    }
    // Saved
    return (
      <div className={styles.statusIndicator}>
        <span className={`${styles.statusDot} ${styles.savedDot}`} />
        <span>Saved {lastSavedAt ? `• ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
      </div>
    );
  };

  return (
    <header className={styles.canvasHeader}>
      <div className={styles.leftGroup}>
        <Link to="/my-canvases" className={styles.myCanvasesBtn} title="View all your saved canvases">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>My Canvases</span>
        </Link>

        <span className={styles.divider} />

        <div className={styles.titleWrapper}>
          <input
            type="text"
            className={styles.nameInput}
            value={canvasName}
            onChange={(e) => {
              setCanvasName(e.target.value);
              setSaveStatus('unsaved');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
                if (currentCanvasId) handleSave(false);
              }
            }}
            placeholder="Canvas Title..."
            title="Click to rename canvas"
          />
        </div>
      </div>

      <div className={styles.rightGroup}>
        {renderStatus()}

        <button
          type="button"
          className={styles.saveBtn}
          onClick={() => handleSave(false)}
          disabled={saveStatus === 'saving'}
          title={`Save canvas to cloud (${MODIFIER_LABEL}+S)`}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save</span>
          <span className={styles.kbdHint}>{MODIFIER_LABEL}+S</span>
        </button>

        <button
          type="button"
          className={styles.newBtn}
          onClick={handleNew}
          title="Start a new blank canvas"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New</span>
        </button>
      </div>
    </header>
  );
}
