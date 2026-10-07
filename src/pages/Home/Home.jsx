import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import styles from './Home.module.css';

const tools = [
  {
    number: '01',
    title: 'Calculate',
    description: 'Work with arithmetic, trigonometry, powers, roots, and logarithms.',
    detail: 'Scientific calculator · DEG and RAD modes',
    to: '/calculator',
    action: 'Open calculator',
  },
  {
    number: '02',
    title: 'Draw geometry',
    description: 'Build a diagram, make constructions, and measure lengths or angles.',
    detail: 'Points · Lines · Circles · Measurements',
    to: '/canvas',
    action: 'Open geometry canvas',
  },
  {
    number: '03',
    title: 'Learn a concept',
    description: 'Ask a maths question or explore a worked lesson at your own pace.',
    detail: 'Step-by-step tutor · Algebra · Geometry · Trigonometry',
    to: '/tutor',
    action: 'Open math tutor',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <SEO route="/" />

      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="home-title">
          <p className={styles.eyebrow}>Free online maths tools</p>
          <h1 id="home-title" className={styles.h1Title}>
            Choose a free math tool
          </h1>
          <p className={styles.subheading}>
            Choose a tool to get started. No account is needed to calculate or draw.
          </p>
        </section>

        <section className={styles.grid} aria-label="Choose a maths tool">
          {tools.map((tool) => (
            <article className={styles.card} key={tool.number}>
              <span className={styles.stepNumber} aria-hidden="true">{tool.number}</span>
              <h2 className={styles.cardTitle}>{tool.title}</h2>
              <p className={styles.cardDesc}>{tool.description}</p>
              <p className={styles.cardDetail}>{tool.detail}</p>
              <Link to={tool.to} className={styles.cardLink}>
                {tool.action}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>

        <section className={styles.helpSection} aria-labelledby="help-title">
          <div>
            <h2 id="help-title" className={styles.helpTitle}>Not sure where to start?</h2>
            <p className={styles.helpText}>
              Enter an expression in the calculator, pick a drawing tool on the canvas, or ask the tutor a specific question. Sign in only if you want to save your geometry work.
            </p>
          </div>
          <Link to="/learn" className={styles.learnLink}>Browse free maths lessons</Link>
        </section>

        <footer className={styles.footer}>
          <span>CritCalc · Calculator, geometry tools, and a math tutor for students.</span>
          <a href="mailto:help.criteria@gmail.com">Contact support</a>
        </footer>
      </div>
    </div>
  );
}
