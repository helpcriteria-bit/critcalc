import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TutorGuideSection.module.css';

export default function TutorGuideSection() {
  return (
    <div className={styles.guideWrapper}>
      {/* Overview & How Students Can Use It */}
      <section className={styles.section} aria-labelledby="tutor-overview-heading">
        <h2 id="tutor-overview-heading" className={styles.sectionTitle}>
          How the AI Math Tutor Works
        </h2>
        <p className={styles.sectionText}>
          CritCalc’s AI Math Tutor provides real-time, conversational math assistance powered by Groq streaming inference. It is designed to act as an interactive study companion for Class 10 and high school students, breaking complex mathematical problems into digestible, step-by-step explanations.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Streaming Step-by-Step Proofs</h3>
            <p className={styles.cardDesc}>
              Ask about Euclidean theorems, similarity criteria (AA, SAS, SSS), circle tangents, or algebraic derivations. The tutor streams reasoned solutions line by line.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Canvas Drawing Integration</h3>
            <p className={styles.cardDesc}>
              When working in canvas mode, the AI tutor can utilize tool calls to plot points, segments, circles, and triangles directly onto your interactive coordinate plane.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Curriculum Alignment</h3>
            <p className={styles.cardDesc}>
              Focused on secondary school mathematics, including quadratic equations, trigonometric identities, coordinate geometry formulas, and surface area & volume.
            </p>
          </div>
        </div>
      </section>

      {/* Suggested Prompts */}
      <section className={styles.section} aria-labelledby="tutor-prompts-heading">
        <h2 id="tutor-prompts-heading" className={styles.sectionTitle}>
          Sample Questions to Try
        </h2>
        <div className={styles.promptList}>
          <div className={styles.promptItem}>
            <code>"Explain the Pythagorean theorem with a geometric proof."</code>
          </div>
          <div className={styles.promptItem}>
            <code>"How do I find the roots of 2x² - 5x + 3 = 0 using the quadratic formula?"</code>
          </div>
          <div className={styles.promptItem}>
            <code>"Prove that tangents drawn from an external point to a circle are equal in length."</code>
          </div>
          <div className={styles.promptItem}>
            <code>"Derive the distance formula from the Pythagorean theorem on Cartesian coordinates."</code>
          </div>
        </div>
      </section>

      {/* Accuracy & Safe Usage Guidelines */}
      <section className={styles.section} aria-labelledby="tutor-guidelines-heading">
        <h2 id="tutor-guidelines-heading" className={styles.sectionTitle}>
          Academic Integrity & Verification
        </h2>
        <p className={styles.sectionText}>
          The AI Tutor is an educational guide created to explain conceptual math methods rather than replace independent problem-solving. Always verify numeric calculations using CritCalc’s built-in <Link to="/calculator">Scientific Calculator</Link> and test geometric claims with the <Link to="/canvas">Geometry Canvas</Link>.
        </p>
      </section>

      {/* FAQs */}
      <section className={styles.section} aria-labelledby="tutor-faq-heading">
        <h2 id="tutor-faq-heading" className={styles.sectionTitle}>
          AI Math Tutor FAQs
        </h2>

        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              Do I need an API key to use the AI Math Tutor?
            </summary>
            <div className={styles.faqAnswer}>
              If a shared Groq key is configured on the host server, the tutor works immediately. You can also connect your own free Groq API key anytime by clicking the key status indicator in the top navbar.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              Can the AI Tutor draw on my canvas automatically?
            </summary>
            <div className={styles.faqAnswer}>
              Yes. When the "Allow AI to draw" preference is enabled, the AI tutor uses structured function calling to draw points, lines, circles, and polygons on your geometry workspace.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              What happens to my chat history?
            </summary>
            <div className={styles.faqAnswer}>
              Your current conversation session stays active in your browser. You can clear the chat at any time using the Clear Chat button.
            </div>
          </details>
        </div>
      </section>

      {/* Internal Links */}
      <div className={styles.linksRow}>
        <span className={styles.linksLabel}>Related Tools & Lessons:</span>
        <Link to="/calculator" className={styles.linkBadge}>Scientific Calculator →</Link>
        <Link to="/canvas" className={styles.linkBadge}>Interactive Geometry Canvas →</Link>
        <Link to="/learn/algebra" className={styles.linkBadge}>Quadratic Equations Lesson →</Link>
        <Link to="/learn/geometry" className={styles.linkBadge}>Pythagorean Theorem Guide →</Link>
      </div>
    </div>
  );
}
