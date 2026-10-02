import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Learn.module.css';

export default function ArticleHeader({ title, category = 'Class 10 Mathematics', intro, breadcrumbTitle }) {
  return (
    <header className={styles.articleHeader}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
        <Link to="/">Home</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to="/learn">Learn</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{breadcrumbTitle || title}</span>
      </nav>

      <span className={styles.badge}>{category}</span>
      <h1 className={styles.h1Title}>{title}</h1>
      {intro && <p className={styles.introLead}>{intro}</p>}
    </header>
  );
}
