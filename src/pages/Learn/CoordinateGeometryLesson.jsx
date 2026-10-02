import React from 'react';
import ArticleHeader from '../../components/Learn/ArticleHeader';
import FormulaBox from '../../components/Learn/FormulaBox';
import WorkedExample from '../../components/Learn/WorkedExample';
import TryInCritCalc from '../../components/Learn/TryInCritCalc';
import FAQSection from '../../components/Learn/FAQSection';
import RelatedLessons from '../../components/Learn/RelatedLessons';
import SEO from '../../components/SEO/SEO';
import styles from '../../components/Learn/Learn.module.css';

export default function CoordinateGeometryLesson() {
  const faqs = [
    {
      question: 'How is the distance formula related to the Pythagorean theorem?',
      answer: 'The distance formula is a direct application of the Pythagorean theorem on a 2D Cartesian plane: the horizontal difference (x₂ - x₁) and vertical difference (y₂ - y₁) form the two perpendicular legs of a right triangle, while the Euclidean distance d represents the hypotenuse: d² = (Δx)² + (Δy)².'
    },
    {
      question: 'What is the Shoelace Formula for polygon area?',
      answer: 'The Shoelace formula computes the exact area of any simple polygon given the Cartesian coordinates of its vertices listed in sequential order around its perimeter. It multiplies diagonal coordinate pairs, subtracts opposing diagonal pairs, and takes half the absolute value.'
    },
    {
      question: 'How do you check if three points are collinear?',
      answer: 'Three points A, B, and C are collinear if the area of the triangle formed by them is zero, or if the slopes between AB and BC are identical: (y₂ - y₁)/(x₂ - x₁) = (y₃ - y₂)/(x₃ - x₂).'
    }
  ];

  return (
    <div className={styles.page}>
      <SEO route="/learn/coordinate-geometry" />

      <div className={styles.container}>
        <ArticleHeader
          title="Coordinate Geometry Formulas: Distance, Midpoint, and Shoelace Area"
          category="Class 10 Coordinate Geometry"
          intro="Coordinate geometry unites algebra and Euclidean geometry on a 2D Cartesian plane. Learn the distance formula, midpoint formula, section formula, and how to calculate polygon areas with the Shoelace formula."
          breadcrumbTitle="Coordinate Geometry"
        />

        <div className={styles.bodyText}>
          <p>
            In a two-dimensional Cartesian plane, any geometric point is uniquely determined by an ordered pair <strong>(x, y)</strong>, representing horizontal and vertical distances from the origin (0, 0).
          </p>

          <h2 className={styles.h2Heading}>The Distance Formula</h2>
          <p>
            The straight-line Euclidean distance <em>d</em> between two points P(x₁, y₁) and Q(x₂, y₂) is given by:
          </p>

          <FormulaBox
            title="EUCLIDEAN DISTANCE FORMULA"
            equation="d = √((x₂ - x₁)² + (y₂ - y₁)²)"
            variables={[
              { symbol: '(x₁, y₁)', description: 'Coordinates of the first point' },
              { symbol: '(x₂, y₂)', description: 'Coordinates of the second point' },
              { symbol: 'd', description: 'Straight-line length between the two points in centimeters' }
            ]}
          />

          <h2 className={styles.h2Heading}>The Midpoint Formula</h2>
          <p>
            The midpoint <em>M</em> of a line segment connecting endpoints (x₁, y₁) and (x₂, y₂) is the arithmetic mean of its coordinates:
          </p>

          <FormulaBox
            title="MIDPOINT FORMULA"
            equation="M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)"
            variables={[
              { symbol: 'M_x', description: 'Halfway horizontal coordinate (x₁ + x₂) / 2' },
              { symbol: 'M_y', description: 'Halfway vertical coordinate (y₁ + y₂) / 2' }
            ]}
          />

          <h2 className={styles.h2Heading}>Area of a Triangle & Polygon (Shoelace Formula)</h2>
          <p>
            The area of a triangle with vertices (x₁, y₁), (x₂, y₂), and (x₃, y₃) is:
          </p>

          <FormulaBox
            title="TRIANGLE COORDINATE AREA FORMULA"
            equation="Area = (1/2) · |x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)|"
            variables={[
              { symbol: '|...|', description: 'Absolute value ensuring area is strictly positive' },
              { symbol: 'Collinearity test', description: 'If Area = 0, the three points lie on the same straight line.' }
            ]}
          />

          <h2 className={styles.h2Heading}>Worked Examples</h2>

          <WorkedExample
            exampleNumber={1}
            question="Find the distance between points A(1, 2) and B(4, 6) on the coordinate plane."
            steps={[
              'Identify coordinates: x₁ = 1, y₁ = 2 and x₂ = 4, y₂ = 6.',
              'Calculate coordinate differences: Δx = 4 - 1 = 3, Δy = 6 - 2 = 4.',
              'Square each difference: 3² = 9, 4² = 16.',
              'Sum the squares: 9 + 16 = 25.',
              'Extract the square root: d = √25 = 5 cm.'
            ]}
            solution="d = 5 cm"
          />

          <WorkedExample
            exampleNumber={2}
            question="Find the coordinates of the midpoint M of the line segment joining P(2, -4) and Q(6, 8)."
            steps={[
              'Identify coordinates: x₁ = 2, y₁ = -4, x₂ = 6, y₂ = 8.',
              'Calculate x coordinate: (x₁ + x₂)/2 = (2 + 6)/2 = 8/2 = 4.',
              'Calculate y coordinate: (y₁ + y₂)/2 = (-4 + 8)/2 = 4/2 = 2.',
              'Combine into ordered pair: M = (4, 2).'
            ]}
            solution="M = (4, 2)"
          />

          <TryInCritCalc
            title="Plot Coordinates on CritCalc Geometry Canvas"
            description="Use the Point tool (P) to place (1, 2) and (4, 6) on the grid, draw the connecting segment (L), and select the Distance Ruler tool (D) or Midpoint tool (M) to verify the exact 5 cm length and midpoint (2.5, 4)."
            primaryLink="/geometry-calculator"
            primaryLabel="Open Geometry Canvas →"
            secondaryLink="/scientific-calculator"
            secondaryLabel="Evaluate Radicals in Calculator →"
          />

          <FAQSection faqs={faqs} />

          <RelatedLessons currentPath="/learn/coordinate-geometry" />
        </div>
      </div>
    </div>
  );
}
