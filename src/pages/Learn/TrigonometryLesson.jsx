import React from 'react';
import ArticleHeader from '../../components/Learn/ArticleHeader';
import FormulaBox from '../../components/Learn/FormulaBox';
import WorkedExample from '../../components/Learn/WorkedExample';
import TryInCritCalc from '../../components/Learn/TryInCritCalc';
import FAQSection from '../../components/Learn/FAQSection';
import RelatedLessons from '../../components/Learn/RelatedLessons';
import SEO from '../../components/SEO/SEO';
import styles from '../../components/Learn/Learn.module.css';

export default function TrigonometryLesson() {
  const faqs = [
    {
      question: 'What do sin, cos, and tan represent in a right triangle?',
      answer: 'In a right triangle with acute angle θ: sin(θ) is the ratio of Opposite side over Hypotenuse, cos(θ) is Adjacent side over Hypotenuse, and tan(θ) is Opposite side over Adjacent side (or sin(θ)/cos(θ)).'
    },
    {
      question: 'Why does my calculator give a negative or decimal value for sin(30)?',
      answer: 'This happens if your calculator is set to Radians (RAD) mode instead of Degrees (DEG). In Radians, 30 is interpreted as 30 radians (≈ 1718.87°). Toggle to DEG mode on CritCalc to obtain the expected sin(30°) = 0.5.'
    },
    {
      question: 'What is the Pythagorean trigonometric identity?',
      answer: 'The fundamental identity is sin²(θ) + cos²(θ) = 1 for any real angle θ. It directly reflects the Pythagorean theorem on the unit circle.'
    }
  ];

  return (
    <div className={styles.page}>
      <SEO route="/learn/trigonometry" />

      <div className={styles.container}>
        <ArticleHeader
          title="Introduction to Trigonometry: Ratios, Standard Angles, and Inverse Functions"
          category="Class 10 Trigonometry"
          intro="Trigonometry studies the relationships between the side lengths and angles of triangles. Learn the definitions of sine, cosine, and tangent, review exact values for standard angles, and calculate inverse trigonometric ratios."
          breadcrumbTitle="Trigonometry"
        />

        <div className={styles.bodyText}>
          <p>
            Consider a right-angled triangle where one of the acute angles is designated as <strong>θ</strong> (theta). With respect to θ, the three sides are classified as:
          </p>
          <ul>
            <li><strong>Hypotenuse:</strong> The longest side, opposite the 90° angle.</li>
            <li><strong>Opposite:</strong> The leg facing directly across from angle θ.</li>
            <li><strong>Adjacent:</strong> The leg touching angle θ that is not the hypotenuse.</li>
          </ul>

          <FormulaBox
            title="PRIMARY TRIGONOMETRIC RATIOS"
            equation="sin(θ) = Opp / Hyp   |   cos(θ) = Adj / Hyp   |   tan(θ) = Opp / Adj"
            variables={[
              { symbol: 'sin(θ)', description: 'Sine ratio (Opposite / Hypotenuse)' },
              { symbol: 'cos(θ)', description: 'Cosine ratio (Adjacent / Hypotenuse)' },
              { symbol: 'tan(θ)', description: 'Tangent ratio (Opposite / Adjacent = sin(θ) / cos(θ))' }
            ]}
          />

          <h2 className={styles.h2Heading}>Standard Angles Reference Values</h2>
          <p>
            In secondary school math (Class 10 CBSE and ICSE), certain standard angles appear frequently in geometry problems:
          </p>

          <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--theme)' }}>Ratio / Angle</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text)' }}>0° (0 rad)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text)' }}>30° (π/6)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text)' }}>45° (π/4)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text)' }}>60° (π/3)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text)' }}>90° (π/2)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--theme)' }}>sin(θ)</td>
                  <td style={{ padding: '10px 14px' }}>0</td>
                  <td style={{ padding: '10px 14px' }}>1/2 (0.5)</td>
                  <td style={{ padding: '10px 14px' }}>1/√2 (≈ 0.707)</td>
                  <td style={{ padding: '10px 14px' }}>√3/2 (≈ 0.866)</td>
                  <td style={{ padding: '10px 14px' }}>1</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--theme)' }}>cos(θ)</td>
                  <td style={{ padding: '10px 14px' }}>1</td>
                  <td style={{ padding: '10px 14px' }}>√3/2 (≈ 0.866)</td>
                  <td style={{ padding: '10px 14px' }}>1/√2 (≈ 0.707)</td>
                  <td style={{ padding: '10px 14px' }}>1/2 (0.5)</td>
                  <td style={{ padding: '10px 14px' }}>0</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--theme)' }}>tan(θ)</td>
                  <td style={{ padding: '10px 14px' }}>0</td>
                  <td style={{ padding: '10px 14px' }}>1/√3 (≈ 0.577)</td>
                  <td style={{ padding: '10px 14px' }}>1</td>
                  <td style={{ padding: '10px 14px' }}>√3 (≈ 1.732)</td>
                  <td style={{ padding: '10px 14px', color: 'var(--red)' }}>Undefined</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className={styles.h2Heading}>Degree vs. Radian Mode</h2>
          <p>
            An angle can be expressed in degrees (where a full rotation is 360°) or in radians (where a full rotation is 2π radians). When evaluating expressions such as <code>sin(30)</code> on CritCalc, ensure the <strong>DEG</strong> badge is active on the display.
          </p>

          <h2 className={styles.h2Heading}>Worked Examples</h2>

          <WorkedExample
            exampleNumber={1}
            question="Find the height of a flagpole if the angle of elevation from a point 10 meters away is 30°."
            steps={[
              'Draw the right triangle: Adjacent side = 10 m, Angle θ = 30°, Unknown height = Opposite side (h).',
              'Choose the applicable ratio: tan(θ) = Opposite / Adjacent.',
              'Substitute values: tan(30°) = h / 10.',
              'Solve for h: h = 10 · tan(30°).',
              'Since tan(30°) = 1/√3 ≈ 0.57735: h = 10 · 0.57735 ≈ 5.77 m.'
            ]}
            solution="h ≈ 5.77 meters"
          />

          <WorkedExample
            exampleNumber={2}
            question="Evaluate the expression sin²(45°) + cos²(45°)."
            steps={[
              'From standard values: sin(45°) = 1/√2 and cos(45°) = 1/√2.',
              'Square each term: (1/√2)² = 1/2 and (1/√2)² = 1/2.',
              'Add the fractions: 1/2 + 1/2 = 1.',
              'This verifies the identity sin²(θ) + cos²(θ) = 1.'
            ]}
            solution="1"
          />

          <TryInCritCalc
            title="Calculate Trigonometric Expressions in CritCalc"
            description="Open the Scientific Calculator to evaluate sin, cos, tan, and their inverses (asin, acos, atan). Use the DEG/RAD button to instantly toggle angle units."
            primaryLink="/scientific-calculator"
            primaryLabel="Open Scientific Calculator →"
            secondaryLink="/geometry-calculator"
            secondaryLabel="Measure Angles with Protractor →"
          />

          <FAQSection faqs={faqs} />

          <RelatedLessons currentPath="/learn/trigonometry" />
        </div>
      </div>
    </div>
  );
}
