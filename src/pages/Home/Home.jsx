import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heading}>Draw. Calculate. Understand.</h1>
          <p className={styles.subheading}>
            A geometry canvas, scientific calculator, and AI maths tutor — built for Class 10 students.
          </p>
          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate('/canvas')}
            >
              Open Canvas →
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate('/tutor')}
            >
              Try AI Tutor →
            </button>
          </div>
        </section>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Features Section */}
        <section>
          <div className={styles.featuresLabel}>FEATURES</div>
          <div className={styles.grid}>
            {/* Card 1 — Geometry Canvas */}
            <div className={styles.card}>
              <div className={styles.icon}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--theme)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>Geometry Canvas</h2>
              <p className={styles.cardDesc}>
                Draw points, lines, circles, triangles, rectangles, angles. Pan and zoom an infinite canvas. Full undo history.
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>Points</span>
                <span className={styles.tag}>Lines</span>
                <span className={styles.tag}>Circles</span>
                <span className={styles.tag}>Angles</span>
              </div>
              <a
                className={styles.cardLink}
                onClick={() => navigate('/canvas')}
              >
                Open Canvas →
              </a>
            </div>

            {/* Card 2 — Scientific Calculator */}
            <div className={styles.card}>
              <div className={styles.icon}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--purple)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <circle cx="8" cy="11" r="1" fill="var(--purple)" />
                  <circle cx="12" cy="11" r="1" fill="var(--purple)" />
                  <circle cx="16" cy="11" r="1" fill="var(--purple)" />
                  <circle cx="8" cy="15" r="1" fill="var(--purple)" />
                  <circle cx="12" cy="15" r="1" fill="var(--purple)" />
                  <circle cx="16" cy="15" r="1" fill="var(--purple)" />
                  <circle cx="8" cy="19" r="1" fill="var(--purple)" />
                  <circle cx="12" cy="19" r="1" fill="var(--purple)" />
                  <circle cx="16" cy="19" r="1" fill="var(--purple)" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>Scientific Calculator</h2>
              <p className={styles.cardDesc}>
                Live expression evaluation with sin, cos, tan, log, powers, roots, memory and history. DEG and RAD modes.
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>Algebra</span>
                <span className={styles.tag}>Trigonometry</span>
                <span className={styles.tag}>Memory</span>
              </div>
              <a
                className={styles.cardLink}
                onClick={() => navigate('/calculator')}
              >
                Open Calculator →
              </a>
            </div>

            {/* Card 3 — AI Maths Tutor */}
            <div className={styles.card}>
              <div className={styles.icon}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>AI Maths Tutor</h2>
              <p className={styles.cardDesc}>
                Ask anything about geometry, algebra, trigonometry or proofs. Answers stream in real time powered by Groq.
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>Groq API</span>
                <span className={styles.tag}>Streaming</span>
                <span className={styles.tag}>Class 10</span>
              </div>
              <a
                className={styles.cardLink}
                onClick={() => navigate('/tutor')}
              >
                Open Tutor →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
