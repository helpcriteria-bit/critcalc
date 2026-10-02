import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CanvasGuideSection.module.css';

export default function CanvasGuideSection({ isOpen, onClose }) {
  return (
    <section
      className={`${styles.guideContainer} ${isOpen ? styles.guideOpen : ''}`}
      aria-labelledby="canvas-guide-h1"
    >
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <h1 id="canvas-guide-h1" className={styles.h1Title}>
            Interactive Geometry Canvas
          </h1>
          {onClose && (
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close geometry guide"
            >
              ✕ Close Guide
            </button>
          )}
        </div>

        <p className={styles.intro}>
          CritCalc’s interactive geometry canvas is a dynamic mathematical environment designed for drawing, measuring, and constructing Euclidean geometric figures on a centimeter coordinate grid.
        </p>

        {/* Available Construction & Drawing Capabilities */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.sectionHeading}>Geometric Drawing & Construction Capabilities</h2>
          <div className={styles.toolsGrid}>
            <div className={styles.toolCol}>
              <h3 className={styles.toolColTitle}>Drawing Tools</h3>
              <ul className={styles.toolList}>
                <li><strong>Point (P)</strong> — Place precision coordinates anywhere on the Cartesian grid.</li>
                <li><strong>Segment / Line (L)</strong> — Connect two points with a straight line or segment.</li>
                <li><strong>Circle (C)</strong> — Construct circles given a center point and a radius point.</li>
                <li><strong>Three-Point Circle (Shift+C)</strong> — Determine the unique circumcircle through 3 non-collinear points.</li>
                <li><strong>Triangle (T) & Rectangle (R)</strong> — Draw polygons and rectangular boundaries.</li>
                <li><strong>Regular Polygon (Shift+R) & Polygon (G)</strong> — Create multi-sided polygons with equal sides or custom vertices.</li>
              </ul>
            </div>

            <div className={styles.toolCol}>
              <h3 className={styles.toolColTitle}>Geometric Constructions</h3>
              <ul className={styles.toolList}>
                <li><strong>Midpoint (M)</strong> — Find the exact center of any line segment.</li>
                <li><strong>Perpendicular Line (Shift+P)</strong> — Drop a 90° normal through any target point.</li>
                <li><strong>Parallel Line (Shift+L)</strong> — Construct lines that maintain constant Euclidean distance.</li>
                <li><strong>Perpendicular Bisector (B)</strong> — Divide a line into two equal halves at a right angle.</li>
                <li><strong>Angle Bisector (Shift+B)</strong> — Construct a ray dividing an angle into two equal parts.</li>
                <li><strong>Tangents (Shift+T) & Intersections (I)</strong> — Locate precise circle tangents and object intersections.</li>
              </ul>
            </div>

            <div className={styles.toolCol}>
              <h3 className={styles.toolColTitle}>Measurements & Editing</h3>
              <ul className={styles.toolList}>
                <li><strong>Distance Ruler (D)</strong> — Measure real distance between coordinates in centimeters.</li>
                <li><strong>Angle Arc (A)</strong> — Calculate and display angle degrees between three vertices.</li>
                <li><strong>Protractor (O)</strong> — Overlay an interactive circular protractor onto the canvas.</li>
                <li><strong>Undo (Ctrl+Z) & Redo (Ctrl+Y)</strong> — 40-step non-destructive action history.</li>
                <li><strong>Selection & Pan (V, H)</strong> — Multi-select items, move objects, or pan the infinite canvas.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.sectionHeading}>Geometry Canvas FAQs</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                How do I construct a perpendicular bisector?
              </summary>
              <div className={styles.faqAnswer}>
                Select the <strong>Perpendicular Bisector</strong> tool (hotkey <kbd>B</kbd>), then click on the line segment you wish to bisect. CritCalc automatically computes the midpoint and constructs the orthogonal line.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                What is the Three-Point Circle tool used for?
              </summary>
              <div className={styles.faqAnswer}>
                The 3-point circle tool (<kbd>Shift+C</kbd> or <kbd>3</kbd>) allows you to click any three vertices (such as a triangle’s corners) to instantly construct its circumscribed circle.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Can I measure real distances and angles on my drawings?
              </summary>
              <div className={styles.faqAnswer}>
                Yes. Use the <strong>Distance / Ruler</strong> tool (<kbd>D</kbd>) to measure distances in centimeters, the <strong>Angle Arc</strong> tool (<kbd>A</kbd>) to compute angles in degrees, or place the interactive <strong>Protractor</strong> (<kbd>O</kbd>).
              </div>
            </details>
          </div>
        </div>

        {/* Internal Links */}
        <div className={styles.linksRow}>
          <span className={styles.linksLabel}>Related Guides:</span>
          <Link to="/learn/geometry" className={styles.linkBadge}>Pythagorean Theorem & Constructions →</Link>
          <Link to="/learn/coordinate-geometry" className={styles.linkBadge}>Coordinate Geometry & Shoelace Area →</Link>
          <Link to="/calculator" className={styles.linkBadge}>Open Scientific Calculator →</Link>
          <Link to="/tutor" className={styles.linkBadge}>Ask AI Math Tutor →</Link>
        </div>
      </div>
    </section>
  );
}
