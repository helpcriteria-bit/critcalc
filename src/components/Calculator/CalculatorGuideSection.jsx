import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/Calculator/CalculatorPage.module.css';

export default function CalculatorGuideSection() {
  return (
    <>
      {/* What is a Scientific Calculator Section */}
      <section className={styles.section} aria-labelledby="calc-overview-heading">
        <h2 id="calc-overview-heading" className={styles.sectionTitle}>
          What Is a Scientific Calculator?
        </h2>
        <p className={styles.sectionText}>
          A scientific calculator is an advanced mathematical tool engineered to perform calculations beyond basic arithmetic. It allows students and engineers to compute trigonometric ratios, calculate powers and square roots, evaluate common and natural logarithms, compute factorials, and manage memory storage. CritCalc’s scientific calculator evaluates expressions live in real time while displaying calculation history and supporting full keyboard hotkeys.
        </p>

        <h3 className={styles.sectionTitle} style={{ fontSize: '18px', marginTop: '24px' }}>
          Supported Mathematical Operations & Functions
        </h3>
        <p className={styles.sectionText}>
          Every function listed below is implemented directly in CritCalc’s expression engine:
        </p>

        <div className={styles.opsGrid}>
          <div className={styles.opCategory}>
            <div className={styles.opCategoryTitle}>Trigonometric Functions</div>
            <ul className={styles.opList}>
              <li><strong>sin, cos, tan</strong> — Primary trigonometric functions.</li>
              <li><strong>sin⁻¹ (asin), cos⁻¹ (acos), tan⁻¹ (atan)</strong> — Inverse trigonometric functions.</li>
              <li><strong>DEG / RAD Mode</strong> — Toggle angle interpretation between degrees and radians at any time.</li>
            </ul>
          </div>

          <div className={styles.opCategory}>
            <div className={styles.opCategoryTitle}>Powers, Roots & Reciprocals</div>
            <ul className={styles.opList}>
              <li><strong>√ (sqrt)</strong> — Compute square roots of non-negative values.</li>
              <li><strong>x² & xʸ</strong> — Raise numbers to square or arbitrary exponent powers.</li>
              <li><strong>1/x (recip)</strong> — Compute reciprocal values (multiplicative inverse).</li>
            </ul>
          </div>

          <div className={styles.opCategory}>
            <div className={styles.opCategoryTitle}>Logarithms & Constants</div>
            <ul className={styles.opList}>
              <li><strong>log</strong> — Common logarithm (base 10).</li>
              <li><strong>ln</strong> — Natural logarithm (base e).</li>
              <li><strong>π (Pi)</strong> — Archimedes constant (≈ 3.14159265).</li>
              <li><strong>e</strong> — Euler’s mathematical constant (≈ 2.71828182).</li>
            </ul>
          </div>

          <div className={styles.opCategory}>
            <div className={styles.opCategoryTitle}>Memory & History Registers</div>
            <ul className={styles.opList}>
              <li><strong>M+ & M−</strong> — Accumulate or subtract values to/from memory.</li>
              <li><strong>MR & MC</strong> — Recall or clear stored memory value.</li>
              <li><strong>ANS</strong> — Re-insert the previous calculated answer.</li>
              <li><strong>History Stack</strong> — Click any past calculation to restore it.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Genuine Examples Section */}
      <section className={styles.section} aria-labelledby="calc-examples-heading">
        <h2 id="calc-examples-heading" className={styles.sectionTitle}>
          Step-by-Step Calculation Examples
        </h2>
        <p className={styles.sectionText}>
          Try entering these sample mathematical expressions directly into CritCalc:
        </p>

        <div className={styles.examplesGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleHeader}>TRIGONOMETRY</div>
            <div className={styles.exampleExpr}>sin(30) + cos(60)</div>
            <div className={styles.exampleExpl}>
              In DEG mode, sin(30°) = 0.5 and cos(60°) = 0.5. Result: <strong>1</strong>.
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleHeader}>POWERS & ROOTS</div>
            <div className={styles.exampleExpr}>sqrt(144) + 5^2</div>
            <div className={styles.exampleExpl}>
              Square root of 144 is 12, plus 25 (5 squared). Result: <strong>37</strong>.
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleHeader}>FACTORIAL & LOGS</div>
            <div className={styles.exampleExpr}>5! - log(1000)</div>
            <div className={styles.exampleExpl}>
              5 factorial is 120, minus log base 10 of 1000 (3). Result: <strong>117</strong>.
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className={styles.section} aria-labelledby="calc-faq-heading">
        <h2 id="calc-faq-heading" className={styles.sectionTitle}>
          Scientific Calculator FAQs
        </h2>

        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              How do I switch between Degrees and Radians?
            </summary>
            <div className={styles.faqAnswer}>
              Click the <strong>DEG/RAD</strong> button on the bottom row of the calculator. When set to DEG, angles in functions like sin(90) are evaluated in degrees (returning 1). In RAD mode, angles are evaluated in radians (e.g. sin(π/2) = 1).
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              Can I use keyboard shortcuts on my laptop or desktop?
            </summary>
            <div className={styles.faqAnswer}>
              Yes! You can type numbers 0-9 directly, arithmetic operators (+, -, *, /), parentheses (), caret (^) for powers, exclamation (!) for factorials, Enter or = to calculate, Backspace to delete, and Escape to clear the display.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              How do memory functions (M+, M-, MR, MC) work?
            </summary>
            <div className={styles.faqAnswer}>
              M+ adds the current result to the stored memory number, M- subtracts the current result from memory, MR recalls and pastes the memory number into your expression, and MC resets the stored memory back to 0.
            </div>
          </details>
        </div>
      </section>

      {/* Internal Links to Learning Topics */}
      <section className={styles.linksSection} aria-label="Related mathematics guides">
        <div className={styles.linksTitle}>Related Learning Guides & Tools:</div>
        <div className={styles.linksRow}>
          <Link to="/learn/trigonometry" className={styles.linkBadge}>Trigonometric Ratios Guide →</Link>
          <Link to="/learn/algebra" className={styles.linkBadge}>Quadratic Equations Lesson →</Link>
          <Link to="/geometry-calculator" className={styles.linkBadge}>Geometry Calculator Canvas →</Link>
          <Link to="/math-tutor" className={styles.linkBadge}>Ask AI Math Tutor →</Link>
        </div>
      </section>
    </>
  );
}
