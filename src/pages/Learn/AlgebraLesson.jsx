import React from 'react';
import ArticleHeader from '../../components/Learn/ArticleHeader';
import FormulaBox from '../../components/Learn/FormulaBox';
import WorkedExample from '../../components/Learn/WorkedExample';
import TryInCritCalc from '../../components/Learn/TryInCritCalc';
import FAQSection from '../../components/Learn/FAQSection';
import RelatedLessons from '../../components/Learn/RelatedLessons';
import SEO from '../../components/SEO/SEO';
import styles from '../../components/Learn/Learn.module.css';

export default function AlgebraLesson() {
  const faqs = [
    {
      question: 'What is a quadratic equation in standard form?',
      answer: 'A quadratic equation is a second-degree polynomial equation expressed in standard form as ax² + bx + c = 0, where a, b, and c are real coefficients and a ≠ 0.'
    },
    {
      question: 'How do you know whether to use factoring or the quadratic formula?',
      answer: 'If the quadratic expression can be easily factored into two binomials (such as x² - 5x + 6 = (x - 2)(x - 3)), factoring is faster. The quadratic formula works universally for every quadratic equation, including those with non-integer or irrational roots.'
    },
    {
      question: 'What does the discriminant (b² - 4ac) indicate about roots?',
      answer: 'The discriminant D = b² - 4ac determines the nature of the roots without full evaluation: if D > 0, the equation has two distinct real roots; if D = 0, exactly one real root (repeated); if D < 0, there are no real roots (two complex conjugate solutions).'
    }
  ];

  return (
    <div className={styles.page}>
      <SEO route="/learn/algebra" />

      <div className={styles.container}>
        <ArticleHeader
          title="Understanding Quadratic Equations: Formulas, Discriminant, and Worked Examples"
          category="Class 10 Algebra"
          intro="Quadratic equations are second-degree polynomial equations essential to algebra, geometry, and physics. Learn how to solve them using the quadratic formula, analyze root types using the discriminant, and verify your answers."
          breadcrumbTitle="Algebra"
        />

        <div className={styles.bodyText}>
          <p>
            In mathematics, a quadratic equation contains at least one squared term. The standard form is:
          </p>

          <FormulaBox
            title="STANDARD QUADRATIC FORM"
            equation="ax² + bx + c = 0   (where a ≠ 0)"
            variables={[
              { symbol: 'a', description: 'Quadratic coefficient (must not equal zero)' },
              { symbol: 'b', description: 'Linear coefficient' },
              { symbol: 'c', description: 'Constant term' }
            ]}
          />

          <h2 className={styles.h2Heading}>The Quadratic Formula</h2>
          <p>
            When a quadratic equation cannot be factored easily by inspection, the universal <strong>quadratic formula</strong> provides both roots directly by isolating x through the completion of squares:
          </p>

          <FormulaBox
            title="THE QUADRATIC FORMULA"
            equation="x = (-b ± √(b² - 4ac)) / (2a)"
            variables={[
              { symbol: '±', description: 'Indicates two possible solutions: one adding the square root, one subtracting' },
              { symbol: 'b² - 4ac', description: 'The discriminant (D)' }
            ]}
          />

          <h2 className={styles.h2Heading}>The Discriminant and Nature of Roots</h2>
          <p>
            The expression inside the radical, <code>D = b² - 4ac</code>, is called the <strong>discriminant</strong>. Its sign determines the graphical behavior of the parabola:
          </p>
          <ul>
            <li><strong>D &gt; 0:</strong> Two distinct real roots. The parabola crosses the X-axis twice.</li>
            <li><strong>D = 0:</strong> One repeated real root (x = -b / 2a). The vertex of the parabola touches the X-axis at one point.</li>
            <li><strong>D &lt; 0:</strong> No real roots. The parabola lies entirely above or below the X-axis without crossing it.</li>
          </ul>

          <h2 className={styles.h2Heading}>Worked Examples</h2>

          <WorkedExample
            exampleNumber={1}
            question="Solve x² - 5x + 6 = 0 using the quadratic formula."
            steps={[
              'Identify coefficients: a = 1, b = -5, c = 6.',
              'Calculate discriminant: D = (-5)² - 4(1)(6) = 25 - 24 = 1. Since D > 0, there are two distinct real roots.',
              'Substitute into the formula: x = (-(-5) ± √1) / (2 · 1) = (5 ± 1) / 2.',
              'Evaluate both branches: x₁ = (5 + 1)/2 = 3; x₂ = (5 - 1)/2 = 2.'
            ]}
            solution="x = 2 or x = 3"
          />

          <WorkedExample
            exampleNumber={2}
            question="Find the roots of 2x² - 4x + 2 = 0."
            steps={[
              'Identify coefficients: a = 2, b = -4, c = 2.',
              'Calculate discriminant: D = (-4)² - 4(2)(2) = 16 - 16 = 0. Since D = 0, there is exactly one repeated real root.',
              'Substitute into the formula: x = (-(-4) ± √0) / (2 · 2) = 4 / 4 = 1.'
            ]}
            solution="x = 1 (repeated root of multiplicity 2)"
          />

          <TryInCritCalc
            title="Verify Quadratic Solutions in CritCalc"
            description="Use CritCalc’s scientific calculator to quickly compute the discriminant and evaluate both branches of (-b ± √(b² - 4ac)) / (2a)."
            primaryLink="/scientific-calculator"
            primaryLabel="Open Scientific Calculator →"
            secondaryLink="/math-tutor"
            secondaryLabel="Ask AI Tutor for Step-by-Step Proof →"
          />

          <FAQSection faqs={faqs} />

          <RelatedLessons currentPath="/learn/algebra" />
        </div>
      </div>
    </div>
  );
}
