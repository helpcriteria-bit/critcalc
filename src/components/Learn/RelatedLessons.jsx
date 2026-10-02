import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Learn.module.css';

export default function RelatedLessons({ currentPath, lessons = [] }) {
  const defaultLessons = [
    {
      path: '/learn/algebra',
      title: 'Quadratic Equations & Algebra',
      desc: 'Formulas, factoring methods, and discriminant analysis for ax² + bx + c = 0.'
    },
    {
      path: '/learn/geometry',
      title: 'Pythagorean Theorem & Geometry',
      desc: 'Right triangle properties, proof methods, and geometric constructions.'
    },
    {
      path: '/learn/trigonometry',
      title: 'Trigonometric Ratios (Sin, Cos, Tan)',
      desc: 'Right-triangle definitions, standard angle reference tables, and identities.'
    },
    {
      path: '/learn/coordinate-geometry',
      title: 'Coordinate Geometry & Distance',
      desc: 'Cartesian distance formula, midpoint calculations, and Shoelace polygon area.'
    }
  ];

  const pool = lessons.length > 0 ? lessons : defaultLessons;
  const filtered = pool.filter((l) => l.path !== currentPath);

  return (
    <nav className={styles.relatedSection} aria-label="Related mathematics lessons">
      <div className={styles.relatedTitle}>Continue Learning:</div>
      <div className={styles.relatedGrid}>
        {filtered.slice(0, 2).map((lesson, idx) => (
          <Link key={idx} to={lesson.path} className={styles.relatedCard}>
            <div className={styles.relatedCardTitle}>{lesson.title} →</div>
            <div className={styles.relatedCardDesc}>{lesson.desc}</div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
