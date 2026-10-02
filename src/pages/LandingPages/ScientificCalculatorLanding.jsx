import React from 'react';
import Calculator from '../../components/Calculator/Calculator';
import CalculatorGuideSection from '../../components/Calculator/CalculatorGuideSection';
import SEO from '../../components/SEO/SEO';
import styles from '../Calculator/CalculatorPage.module.css';

export default function ScientificCalculatorLanding() {
  return (
    <div className={styles.page}>
      <SEO route="/scientific-calculator" />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.h1Title}>Free Scientific Calculator</h1>
          <p className={styles.intro}>
            An online scientific calculator engineered for Class 10 and high school students. Calculate trigonometric functions, powers, roots, logarithms, factorials, and memory registers with live syntax evaluation.
          </p>
        </header>

        <div className={styles.calculatorWrapper}>
          <Calculator />
        </div>

        <CalculatorGuideSection />
      </div>
    </div>
  );
}
