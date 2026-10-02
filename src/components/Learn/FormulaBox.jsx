import React from 'react';
import styles from './Learn.module.css';

export default function FormulaBox({ title, equation, variables = [] }) {
  return (
    <div className={styles.formulaCard}>
      {title && <div className={styles.formulaTitle}>{title}</div>}
      <div className={styles.formulaEq}>
        <code>{equation}</code>
      </div>
      {variables.length > 0 && (
        <ul className={styles.formulaVariables}>
          {variables.map((item, idx) => (
            <li key={idx}>
              <strong>{item.symbol}</strong>: {item.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
