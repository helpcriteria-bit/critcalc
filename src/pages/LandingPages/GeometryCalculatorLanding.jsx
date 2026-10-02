import React from 'react';
import { Link } from 'react-router-dom';
import CanvasHeader from '../../components/CanvasHeader/CanvasHeader';
import Toolbar from '../../components/Toolbar/Toolbar';
import GeoCanvas from '../../components/GeoCanvas/GeoCanvas';
import SEO from '../../components/SEO/SEO';
import styles from './GeometryLanding.module.css';

export default function GeometryCalculatorLanding() {
  return (
    <div className={styles.page}>
      <SEO route="/geometry-calculator" />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.h1Title}>Online Geometry Calculator</h1>
          <p className={styles.intro}>
            Construct geometric shapes, measure distance in centimeters, compute angles, find circumcircles, and perform geometric bisector constructions on an interactive Cartesian plane.
          </p>
        </header>

        {/* Embedded Interactive Canvas */}
        <div className={styles.canvasWrapper} aria-label="Interactive geometry calculator workspace">
          <CanvasHeader />
          <div className={styles.canvasBody}>
            <Toolbar />
            <GeoCanvas />
          </div>
        </div>

        {/* What Users Can Calculate and Construct */}
        <section className={styles.section} aria-labelledby="geo-tools-heading">
          <h2 id="geo-tools-heading" className={styles.sectionTitle}>
            Available Geometric Calculations & Constructions
          </h2>
          <p className={styles.sectionDesc}>
            CritCalc provides an accurate dynamic geometry environment based on Euclidean geometry principles and Cartesian coordinate math:
          </p>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Coordinate Distances & Lengths</h3>
              <p className={styles.cardText}>
                Select the Distance / Ruler tool (<kbd>D</kbd>) to measure segment lengths between any two coordinates (x₁, y₁) and (x₂, y₂) in real centimeters.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Angle Measurement & Protractors</h3>
              <p className={styles.cardText}>
                Use the Angle Arc tool (<kbd>A</kbd>) to determine vertex angles between segments, or place an on-screen movable 360° protractor (<kbd>O</kbd>) to measure figures.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Midpoints & Orthogonal Bisectors</h3>
              <p className={styles.cardText}>
                Instantly compute midpoints (<kbd>M</kbd>) or drop perpendicular bisectors (<kbd>B</kbd>) across segments to divide lines into equal halves at 90°.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Circles & 3-Point Circumcircles</h3>
              <p className={styles.cardText}>
                Construct circles using a center and radius point (<kbd>C</kbd>), or determine the unique circumscribed circle passing through 3 non-collinear vertices (<kbd>Shift+C</kbd>).
              </p>
            </div>
          </div>
        </section>

        {/* Real Geometric Construction Examples */}
        <section className={styles.section} aria-labelledby="geo-examples-heading">
          <h2 id="geo-examples-heading" className={styles.sectionTitle}>
            Real Construction Examples
          </h2>

          <div className={styles.examplesGrid}>
            <div className={styles.exampleCard}>
              <div className={styles.exampleCategory}>CONSTRUCTION 1</div>
              <div className={styles.exampleName}>Perpendicular Bisector</div>
              <p className={styles.exampleSteps}>
                1. Draw segment AB with the Line tool (<kbd>L</kbd>).<br />
                2. Select Perpendicular Bisector (<kbd>B</kbd>).<br />
                3. Click line AB to create the perpendicular line through its exact midpoint.
              </p>
            </div>

            <div className={styles.exampleCard}>
              <div className={styles.exampleCategory}>CONSTRUCTION 2</div>
              <div className={styles.exampleName}>Triangle Circumcircle</div>
              <p className={styles.exampleSteps}>
                1. Draw a triangle using the Triangle tool (<kbd>T</kbd>).<br />
                2. Select 3-Point Circle (<kbd>Shift+C</kbd>).<br />
                3. Click the 3 vertices to generate the circumcircle.
              </p>
            </div>

            <div className={styles.exampleCard}>
              <div className={styles.exampleCategory}>CONSTRUCTION 3</div>
              <div className={styles.exampleName}>Angle Bisector</div>
              <p className={styles.exampleSteps}>
                1. Select the Angle Bisector tool (<kbd>Shift+B</kbd>).<br />
                2. Click ray 1, vertex, and ray 2.<br />
                3. The canvas draws the ray dividing the angle into two equal halves.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.section} aria-labelledby="geo-faq-heading">
          <h2 id="geo-faq-heading" className={styles.sectionTitle}>
            Geometry Calculator FAQs
          </h2>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                What coordinate units does CritCalc use?
              </summary>
              <div className={styles.faqAnswer}>
                CritCalc uses centimeters (cm) with an origin (0, 0), positive X extending right, and positive Y extending upward. Grid snapping can be customized in grid settings.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Can I undo mistakes while constructing shapes?
              </summary>
              <div className={styles.faqAnswer}>
                Yes. CritCalc retains a 40-step undo/redo history. Press <kbd>Ctrl+Z</kbd> to undo and <kbd>Ctrl+Y</kbd> to redo any geometric action.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Can I save my geometric diagrams?
              </summary>
              <div className={styles.faqAnswer}>
                Yes. Log in with your student account to save unlimited geometry canvases to the cloud via <Link to="/my-canvases">My Canvases</Link>.
              </div>
            </details>
          </div>
        </section>

        {/* Internal Links */}
        <div className={styles.linksRow}>
          <span className={styles.linksTitle}>Related Guides & Tools:</span>
          <Link to="/learn/geometry" className={styles.linkBadge}>Pythagorean Theorem Guide →</Link>
          <Link to="/learn/coordinate-geometry" className={styles.linkBadge}>Coordinate Geometry Lessons →</Link>
          <Link to="/scientific-calculator" className={styles.linkBadge}>Scientific Calculator →</Link>
          <Link to="/canvas" className={styles.linkBadge}>Full-Screen Canvas →</Link>
        </div>
      </div>
    </div>
  );
}
