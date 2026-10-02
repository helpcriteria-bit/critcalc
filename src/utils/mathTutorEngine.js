/**
 * Offline Intelligent Mathematical & Geometry Tutor Engine
 * Provides comprehensive, step-by-step Class 10 mathematical solutions,
 * geometry proofs, polygon explanations, and measurement formulas.
 */

export function getOfflineTutorResponse(prompt) {
  const query = prompt.toLowerCase();

  // 1. Polygon / N-gon / Shoelace formula questions
  if (query.includes('polygon') || query.includes('shoelace') || query.includes('n-gon') || query.includes('pentagon') || query.includes('hexagon')) {
    return `### Understanding Polygons and Area Calculation

A **polygon** is a closed 2D geometric figure formed by 3 or more straight line segments called edges or sides.

1. **Sum of Interior Angles**:
   For any $n$-sided polygon:
   \`Sum = (n - 2) × 180°\`
   - Triangle ($n=3$): \`(3 - 2) × 180° = 180°\`
   - Quadrilateral ($n=4$): \`(4 - 2) × 180° = 360°\`
   - Pentagon ($n=5$): \`(5 - 2) × 180° = 540°\`
   - Hexagon ($n=6$): \`(6 - 2) × 180° = 720°\`

2. **Each Interior Angle in a Regular Polygon**:
   \`Angle = \\frac{(n - 2) × 180°}{n}\`

3. **Perimeter ($P$)**:
   The sum of all side lengths:
   \`P = s_1 + s_2 + s_3 + ... + s_n\`

4. **Area via the Shoelace Formula (Gauss's Area Formula)**:
   For any polygon with vertices ordered sequentially $(x_1, y_1), (x_2, y_2), ..., (x_n, y_n)$:
   \`Area = \\frac{1}{2} |(x_1 y_2 + x_2 y_3 + ... + x_n y_1) - (y_1 x_2 + y_2 x_3 + ... + y_n x_1)|\`
   
   **How to apply it**:
   - Step 1: List the vertices in counter-clockwise order.
   - Step 2: Multiply cross-diagonals downwards and sum them: \`\\sum (x_i \\cdot y_{i+1})\`.
   - Step 3: Multiply cross-diagonals upwards and sum them: \`\\sum (y_i \\cdot x_{i+1})\`.
   - Step 4: Subtract the upward sum from the downward sum, take the absolute value, and divide by 2.

*Tip: You can use the new Polygon tool in the Canvas toolbar to draw any shape and automatically view its area and perimeter!*`;
  }

  // 2. Ruler, Distance, Measurement, Delta X, Delta Y questions
  if (query.includes('ruler') || query.includes('measure') || query.includes('distance') || query.includes('delta')) {
    return `### Coordinate Distance and Measurement Guide

When measuring distance between two points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ on a 2D plane:

1. **Horizontal Distance ($\\Delta x$)**:
   \`\\Delta x = |x_2 - x_1|\`

2. **Vertical Distance ($\\Delta y$)**:
   \`\\Delta y = |y_2 - y_1|\`

3. **Euclidean Distance Formula (Pythagorean Theorem)**:
   The straight-line distance $d$ is the hypotenuse of the right triangle formed by $\\Delta x$ and $\\Delta y$:
   \`d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2} = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}\`

4. **Inclination Angle ($\\theta$)**:
   The angle with the horizontal axis:
   \`\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)\` in degrees:
   \`\\theta° = \\arctan\\left(\\frac{y_2 - y_1}{x_2 - x_1}\\right) × \\frac{180°}{\\pi}\`

*Tip: Use the Measure / Ruler tool in the Canvas toolbar to click and drag across any two points. It displays live distance, angle, and horizontal/vertical deltas!*`;
  }

  // 3. Pythagoras theorem
  if (query.includes('pythagor') || query.includes('right triangle') || query.includes('hypotenuse')) {
    return `### Pythagorean Theorem (Class 10 Geometry)

In any right-angled triangle where the angle between legs $a$ and $b$ is 90°:

1. **Formula**:
   \`a² + b² = c²\`
   where:
   - \`a\` = perpendicular side (height)
   - \`b\` = base side
   - \`c\` = hypotenuse (the longest side opposite to 90°)

2. **Finding the Hypotenuse**:
   \`c = \\sqrt{a² + b²}\`

3. **Common Pythagorean Triples**:
   - \`(3, 4, 5)\` since \`3² + 4² = 9 + 16 = 25 = 5²\`
   - \`(5, 12, 13)\` since \`5² + 12² = 25 + 144 = 169 = 13²\`
   - \`(8, 15, 17)\` since \`8² + 15² = 64 + 225 = 289 = 17²\`
   - \`(7, 24, 25)\`

4. **Converse of Pythagoras Theorem**:
   If the square of the longest side of a triangle is equal to the sum of the squares of the other two sides, the triangle is guaranteed to be a right-angled triangle.`;
  }

  // 4. Circle / Circumference / Area
  if (query.includes('circle') || query.includes('radius') || query.includes('diameter') || query.includes('pi') || query.includes('circumference')) {
    return `### Circle Geometry Fundamentals

For a circle of radius $r$ and diameter $d = 2r$:

1. **Circumference ($C$)**:
   \`C = 2\\pi r = \\pi d\`
   For $r = 7\\text{ cm}$:
   \`C = 2 × \\frac{22}{7} × 7 = 44\\text{ cm}\`

2. **Area ($A$)**:
   \`A = \\pi r²\`
   For $r = 7\\text{ cm}$:
   \`A = \\frac{22}{7} × 7² = 154\\text{ cm}²\`

3. **Sector Area & Arc Length**:
   For a central angle $\\theta$ (in degrees):
   - Arc Length \`L = \\frac{\\theta}{360°} × 2\\pi r\`
   - Sector Area \`A_{\\text{sector}} = \\frac{\\theta}{360°} × \\pi r²\`

4. **Equation of a Circle in Cartesian Plane**:
   Centered at origin $(0, 0)$:
   \`x² + y² = r²\`
   Centered at $(h, k)$:
   \`(x - h)² + (y - k)² = r²\``;
  }

  // 5. Trigonometry (sin, cos, tan)
  if (query.includes('trig') || query.includes('sin') || query.includes('cos') || query.includes('tan')) {
    return `### Class 10 Trigonometry Ratios & Values

In a right triangle with angle $\\theta$:
- \`\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}\`
- \`\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}\`
- \`\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{\\sin(\\theta)}{\\cos(\\theta)}\`

**Key Angles Table**:
- \`0°\`: $\\sin = 0$, $\\cos = 1$, $\\tan = 0$
- \`30°\`: $\\sin = 1/2$, $\\cos = \\sqrt{3}/2$, $\\tan = 1/\\sqrt{3}$
- \`45°\`: $\\sin = 1/\\sqrt{2}$, $\\cos = 1/\\sqrt{2}$, $\\tan = 1$
- \`60°\`: $\\sin = \\sqrt{3}/2$, $\\cos = 1/2$, $\\tan = \\sqrt{3}$
- \`90°\`: $\\sin = 1$, $\\cos = 0$, $\\tan = \\text{undefined}$

**Pythagorean Trigonometric Identities**:
1. \`\\sin²(\\theta) + \\cos²(\\theta) = 1\`
2. \`1 + \\tan²(\\theta) = \\sec²(\\theta)\`
3. \`1 + \\cot²(\\theta) = \\csc²(\\theta)\``;
  }

  // 6. Quadratic Equations / Algebra
  if (query.includes('quadratic') || query.includes('algebra') || query.includes('factor')) {
    return `### Quadratic Equations (Standard Form: ax² + bx + c = 0)

1. **Quadratic Formula**:
   \`x = \\frac{-b \\pm \\sqrt{b² - 4ac}}{2a}\`

2. **The Discriminant ($D$)**:
   \`D = b² - 4ac\`
   - If \`D > 0\`: Two distinct real roots.
   - If \`D = 0\`: Two equal real roots (\`x = -b / 2a\`).
   - If \`D < 0\`: No real roots (complex roots).

3. **Sum and Product of Roots**:
   If roots are $\\alpha$ and $\\beta$:
   - \`\\alpha + \\beta = -\\frac{b}{a}\`
   - \`\\alpha \\cdot \\beta = \\frac{c}{a}\``;
  }

  // 7. General Mathematics & Problem Solver
  return `### Step-by-Step Mathematical Explanation

Thank you for your question: **"${prompt}"**

1. **Concept Overview**:
   In geometry and algebra, we break the problem down into given quantities, unknown targets, and relevant formulas.

2. **Core Formulas to Apply**:
   - **Distance**: \`d = \\sqrt{(x_2 - x_1)² + (y_2 - y_1)²}\`
   - **Perimeter of Polygon**: \`P = \\sum_{i=1}^n s_i\`
   - **Shoelace Area of Polygon**: \`A = \\frac{1}{2} |\\sum (x_i y_{i+1} - y_i x_{i+1})|\`
   - **Slope / Angle**: \`m = \\frac{y_2 - y_1}{x_2 - x_1} = \\tan(\\theta)\`

3. **Step-by-Step Solution Strategy**:
   - **Step 1**: Identify your coordinate points or dimensions on the canvas.
   - **Step 2**: Use the Snap-to-Grid feature and Photoshop-style Rulers to align coordinates accurately.
   - **Step 3**: Verify units (e.g. \`cm\`, \`mm\`, or \`px\`).
   - **Step 4**: Substitute the numerical values into the formula and calculate.

Feel free to ask a specific geometry, algebra, or trigonometry problem, or test any theorem!`;
}
