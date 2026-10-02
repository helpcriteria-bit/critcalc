import React from 'react';
import ArticleHeader from '../../components/Learn/ArticleHeader';
import FormulaBox from '../../components/Learn/FormulaBox';
import WorkedExample from '../../components/Learn/WorkedExample';
import TryInCritCalc from '../../components/Learn/TryInCritCalc';
import FAQSection from '../../components/Learn/FAQSection';
import RelatedLessons from '../../components/Learn/RelatedLessons';
import SEO from '../../components/SEO/SEO';
import styles from '../../components/Learn/Learn.module.css';

export default function GeometryLesson() {
  const faqs = [
    {
      question: 'What is the Pythagorean Theorem?',
      answer: 'The Pythagorean Theorem states that in any right-angled Euclidean triangle, the square of the length of the hypotenuse (the side opposite the 90° right angle) equals the sum of the squares of the lengths of the other two sides: a² + b² = c².'
    },
    {
      question: 'How do you test if a triangle is a right triangle?',
      answer: 'By using the converse of the theorem: calculate the square of the longest side and compare it with the sum of the squares of the other two sides. If a² + b² = c², the angle opposite c is strictly 90°.'
    },
    {
      question: 'What are common integer Pythagorean triples?',
      answer: 'Well-known primitive triples include (3, 4, 5), (5, 12, 13), (8, 15, 17), and (7, 24, 25). Any integer scalar multiple (e.g. 6-8-10 or 9-12-15) also satisfies the theorem.'
    }
  ];

  return (
    <div className={styles.page}>
      <SEO route="/learn/geometry" />

      <div className={styles.container}>
        <ArticleHeader
          title="The Pythagorean Theorem: Formulas, Geometric Proofs, and Practical Applications"
          category="Class 10 Geometry"
          intro="The Pythagorean theorem forms the bedrock of Euclidean geometry, trigonometry, and coordinate geometry. Learn how to calculate hypotenuse lengths, apply the converse theorem, and construct right triangles on the geometry canvas."
          breadcrumbTitle="Geometry"
        />

        <div className={styles.bodyText}>
          <p>
            In any right triangle, the longest side is called the <strong>hypotenuse</strong> (labeled <em>c</em>), which lies directly opposite the 90° angle. The remaining two perpendicular segments are referred to as the <strong>legs</strong> (labeled <em>a</em> and <em>b</em>).
          </p>

          <FormulaBox
            title="THE PYTHAGOREAN RELATION"
            equation="a² + b² = c²"
            variables={[
              { symbol: 'a, b', description: 'Lengths of the two perpendicular legs' },
              { symbol: 'c', description: 'Length of the hypotenuse (longest side)' },
              { symbol: 'Hypotenuse formula', description: 'c = √(a² + b²)' },
              { symbol: 'Leg formula', description: 'a = √(c² - b²)' }
            ]}
          />

          <h2 className={styles.h2Heading}>Converse of the Pythagorean Theorem</h2>
          <p>
            The converse states that if the sides of a triangle satisfy <code>a² + b² = c²</code> (where <em>c</em> is the longest side), then the triangle is guaranteed to be a right-angled triangle, with the right angle positioned opposite side <em>c</em>.
          </p>
          <ul>
            <li><strong>If a² + b² = c²:</strong> Right-angled triangle (90°).</li>
            <li><strong>If a² + b² &gt; c²:</strong> Acute triangle (all angles &lt; 90°).</li>
            <li><strong>If a² + b² &lt; c²:</strong> Obtuse triangle (one angle &gt; 90°).</li>
          </ul>

          <h2 className={styles.h2Heading}>Step-by-Step Worked Examples</h2>

          <WorkedExample
            exampleNumber={1}
            question="A right triangle has perpendicular legs of length 6 cm and 8 cm. Find the length of the hypotenuse c."
            steps={[
              'Identify given side lengths: a = 6 cm, b = 8 cm.',
              'Substitute into the hypotenuse formula: c = √(a² + b²).',
              'Compute the squares: 6² = 36, 8² = 64.',
              'Sum the squares: 36 + 64 = 100.',
              'Extract the square root: c = √100 = 10 cm.'
            ]}
            solution="c = 10 cm"
          />

          <WorkedExample
            exampleNumber={2}
            question="The hypotenuse of a right triangle is 13 cm and one leg is 5 cm. Calculate the length of the other leg."
            steps={[
              'Identify knowns: c = 13 cm, a = 5 cm.',
              'Rearrange the equation for the unknown leg: b = √(c² - a²).',
              'Compute squares: 13² = 169, 5² = 25.',
              'Subtract: 169 - 25 = 144.',
              'Take the square root: b = √144 = 12 cm.'
            ]}
            solution="b = 12 cm"
          />

          <TryInCritCalc
            title="Construct and Measure in CritCalc Geometry Canvas"
            description="Draw a 6 cm by 8 cm right triangle using the Triangle or Segment tools, then select the Distance Ruler tool (D) or Protractor (O) to verify the 10 cm hypotenuse and 90° angle."
            primaryLink="/geometry-calculator"
            primaryLabel="Open Geometry Canvas →"
            secondaryLink="/scientific-calculator"
            secondaryLabel="Calculate Square Roots in Calculator →"
          />

          <FAQSection faqs={faqs} />

          <RelatedLessons currentPath="/learn/geometry" />
        </div>
      </div>
    </div>
  );
}
