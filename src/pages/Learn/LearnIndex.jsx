import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import styles from '../../components/Learn/Learn.module.css';

export default function LearnIndex() {
  const topics = [
    {
      path: '/learn/algebra',
      title: 'Quadratic Equations & Algebra',
      category: 'Algebra',
      desc: 'Understand the standard form ax² + bx + c = 0, solve using the quadratic formula, and evaluate the discriminant D = b² - 4ac to classify real and complex roots.',
      tools: 'Scientific Calculator'
    },
    {
      path: '/learn/geometry',
      title: 'Pythagorean Theorem & Right Triangles',
      category: 'Euclidean Geometry',
      desc: 'Explore the fundamental relation a² + b² = c², understand geometric proofs, discover common Pythagorean triples, and construct right triangles on the canvas.',
      tools: 'Geometry Canvas & Protractor'
    },
    {
      path: '/learn/trigonometry',
      title: 'Trigonometric Ratios (Sin, Cos, Tan)',
      category: 'Trigonometry',
      desc: 'Learn sine, cosine, tangent, and their reciprocals. Master standard angles (30°, 45°, 60°), understand DEG vs. RAD modes, and evaluate expressions.',
      tools: 'Scientific Calculator'
    },
    {
      path: '/learn/coordinate-geometry',
      title: 'Coordinate Geometry, Midpoint & Shoelace Area',
      category: 'Coordinate Geometry',
      desc: 'Derive the Euclidean distance formula, calculate segment midpoints, and determine arbitrary polygon area using the Shoelace formula on a 2D Cartesian plane.',
      tools: 'Geometry Canvas & Ruler'
    }
  ];

  return (
    <div className={styles.page}>
      <SEO route="/learn" />

      <div className={styles.container}>
        <header className={styles.articleHeader}>
          <span className={styles.badge}>Study Guides & Curriculum</span>
          <h1 className={styles.h1Title}>Math Learning Guides & Lessons</h1>
          <p className={styles.introLead}>
            Clear, concise, and mathematically rigorous guides built for Class 10 and secondary school students. Every guide includes formulas, worked step-by-step examples, and direct links to verify solutions inside CritCalc.
          </p>
        </header>

        <section aria-labelledby="curriculum-heading">
          <h2 id="curriculum-heading" className={styles.h2Heading}>
            Available Topics
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {topics.map((t, i) => (
              <article key={i} className={styles.exampleCard} style={{ margin: 0 }}>
                <span className={styles.exampleBadge}>{t.category}</span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '6px 0 10px' }}>
                  <Link to={t.path} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                    {t.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {t.desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                    Practiced in: <strong style={{ color: 'var(--muted)' }}>{t.tools}</strong>
                  </span>
                  <Link to={t.path} className={styles.tryBtn} style={{ padding: '6px 14px', fontSize: '12px' }}>
                    Read Full Lesson →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Quick Tool Navigation */}
        <section style={{ marginTop: '56px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
          <h2 className={styles.h2Heading}>CritCalc Interactive Tools</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <Link to="/scientific-calculator" className={styles.relatedCard}>
              <div className={styles.relatedCardTitle}>Scientific Calculator →</div>
              <div className={styles.relatedCardDesc}>Evaluate trigonometry, powers, roots, logs, and factorials.</div>
            </Link>
            <Link to="/geometry-calculator" className={styles.relatedCard}>
              <div className={styles.relatedCardTitle}>Geometry Canvas →</div>
              <div className={styles.relatedCardDesc}>Construct bisectors, circles, polygons, and measure angles.</div>
            </Link>
            <Link to="/math-tutor" className={styles.relatedCard}>
              <div className={styles.relatedCardTitle}>AI Math Tutor →</div>
              <div className={styles.relatedCardDesc}>Get streaming step-by-step theorem proofs and math guidance.</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
