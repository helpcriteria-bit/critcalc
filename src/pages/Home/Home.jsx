import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <SEO route="/" />

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <p className={styles.eyebrow}>A friendlier way to work through maths</p>
          <h1 className={styles.h1Title}>
            Free Online Math Calculator, Geometry Tools & Math Tutor
            <span className={styles.tagline}>Draw. Calculate. Understand.</span>
          </h1>
          <p className={styles.subheading}>
            CritCalc brings together a live scientific calculator, an interactive geometry canvas with precision geometric constructions, and an AI math tutor designed for Class 10 and high school students.
          </p>
          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate('/canvas')}
            >
              Open Geometry Canvas →
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate('/calculator')}
            >
              Scientific Calculator →
            </button>
            <button
              type="button"
              className={styles.btnTertiary}
              onClick={() => navigate('/tutor')}
            >
              Try AI Tutor →
            </button>
          </div>
        </section>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Features Section */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className={styles.featuresLabel}>Choose a tool to get started</h2>
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
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>Dynamic Geometry Canvas</h2>
              <p className={styles.cardDesc}>
                Draw points, lines, circles, triangles, rectangles, and polygons. Construct midpoints, perpendiculars, angle bisectors, and measure distances and angles with 40-step undo/redo.
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>Constructions</span>
                <span className={styles.tag}>Bisectors</span>
                <span className={styles.tag}>Protractor</span>
                <span className={styles.tag}>Centimeter Grid</span>
              </div>
              <Link to="/geometry-calculator" className={styles.cardLink}>
                Explore Geometry Tools →
              </Link>
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
                  aria-hidden="true"
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
                Real-time algebraic and trigonometric evaluations with sin, cos, tan, inverse trigonometry, logarithms, roots, powers, factorials, DEG/RAD toggle, and memory registers.
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>Trigonometry</span>
                <span className={styles.tag}>Logarithms</span>
                <span className={styles.tag}>Powers & Roots</span>
                <span className={styles.tag}>Memory (M+/MR)</span>
              </div>
              <Link to="/scientific-calculator" className={styles.cardLink}>
                Use Scientific Calculator →
              </Link>
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
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>AI Math Tutor</h2>
              <p className={styles.cardDesc}>
                Ask step-by-step questions about theorems, algebra, trigonometry proofs, and coordinate geometry. Real-time streaming explanations powered by Groq inference.
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>Groq Streaming</span>
                <span className={styles.tag}>Theorem Proofs</span>
                <span className={styles.tag}>Class 10 Syllabus</span>
              </div>
              <Link to="/math-tutor" className={styles.cardLink}>
                Open AI Math Tutor →
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="steps-heading">
          <h2 id="steps-heading" className={styles.sectionHeading}>How to use CritCalc</h2>
          <p className={styles.sectionSub}>
            Start with the question you are working on, choose the tool that fits, and use the explanation or drawing to check your understanding.
          </p>
          <ol className={styles.stepsGrid}>
            <li className={styles.stepCard}>
              <span className={styles.stepNumber} aria-hidden="true">01</span>
              <h3 className={styles.topicTitle}>Choose your workspace</h3>
              <p className={styles.topicDesc}>Calculate an expression, build a geometry diagram, or ask the tutor about a maths idea.</p>
              <Link to="/calculator" className={styles.cardLink}>Browse the tools →</Link>
            </li>
            <li className={styles.stepCard}>
              <span className={styles.stepNumber} aria-hidden="true">02</span>
              <h3 className={styles.topicTitle}>Enter a problem or make a diagram</h3>
              <p className={styles.topicDesc}>Type an expression, use the canvas toolbar to add shapes, or ask a clear question with the details you know.</p>
              <Link to="/canvas" className={styles.cardLink}>Open the geometry canvas →</Link>
            </li>
            <li className={styles.stepCard}>
              <span className={styles.stepNumber} aria-hidden="true">03</span>
              <h3 className={styles.topicTitle}>Check the steps and keep learning</h3>
              <p className={styles.topicDesc}>Review the result, explore a worked lesson, or ask the AI tutor to explain a step in a different way.</p>
              <Link to="/learn" className={styles.cardLink}>Explore maths guides →</Link>
            </li>
          </ol>
          <p className={styles.helpNote}>
            You can use the calculator and canvas without an account. Sign in when you want to save and reopen geometry projects.
          </p>
        </section>

        {/* Section 2: Educational Learning Guides */}
        <section className={styles.section} aria-labelledby="learn-heading">
          <h2 id="learn-heading" className={styles.sectionHeading}>
            Class 10 & High School Math Learning Guides
          </h2>
          <p className={styles.sectionSub}>
            Deepen your conceptual understanding with clear mathematical explanations, formulas, worked examples, and direct links to verify solutions in CritCalc.
          </p>

          <div className={styles.topicsGrid}>
            <Link to="/learn/algebra" className={styles.topicCard}>
              <h3 className={styles.topicTitle}>Quadratic Equations & Discriminants</h3>
              <p className={styles.topicDesc}>
                Learn the quadratic formula, factoring techniques, and discriminant classification to solve ax² + bx + c = 0.
              </p>
              <span className={styles.topicMeta}>Read Lesson & Try Examples →</span>
            </Link>

            <Link to="/learn/geometry" className={styles.topicCard}>
              <h3 className={styles.topicTitle}>Pythagorean Theorem & Right Triangles</h3>
              <p className={styles.topicDesc}>
                Explore a² + b² = c², proof methods, Pythagorean triples, and dynamic constructions on the CritCalc canvas.
              </p>
              <span className={styles.topicMeta}>Read Lesson & Construct →</span>
            </Link>

            <Link to="/learn/trigonometry" className={styles.topicCard}>
              <h3 className={styles.topicTitle}>Trigonometric Ratios (Sin, Cos, Tan)</h3>
              <p className={styles.topicDesc}>
                Master standard angles (0°, 30°, 45°, 60°, 90°), reciprocal functions, and degree vs. radian conversions.
              </p>
              <span className={styles.topicMeta}>Read Lesson & Calculate →</span>
            </Link>

            <Link to="/learn/coordinate-geometry" className={styles.topicCard}>
              <h3 className={styles.topicTitle}>Coordinate Geometry & Shoelace Formula</h3>
              <p className={styles.topicDesc}>
                Calculate Euclidean distance, segment midpoints, and polygon areas using Cartesian coordinates and grid snapping.
              </p>
              <span className={styles.topicMeta}>Read Lesson & Explore →</span>
            </Link>
          </div>
        </section>

        {/* Section 3: Frequently Asked Questions */}
        <section className={styles.section} aria-labelledby="faq-heading">
          <h2 id="faq-heading" className={styles.sectionHeading}>
            Frequently Asked Questions
          </h2>
          <p className={styles.sectionSub}>
            Everything you need to know about using CritCalc for schoolwork, exam preparation, and mathematical exploration.
          </p>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                What makes CritCalc different from an ordinary calculator?
              </summary>
              <div className={styles.faqAnswer}>
                Unlike static desktop calculators, CritCalc integrates three complementary tools: a live scientific calculator with keyboard navigation, an interactive geometry construction canvas with centimeter grid snapping and measurement tools, and an AI Math Tutor that explains theorems and answers math queries in real time.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Can I perform geometric constructions like angle bisectors and perpendiculars?
              </summary>
              <div className={styles.faqAnswer}>
                Yes. The CritCalc canvas includes dedicated construction tools for midpoints, perpendicular lines, parallel lines, perpendicular bisectors, angle bisectors, circle tangents, and intersection detection, along with interactive distance rulers and protractors.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                How does the AI Math Tutor assist with homework?
              </summary>
              <div className={styles.faqAnswer}>
                The AI Math Tutor uses ultra-fast Groq streaming inference to provide step-by-step explanations, guide you through geometric proofs, explain trigonometric formulas, and help you understand the reasoning behind math solutions.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Is my work saved automatically?
              </summary>
              <div className={styles.faqAnswer}>
                Signing in with your student Google account gives you access to student cloud storage in <Link to="/my-canvases">My Canvases</Link>, where you can save, rename, duplicate, and reopen your geometric projects anytime.
              </div>
            </details>
          </div>
        </section>

        {/* Footer Directory */}
        <footer className={styles.footerDirectory}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerColTitle}>Interactive Tools</div>
              <ul className={styles.footerLinks}>
                <li><Link to="/calculator">Scientific Calculator</Link></li>
                <li><Link to="/canvas">Interactive Geometry Canvas</Link></li>
                <li><Link to="/tutor">AI Math Tutor</Link></li>
                <li><Link to="/my-canvases">Student Canvas Cloud</Link></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerColTitle}>Dedicated Landing Pages</div>
              <ul className={styles.footerLinks}>
                <li><Link to="/scientific-calculator">Free Scientific Calculator Online</Link></li>
                <li><Link to="/geometry-calculator">Online Geometry Calculator</Link></li>
                <li><Link to="/math-tutor">AI Math Tutor Assistant</Link></li>
              </ul>
            </div>
            <div>
              <div className={styles.footerColTitle}>Math Learning Guides</div>
              <ul className={styles.footerLinks}>
                <li><Link to="/learn">Math Guides Overview</Link></li>
                <li><Link to="/learn/algebra">Quadratic Equations & Algebra</Link></li>
                <li><Link to="/learn/geometry">Pythagorean Theorem & Geometry</Link></li>
                <li><Link to="/learn/trigonometry">Trigonometric Ratios Table</Link></li>
                <li><Link to="/learn/coordinate-geometry">Coordinate Geometry & Distance</Link></li>
              </ul>
            </div>
          </div>
          <p className={styles.contact}>
            Questions or feedback? <a href="mailto:help.criteria@gmail.com">Email the CritCalc team</a>.
          </p>
        </footer>
      </div>
    </div>
  );
}
