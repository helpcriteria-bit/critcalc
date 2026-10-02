import React from 'react';
import AiTutor from '../../components/AiTutor/AiTutor';
import TutorGuideSection from '../../components/AiTutor/TutorGuideSection';
import SEO from '../../components/SEO/SEO';
import styles from '../Tutor/TutorPage.module.css';

export default function MathTutorLanding() {
  return (
    <div className={styles.page}>
      <SEO route="/math-tutor" />

      <header className={styles.header}>
        <h1 className={styles.h1Title}>AI Math Tutor</h1>
        <p className={styles.intro}>
          Your interactive AI math study partner. Ask step-by-step questions about Class 10 Euclidean geometry proofs, trigonometry identities, and algebra solutions with ultra-fast Groq streaming.
        </p>
      </header>

      <div className={styles.chatWrapper}>
        <AiTutor />
      </div>

      <TutorGuideSection />
    </div>
  );
}
