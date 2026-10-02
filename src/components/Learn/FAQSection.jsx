import React from 'react';
import styles from './Learn.module.css';

export default function FAQSection({ faqs = [] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className={styles.faqSection} aria-labelledby="lesson-faq-heading">
      <h2 id="lesson-faq-heading" className={styles.h2Heading}>
        Frequently Asked Questions
      </h2>
      <div className={styles.faqList}>
        {faqs.map((faq, idx) => (
          <details key={idx} className={styles.faqItem}>
            <summary className={styles.faqQuestion}>{faq.question}</summary>
            <div className={styles.faqAnswer}>{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
