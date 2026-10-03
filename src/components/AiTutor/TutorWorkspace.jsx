import React from 'react';
import AiTutor from './AiTutor';
import CanvasHeader from '../CanvasHeader/CanvasHeader';
import Toolbar from '../Toolbar/Toolbar';
import GeoCanvas from '../GeoCanvas/GeoCanvas';
import styles from './TutorWorkspace.module.css';

export default function TutorWorkspace({ onAsk, isMaximized, onToggleMaximize }) {
  return (
    <div className={styles.workspace}>
      <section className={styles.tutorPane} aria-label="AI maths tutor">
        <AiTutor
          onAsk={onAsk}
          isMaximized={isMaximized}
          onToggleMaximize={onToggleMaximize}
        />
      </section>

      <section className={styles.canvasPane} aria-label="Interactive geometry canvas">
        <CanvasHeader />
        <div className={styles.canvasBody}>
          <Toolbar />
          <GeoCanvas />
        </div>
      </section>
    </div>
  );
}
