import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Learn.module.css';

export default function TryInCritCalc({
  title = 'Try It in CritCalc',
  description = 'Test this formula, calculate roots, or construct shapes directly using CritCalc’s interactive tools.',
  primaryLink = '/calculator',
  primaryLabel = 'Open Scientific Calculator →',
  secondaryLink = '/canvas',
  secondaryLabel = 'Open Geometry Canvas →'
}) {
  return (
    <aside className={styles.tryCard} aria-label="Interactive CritCalc tools">
      <div className={styles.tryTitle}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
        </svg>
        <span>{title}</span>
      </div>
      <p className={styles.tryDesc}>{description}</p>
      <div className={styles.tryActions}>
        {primaryLink && (
          <Link to={primaryLink} className={styles.tryBtn}>
            {primaryLabel}
          </Link>
        )}
        {secondaryLink && (
          <Link to={secondaryLink} className={styles.tryBtnSecondary}>
            {secondaryLabel}
          </Link>
        )}
      </div>
    </aside>
  );
}
