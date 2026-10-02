import React from 'react';
import Calculator from '../../components/Calculator/Calculator';
import styles from './CalculatorPage.module.css';

export default function CalculatorPage() {
  return (
    <div className={styles.page}>
      <Calculator />
    </div>
  );
}
