import React from 'react';
import styles from './Learn.module.css';

export default function WorkedExample({ exampleNumber = 1, question, steps = [], solution }) {
  return (
    <div className={styles.exampleCard}>
      <div className={styles.exampleBadge}>WORKED EXAMPLE {exampleNumber}</div>
      <div className={styles.exampleQuestion}>{question}</div>
      <div className={styles.exampleSteps}>
        {steps.map((step, idx) => (
          <div key={idx}>
            <span className={styles.exampleStepNumber}>Step {idx + 1}:</span>
            {step}
          </div>
        ))}
      </div>
      {solution && (
        <div className={styles.exampleSolution}>
          Answer: <span>{solution}</span>
        </div>
      )}
    </div>
  );
}
