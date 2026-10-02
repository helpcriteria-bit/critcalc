import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getStudentCanvasById } from '../../firebase/canvasStorage';
import CanvasHeader from '../../components/CanvasHeader/CanvasHeader';
import Toolbar from '../../components/Toolbar/Toolbar';
import GeoCanvas from '../../components/GeoCanvas/GeoCanvas';
import styles from './CanvasPage.module.css';

export default function CanvasPage() {
  const [searchParams] = useSearchParams();
  const canvasId = searchParams.get('id');
  const { user } = useAuth();
  const { loadCanvasDocument, currentCanvasId } = useApp();
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    if (!canvasId || !user) return;
    if (currentCanvasId === canvasId) return;

    let active = true;
    setLoadingDoc(true);

    getStudentCanvasById(user.uid, canvasId)
      .then((doc) => {
        if (active && doc) {
          loadCanvasDocument(doc);
        }
      })
      .catch((err) => {
        console.error('Failed to load canvas document:', err);
      })
      .finally(() => {
        if (active) setLoadingDoc(false);
      });

    return () => {
      active = false;
    };
  }, [canvasId, user, currentCanvasId, loadCanvasDocument]);

  return (
    <div className={styles.pageContainer}>
      <CanvasHeader />
      <div className={styles.page}>
        <Toolbar />
        <GeoCanvas />
      </div>
    </div>
  );
}
