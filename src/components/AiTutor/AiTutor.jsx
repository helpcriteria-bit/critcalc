import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useGroq, isValidKey } from '../../hooks/useGroq';
import styles from './AiTutor.module.css';

export default function AiTutor() {
  const { groqKey, setGroqKey, aiModel, setAiModel, chatHistory, setChatHistory } = useApp();
  const { sendMessage, isLoading, connection, models, recheck } = useGroq();
  const [keyDraft, setKeyDraft] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  const [input, setInput] = useState('');
  const [isWaitingFirstToken, setIsWaitingFirstToken] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const needsKey = connection.status === 'no-key' || connection.status === 'invalid-key';

  const saveKey = () => {
    setGroqKey(keyDraft);
    setKeyDraft('');
    setShowKeyPanel(false);
  };

  const quickPrompts = [
    'How do I calculate polygon area using Shoelace formula?',
    'Explain Pythagorean Theorem with examples',
    'How to use the ruler tool to measure distance & angle?',
    'Trigonometric ratios table (sin, cos, tan)'
  ];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isWaitingFirstToken]);

  // Adjust textarea height up to 120px
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const executeSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    const newHistory = [...chatHistory, userMessage];

    // Optimistically update chat history with user message
    setChatHistory(newHistory);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsWaitingFirstToken(true);

    try {
      let aiResponseText = '';

      const result = await sendMessage(text, chatHistory, (token) => {
        setIsWaitingFirstToken(false);
        aiResponseText += token;

        setChatHistory((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex] && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = { ...updated[lastIndex], content: aiResponseText };
          } else {
            updated.push({ role: 'assistant', content: aiResponseText });
          }
          return updated;
        });
      });

      if (result?.source === 'offline') {
        setChatHistory((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;
          if (updated[last]?.role === 'assistant') updated[last] = { ...updated[last], isOffline: true };
          return updated;
        });
      }
    } catch (err) {
      setIsWaitingFirstToken(false);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong while answering. Please try again.',
          isError: true
        }
      ]);
    }
  };

  const handleSend = () => executeSend();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  // Render text containing inline math backticks `math` and markdown headers
  const renderMessageContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, lIdx) => {
      // Bold subheaders like ### or **
      let isHeader = false;
      let displayLine = line;
      if (/^#{2,3} /.test(line)) {
        isHeader = true;
        displayLine = line.replace(/^#{2,3} /, '');
      }

      const parts = displayLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      const renderedParts = parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code key={idx} className={styles.inlineMath}>
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      });

      if (isHeader) {
        return (
          <div key={lIdx} style={{ fontWeight: '700', fontSize: '15px', margin: '8px 0 4px', color: 'var(--accent)' }}>
            {renderedParts}
          </div>
        );
      }

      return (
        <div key={lIdx} style={{ minHeight: line ? 'auto' : '8px' }}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <div className={styles.tutorContainer}>
      <header className={styles.tutorHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 3 2 5.5 5 7.5V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.5c3-2 5-4.5 5-7.5a8 8 0 0 0-8-8z" />
            </svg>
            AI Maths & Geometry Tutor
          </h1>
          <div className={styles.subtitle}>
            {connection.status === 'online' && (
              <span className={`${styles.statusPill} ${styles.statusOnline}`}>● Connected to Groq</span>
            )}
            {connection.status === 'checking' && (
              <span className={`${styles.statusPill} ${styles.statusChecking}`}>● Connecting…</span>
            )}
            {connection.status === 'offline' && (
              <span className={`${styles.statusPill} ${styles.statusError}`} title={connection.message}>
                ● Reconnecting… (using offline solver)
              </span>
            )}
            {connection.status === 'invalid-key' && (
              <span className={`${styles.statusPill} ${styles.statusError}`} title={connection.message}>
                ● API key rejected
              </span>
            )}
            {connection.status === 'no-key' && (
              <span className={`${styles.statusPill} ${styles.statusOffline}`}>● No API key — offline solver</span>
            )}
            <span>· Class 10 Step-by-Step Geometry & Algebra</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <select
            value={aiModel || 'llama-3.1-8b-instant'}
            onChange={(e) => setAiModel(e.target.value)}
            className={styles.modelSelect}
            title="Select AI Model"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => (connection.status === 'offline' ? recheck() : setShowKeyPanel((v) => !v))}
            className={styles.clearBtn}
            title={connection.status === 'offline' ? 'Retry connection now' : 'Set or change the Groq API key'}
          >
            {connection.status === 'offline' ? 'Retry' : 'API key'}
          </button>

          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className={styles.clearBtn}
              title="Clear conversation"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {(needsKey || showKeyPanel) && (
        <div className={styles.keyPanel}>
          <div className={styles.keyText}>
            {connection.status === 'invalid-key'
              ? 'Groq rejected this key. Paste a valid key to reconnect.'
              : 'Paste your free Groq API key (starts with gsk_) to switch on the live AI tutor.'}{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">Get a key</a>
          </div>
          <div className={styles.keyRow}>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValidKey(keyDraft) && saveKey()}
              placeholder="gsk_..."
              className={styles.keyInput}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="button" className={styles.keySave} onClick={saveKey} disabled={!isValidKey(keyDraft)}>
              Save &amp; connect
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className={styles.quickPrompts}>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            className={styles.promptChip}
            onClick={() => executeSend(q)}
            disabled={isLoading}
          >
            {q}
          </button>
        ))}
      </div>

      <div className={styles.chatArea}>
        {chatHistory.length === 0 && (
          <div className={styles.emptyState}>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                👋 Welcome to the Maths & Geometry Tutor!
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}>
                Ask me anything about polygons, area formulas, ruler measurements, coordinate geometry, trigonometry, or proofs. Select an example prompt above or type your question below.
              </p>
            </div>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}
            style={msg.isError ? { color: 'var(--red)' } : {}}
          >
            {renderMessageContent(msg.content)}
          </div>
        ))}

        {isWaitingFirstToken && (
          <div className={`${styles.aiBubble} ${styles.typingIndicator}`}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a maths question (e.g., How does the polygon Shoelace formula work?)..."
          rows={1}
          className={styles.textarea}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={styles.sendButton}
          aria-label="Send Message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
