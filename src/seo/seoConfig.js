/**
 * seoConfig.js - Centralized SEO Metadata and Structured Data for CritCalc
 */

export const SITE_URL = 'https://critcalc-6d0c7.web.app';
export const SITE_NAME = 'CritCalc';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`;

export const SEO_DATA = {
  '/': {
    title: 'Free Online Math Calculator, Geometry Tools & Math Tutor | CritCalc',
    description: 'CritCalc is a free interactive math platform combining a scientific calculator, dynamic geometry canvas, and AI math tutor built for Class 10 and high school students.',
    canonical: `${SITE_URL}/`,
    robots: 'index, follow',
    ogTitle: 'Free Online Math Calculator, Geometry Tools & Math Tutor | CritCalc',
    ogDescription: 'Explore CritCalc: Free scientific calculator, dynamic interactive geometry canvas, and AI math tutor for high school students.',
    ogUrl: `${SITE_URL}/`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: `${SITE_URL}/`,
          name: SITE_NAME,
          description: 'Free online math calculator, dynamic geometry canvas, and AI math tutor.',
          inLanguage: 'en-US'
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${SITE_URL}/#application`,
          name: 'CritCalc Math Suite',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any web browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What tools are included in CritCalc?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'CritCalc includes a full-featured Scientific Calculator, an interactive dynamic Geometry Canvas with construction tools, and an AI Math Tutor powered by Groq.'
              }
            },
            {
              '@type': 'Question',
              name: 'Is CritCalc free to use?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, CritCalc is completely free for students, teachers, and math enthusiasts.'
              }
            },
            {
              '@type': 'Question',
              name: 'Can I save my geometry drawings and calculations?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, signing in with your student account enables cloud saving and management in My Canvases.'
              }
            }
          ]
        }
      ]
    }
  },

  '/scientific-calculator': {
    title: 'Free Scientific Calculator — Trig, Powers, Roots & Logs | CritCalc',
    description: 'Use CritCalc’s free online scientific calculator. Evaluate live expressions with sin, cos, tan, logarithms, square roots, powers, factorials, and memory.',
    canonical: `${SITE_URL}/scientific-calculator`,
    robots: 'index, follow',
    ogTitle: 'Free Scientific Calculator — Trig, Powers, Roots & Logs | CritCalc',
    ogDescription: 'Live expression evaluation, trigonometric functions in DEG and RAD, roots, powers, logs, and calculation history.',
    ogUrl: `${SITE_URL}/scientific-calculator`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'CritCalc Scientific Calculator',
          url: `${SITE_URL}/scientific-calculator`,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'All web browsers',
          featureList: 'Trigonometry (DEG/RAD), Powers, Roots, Logarithms, Factorials, Memory, Live evaluation',
          offers: {
            '@type': 'Offer',
            price: '0'
          }
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What mathematical functions does this scientific calculator support?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'It supports trigonometric functions (sin, cos, tan and inverse asin, acos, atan in degrees and radians), square root (sqrt), powers (x², xʸ), logarithms (log base 10, ln base e), factorials (n!), reciprocals (1/x), constants (π, e), and memory functions (M+, M-, MR, MC).'
              }
            },
            {
              '@type': 'Question',
              name: 'Can I use keyboard shortcuts on the calculator?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! You can use number keys 0-9, arithmetic keys (+, -, *, /), Enter for equals, Backspace to delete, and Escape to clear.'
              }
            }
          ]
        }
      ]
    }
  },

  '/calculator': {
    title: 'Free Scientific Calculator | CritCalc Online Math Tool',
    description: 'Perform complex arithmetic, trigonometric, exponential, and algebraic calculations with CritCalc’s live scientific calculator.',
    canonical: `${SITE_URL}/calculator`,
    robots: 'index, follow',
    ogTitle: 'Free Scientific Calculator | CritCalc',
    ogDescription: 'Interactive scientific calculator with live evaluation, degree/radian mode, trigonometric functions, memory, and calculation history.',
    ogUrl: `${SITE_URL}/calculator`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CritCalc Scientific Calculator App',
      url: `${SITE_URL}/calculator`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All web browsers',
      offers: { '@type': 'Offer', price: '0' }
    }
  },

  '/geometry-calculator': {
    title: 'Online Geometry Calculator & Interactive Canvas | CritCalc',
    description: 'Construct, calculate, and explore geometric figures online. Draw points, lines, circles, polygons, measure distances and angles, and find intersections.',
    canonical: `${SITE_URL}/geometry-calculator`,
    robots: 'index, follow',
    ogTitle: 'Online Geometry Calculator & Interactive Canvas | CritCalc',
    ogDescription: 'Interactive coordinate geometry canvas with geometric constructions: midpoints, perpendiculars, angle bisectors, circles, and ruler measurements.',
    ogUrl: `${SITE_URL}/geometry-calculator`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'CritCalc Geometry Calculator',
          url: `${SITE_URL}/geometry-calculator`,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'All web browsers',
          featureList: 'Interactive drawing, midpoint construction, perpendicular bisectors, angle measurement, 3-point circle, centimeter grid',
          offers: { '@type': 'Offer', price: '0' }
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What geometric constructions can I perform?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'You can create points, lines, circles (center-radius and 3-point), regular and arbitrary polygons, triangles, rectangles, midpoints, perpendiculars, parallels, perpendicular bisectors, angle bisectors, tangents, and intersections.'
              }
            },
            {
              '@type': 'Question',
              name: 'How does coordinate snapping work?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The canvas uses a centimeter grid with optional grid snapping, axis displays, and live distance/angle measurements.'
              }
            }
          ]
        }
      ]
    }
  },

  '/canvas': {
    title: 'Interactive Geometry Canvas | CritCalc Construction Tools',
    description: 'Interactive geometry drawing canvas for students. Construct triangles, circles, bisectors, and measure distances and angles with full undo/redo.',
    canonical: `${SITE_URL}/canvas`,
    robots: 'index, follow',
    ogTitle: 'Interactive Geometry Canvas | CritCalc',
    ogDescription: 'Draw and construct dynamic geometric figures online. Infinite pan, zoom, snap to grid, and cloud canvas saving.',
    ogUrl: `${SITE_URL}/canvas`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CritCalc Interactive Geometry Canvas',
      url: `${SITE_URL}/canvas`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All web browsers',
      offers: { '@type': 'Offer', price: '0' }
    }
  },

  '/math-tutor': {
    title: 'AI Math Tutor — Geometry Proofs & Problem Solving | CritCalc',
    description: 'Get instant, streaming explanations for geometry, algebra, and trigonometry problems with CritCalc’s AI Math Tutor powered by Groq.',
    canonical: `${SITE_URL}/math-tutor`,
    robots: 'index, follow',
    ogTitle: 'AI Math Tutor — Geometry Proofs & Problem Solving | CritCalc',
    ogDescription: 'Ask geometry proofs, trigonometry identities, and Class 10 math questions with real-time streaming AI assistance.',
    ogUrl: `${SITE_URL}/math-tutor`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'CritCalc AI Math Tutor',
          url: `${SITE_URL}/math-tutor`,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'All web browsers',
          featureList: 'Step-by-step proofs, algebra explanations, interactive geometry assistance, streaming AI inference',
          offers: { '@type': 'Offer', price: '0' }
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How does the AI Math Tutor work?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The AI Math Tutor uses ultra-fast Groq streaming inference to break down math problems step by step, guide students through proofs, and explain concepts.'
              }
            },
            {
              '@type': 'Question',
              name: 'Can the AI Tutor draw shapes on the canvas?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! When enabled, the AI tutor can execute canvas tools to draw points, lines, circles, and polygons directly onto your geometry canvas.'
              }
            }
          ]
        }
      ]
    }
  },

  '/tutor': {
    title: 'AI Math Tutor | CritCalc Interactive Learning Assistant',
    description: 'Chat with CritCalc’s AI Math Tutor for real-time mathematical explanations, theorem derivations, and homework assistance.',
    canonical: `${SITE_URL}/tutor`,
    robots: 'index, follow',
    ogTitle: 'AI Math Tutor | CritCalc',
    ogDescription: 'Ask questions about geometry, algebra, and trigonometry with live streaming AI math assistance.',
    ogUrl: `${SITE_URL}/tutor`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CritCalc AI Tutor Assistant',
      url: `${SITE_URL}/tutor`,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All web browsers',
      offers: { '@type': 'Offer', price: '0' }
    }
  },

  '/learn': {
    title: 'Math Learning Guides & Lessons | CritCalc Education',
    description: 'Explore clear, practical math guides for Class 10 and high school. Learn algebra, geometry theorems, trigonometry ratios, and coordinate geometry.',
    canonical: `${SITE_URL}/learn`,
    robots: 'index, follow',
    ogTitle: 'Math Learning Guides & Lessons | CritCalc Education',
    ogDescription: 'Educational guides covering the Pythagorean theorem, quadratic equations, trigonometric ratios, and coordinate geometry formulas with interactive tool integration.',
    ogUrl: `${SITE_URL}/learn`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'CritCalc Math Learning Guides',
      url: `${SITE_URL}/learn`,
      description: 'Educational articles and lessons for algebra, geometry, trigonometry, and coordinate geometry.'
    }
  },

  '/learn/algebra': {
    title: 'Quadratic Equations & Algebra Guide — Formulas & Examples | CritCalc',
    description: 'Master quadratic equations, the quadratic formula, discriminant analysis, and factoring with step-by-step worked examples and calculator verification.',
    canonical: `${SITE_URL}/learn/algebra`,
    robots: 'index, follow',
    ogTitle: 'Quadratic Equations & Algebra Guide | CritCalc',
    ogDescription: 'Learn how to solve ax² + bx + c = 0 with the quadratic formula, analyze roots via discriminant b² - 4ac, and verify in CritCalc.',
    ogUrl: `${SITE_URL}/learn/algebra`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: 'Understanding Quadratic Equations: Formulas, Discriminant, and Worked Examples',
          url: `${SITE_URL}/learn/algebra`,
          description: 'A comprehensive educational lesson on quadratic equations, the quadratic formula, and root classification.',
          inLanguage: 'en-US'
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
            { '@type': 'ListItem', position: 3, name: 'Algebra', item: `${SITE_URL}/learn/algebra` }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is the quadratic formula?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / (2a), which gives the solutions to any equation in the standard form ax² + bx + c = 0 where a ≠ 0.'
              }
            },
            {
              '@type': 'Question',
              name: 'What does the discriminant tell you?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The discriminant D = b² - 4ac indicates root types: if D > 0, there are two distinct real roots; if D = 0, there is one repeated real root; if D < 0, there are two complex conjugate roots.'
              }
            }
          ]
        }
      ]
    }
  },

  '/learn/geometry': {
    title: 'Pythagorean Theorem & Right Triangle Geometry | CritCalc Guide',
    description: 'Learn the Pythagorean theorem: a² + b² = c². Understand geometric proofs, find hypotenuse and leg lengths, and construct right triangles on the canvas.',
    canonical: `${SITE_URL}/learn/geometry`,
    robots: 'index, follow',
    ogTitle: 'Pythagorean Theorem & Right Triangle Geometry | CritCalc',
    ogDescription: 'Step-by-step breakdown of the Pythagorean theorem, geometric constructions, and practical problem solving.',
    ogUrl: `${SITE_URL}/learn/geometry`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: 'The Pythagorean Theorem: Formulas, Geometric Proofs, and Practical Applications',
          url: `${SITE_URL}/learn/geometry`,
          description: 'Educational guide explaining the relation a² + b² = c² in right-angled triangles with worked examples.',
          inLanguage: 'en-US'
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
            { '@type': 'ListItem', position: 3, name: 'Geometry', item: `${SITE_URL}/learn/geometry` }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is the Pythagorean theorem statement?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'In any right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c².'
              }
            },
            {
              '@type': 'Question',
              name: 'How do you check if a triangle is right-angled using side lengths?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'By the converse of the Pythagorean theorem: if the sum of squares of the two shorter sides equals the square of the longest side, the angle opposite the longest side is 90°.'
              }
            }
          ]
        }
      ]
    }
  },

  '/learn/trigonometry': {
    title: 'Trigonometric Ratios (Sin, Cos, Tan) Guide & Table | CritCalc',
    description: 'Understand sine, cosine, and tangent ratios, reciprocal functions, degrees vs. radians, and evaluate them accurately using CritCalc’s calculator.',
    canonical: `${SITE_URL}/learn/trigonometry`,
    robots: 'index, follow',
    ogTitle: 'Trigonometric Ratios (Sin, Cos, Tan) Guide & Table | CritCalc',
    ogDescription: 'Definitions of sin, cos, tan, standard angles (0°, 30°, 45°, 60°, 90°), and calculation steps.',
    ogUrl: `${SITE_URL}/learn/trigonometry`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: 'Introduction to Trigonometry: Ratios, Standard Angles, and Inverse Functions',
          url: `${SITE_URL}/learn/trigonometry`,
          description: 'A comprehensive guide to trigonometric definitions, standard angle reference values, and calculator evaluation.',
          inLanguage: 'en-US'
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
            { '@type': 'ListItem', position: 3, name: 'Trigonometry', item: `${SITE_URL}/learn/trigonometry` }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What are the three fundamental trigonometric ratios?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'For an acute angle θ in a right triangle: sin(θ) = Opposite/Hypotenuse, cos(θ) = Adjacent/Hypotenuse, and tan(θ) = Opposite/Adjacent.'
              }
            },
            {
              '@type': 'Question',
              name: 'When should I use DEG vs. RAD mode?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use Degree (DEG) mode when working with angles measured in 0° to 360°. Use Radian (RAD) mode when working with angles in multiples of π or calculus problems.'
              }
            }
          ]
        }
      ]
    }
  },

  '/learn/coordinate-geometry': {
    title: 'Coordinate Geometry Formulas: Distance, Midpoint & Area | CritCalc',
    description: 'Learn coordinate geometry essentials: distance formula, midpoint formula, section formula, and polygon area using the Shoelace formula on a 2D plane.',
    canonical: `${SITE_URL}/learn/coordinate-geometry`,
    robots: 'index, follow',
    ogTitle: 'Coordinate Geometry Formulas: Distance, Midpoint & Area | CritCalc',
    ogDescription: 'Formulas and step-by-step examples for distance, midpoints, and Shoelace polygon area with interactive geometry canvas verification.',
    ogUrl: `${SITE_URL}/learn/coordinate-geometry`,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'article',
    twitterCard: 'summary_large_image',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: 'Coordinate Geometry Formulas: Distance, Midpoint, and Shoelace Area',
          url: `${SITE_URL}/learn/coordinate-geometry`,
          description: 'Educational guide covering 2D Cartesian geometry formulas, distance between two points, midpoints, and area calculation.',
          inLanguage: 'en-US'
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
            { '@type': 'ListItem', position: 3, name: 'Coordinate Geometry', item: `${SITE_URL}/learn/coordinate-geometry` }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is the distance formula between two points?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The distance d between points (x₁, y₁) and (x₂, y₂) is d = √((x₂ - x₁)² + (y₂ - y₁)²).'
              }
            },
            {
              '@type': 'Question',
              name: 'What is the midpoint formula?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The midpoint M of a segment connecting (x₁, y₁) and (x₂, y₂) is M = ((x₁ + x₂)/2, (y₁ + y₂)/2).'
              }
            }
          ]
        }
      ]
    }
  },

  '/my-canvases': {
    title: 'My Canvases — Student Saved Projects | CritCalc',
    description: 'Manage and open your saved geometry drawings and student canvas projects.',
    canonical: `${SITE_URL}/my-canvases`,
    robots: 'noindex, nofollow'
  }
};
