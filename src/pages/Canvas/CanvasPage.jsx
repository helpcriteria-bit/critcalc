import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getStudentCanvasById } from '../../firebase/canvasStorage';
import CanvasHeader from '../../components/CanvasHeader/CanvasHeader';
import Toolbar from '../../components/Toolbar/Toolbar';
import GeoCanvas from '../../components/GeoCanvas/GeoCanvas';
import CanvasGuideSection from '../../components/GeoCanvas/CanvasGuideSection';
import SEO from '../../components/SEO/SEO';
import styles from './CanvasPage.module.css';

export default function CanvasPage() {
  const [searchParams] = useSearchParams();
  const canvasId = searchParams.get('id');
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { loadCanvasDocument, currentCanvasId } = useApp();
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!canvasId) return;

    if (!user) {
      if (!authLoading) {
        openAuthModal('Sign in to open your saved canvas.');
      }
      return;
    }

    if (currentCanvasId === canvasId) return;

    let active = true;
    setLoadingDoc(true);
    setLoadError(null);

    getStudentCanvasById(user.uid, canvasId)
      .then((doc) => {
        if (active) {
          if (doc) {
            loadCanvasDocument(doc);
          } else {
            setLoadError('Canvas not found or you do not have permission to view it.');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load canvas document:', err);
        if (active) setLoadError('Failed to load canvas project from cloud.');
      })
      .finally(() => {
        if (active) setLoadingDoc(false);
      });

    return () => {
      active = false;
    };
  }, [canvasId, user, authLoading, currentCanvasId, loadCanvasDocument, openAuthModal]);

  return (
    <div className={styles.pageContainer}>
      <SEO route="/canvas" />

      <div className={styles.canvasViewport}>
        <CanvasHeader />
        {loadError && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: '#ef4444',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12.5px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚠️ {loadError}</span>
            <button
              type="button"
              onClick={() => setLoadError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '0 4px'
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
        <div className={styles.page}>
          <Toolbar />
          <GeoCanvas />
          <button
            type="button"
            className={styles.guideTrigger}
            onClick={() => setShowGuide((prev) => !prev)}
            aria-expanded={showGuide}
          >
            <span>{showGuide ? 'Hide Guide ▲' : '📖 Geometry Tools Guide & FAQs ▼'}</span>
          </button>
        </div>
      </div>

      <CanvasGuideSection
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
