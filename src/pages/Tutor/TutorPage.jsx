import React, { useState, useEffect, useRef, useCallback } from 'react';
import TutorWorkspace from '../../components/AiTutor/TutorWorkspace';
import TutorGuideSection from '../../components/AiTutor/TutorGuideSection';
import SEO from '../../components/SEO/SEO';
import { useApp } from '../../context/AppContext';
import styles from './TutorPage.module.css';

export default function TutorPage() {
  const { chatHistory } = useApp();
  const pageRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Scroll to upward and maximize the tutor when any question is asked
  const handleAsk = useCallback(() => {
    setIsMaximized(true);
    if (pageRef.current) {
      pageRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Auto-maximize when chat history has items
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setIsMaximized(true);
      if (pageRef.current) {
        pageRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [chatHistory?.length]);

  return (
    <div
      ref={pageRef}
      className={`${styles.page} ${isMaximized ? styles.pageMaximized : ''}`}
    >
      <SEO route="/tutor" />

      {!isMaximized ? (
        <header className={styles.header}>
          <h1 className={styles.h1Title}>AI Math Tutor</h1>
          <p className={styles.intro}>
            Get real-time mathematical explanations, step-by-step geometric proofs, and algebra assistance with Gemini or Groq.
          </p>
        </header>
      ) : (
        <h1 className={styles.srOnly}>AI Math Tutor</h1>
      )}

      <div className={`${styles.chatWrapper} ${isMaximized ? styles.chatWrapperMaximized : ''}`}>
        <TutorWorkspace
          onAsk={handleAsk}
          isMaximized={isMaximized}
          onToggleMaximize={() => {
            setIsMaximized((prev) => {
              const next = !prev;
              if (next && pageRef.current) {
                pageRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
              return next;
            });
          }}
        />
      </div>

      {!isMaximized && <TutorGuideSection />}

      {isMaximized && (
        <footer className={styles.bottomBar}>
          <button
            type="button"
            className={styles.showGuideBtn}
            onClick={() => {
              setIsMaximized(false);
              setTimeout(() => {
                pageRef.current?.scrollBy({ top: 180, behavior: 'smooth' });
              }, 50);
            }}
          >
            📖 Show Math Guide &amp; FAQs
          </button>
        </footer>
      )}
    </div>
  );
}
