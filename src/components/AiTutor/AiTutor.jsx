import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAI, isValidKey, detectProvider } from '../../hooks/useAI';
import styles from './AiTutor.module.css';

export default function AiTutor({ onAsk, isMaximized, onToggleMaximize }) {
  const {
    aiProvider,
    setAiProvider,
    geminiKey,
    groqKey,
    setApiKey,
    aiModel,
    setAiModel,
    chatHistory,
    setChatHistory,
    allowAiDraw,
    setAllowAiDraw
  } = useApp();

  const { sendMessage, isLoading, connection, models, recheck, provider, setProvider } = useAI();
  const [selectedProvider, setSelectedProvider] = useState(aiProvider || 'gemini');
  const [keyDraft, setKeyDraft] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  const [input, setInput] = useState('');
  const [isWaitingFirstToken, setIsWaitingFirstToken] = useState(false);
  const chatAreaRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeKey = selectedProvider === 'gemini' ? geminiKey : groqKey;
  const needsKey = connection.status === 'no-key' || connection.status === 'invalid-key';

  useEffect(() => {
    setSelectedProvider(aiProvider || 'gemini');
  }, [aiProvider]);

  const handleProviderChange = (newProv) => {
    setSelectedProvider(newProv);
    setProvider?.(newProv);
    setAiProvider(newProv);
    setKeyDraft(newProv === 'gemini' ? geminiKey : groqKey);
  };

  const handleKeyDraftChange = (e) => {
    const val = e.target.value;
    setKeyDraft(val);
    const detected = detectProvider(val);
    if (detected && detected !== selectedProvider) {
      setSelectedProvider(detected);
      setProvider?.(detected);
      setAiProvider(detected);
    }
  };

  const saveKey = () => {
    setApiKey(keyDraft.trim(), selectedProvider);
    setKeyDraft('');
    setShowKeyPanel(false);
  };

  const quickPrompts = [
    'Draw a 3-4-5 right triangle',
    'Draw an incircle in it',
    'Draw a circumcircle',
    'Draw an altitude from C to AB',
    'Shoelace formula polygon area',
    'Pythagorean theorem proof'
  ];

  // Auto-scroll chat internally to bottom without forcing outer window scrolling
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
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

    onAsk?.();

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
          content: 'Something went wrong while answering. Please try again or use the offline geometry tools.',
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
      let isHeader = false;
      let displayLine = line;
      if (/^#{2,4} /.test(line)) {
        isHeader = true;
        displayLine = line.replace(/^#{2,4} /, '');
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

  const providerDisplayName = selectedProvider === 'gemini' ? 'Google Gemini' : 'Groq';

  return (
    <div className={styles.tutorContainer}>
      <header className={styles.tutorHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 3 2 5.5 5 7.5V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.5c3-2 5-4.5 5-7.5a8 8 0 0 0-8-8z" />
            </svg>
            AI Maths &amp; Geometry Tutor
          </div>
          <div className={styles.subtitle}>
            {connection.status === 'online' && (
              <span className={`${styles.statusPill} ${styles.statusOnline}`}>
                ● Connected to {providerDisplayName}
              </span>
            )}
            {connection.status === 'checking' && (
              <span className={`${styles.statusPill} ${styles.statusChecking}`}>
                ● Connecting to {providerDisplayName}…
              </span>
            )}
            {connection.status === 'offline' && (
              <span className={`${styles.statusPill} ${styles.statusError}`} title={connection.message}>
                ● Reconnecting… (Local Geometry Solver Active)
              </span>
            )}
            {connection.status === 'invalid-key' && (
              <span className={`${styles.statusPill} ${styles.statusError}`} title={connection.message}>
                ● {providerDisplayName} Key Rejected
              </span>
            )}
            {connection.status === 'no-key' && (
              <span className={`${styles.statusPill} ${styles.statusOffline}`}>
                ● Local Canvas Commands Active · Live AI Offline
              </span>
            )}
            <span>· Class 10 Step-by-Step Geometry &amp; Algebra</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            onClick={() => setAllowAiDraw((enabled) => !enabled)}
            className={`${styles.clearBtn} ${allowAiDraw ? styles.canvasAccessOn : styles.canvasAccessOff}`}
            aria-pressed={allowAiDraw}
            title={allowAiDraw ? 'Allow tutor to draw and edit canvas' : 'Tutor canvas access is off'}
          >
            Canvas access {allowAiDraw ? 'on' : 'off'}
          </button>

          <select
            value={aiModel || models[0]?.id}
            onChange={(e) => setAiModel(e.target.value)}
            className={styles.modelSelect}
            title={`Select ${providerDisplayName} Model`}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {connection.status === 'offline' && (
            <button
              type="button"
              onClick={recheck}
              className={styles.clearBtn}
              title="Retry connection now"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowKeyPanel((v) => !v)}
            className={styles.clearBtn}
            title="Select AI Provider & Set API Key"
          >
            AI Provider &amp; Key
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

          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              className={styles.clearBtn}
              title={isMaximized ? 'Show guide & lessons below' : 'Maximize tutor to full view'}
            >
              {isMaximized ? 'Show Guide' : 'Maximize'}
            </button>
          )}
        </div>
      </header>

      {(needsKey || showKeyPanel) && (
        <div className={styles.keyPanel}>
          <div className={styles.providerToggle}>
            <button
              type="button"
              className={`${styles.providerBtn} ${selectedProvider === 'gemini' ? styles.providerBtnActive : ''}`}
              onClick={() => handleProviderChange('gemini')}
            >
              ✨ Google Gemini API (Recommended)
            </button>
            <button
              type="button"
              className={`${styles.providerBtn} ${selectedProvider === 'groq' ? styles.providerBtnActive : ''}`}
              onClick={() => handleProviderChange('groq')}
            >
              ⚡ Groq API
            </button>
          </div>

          <div className={styles.keyText}>
            {selectedProvider === 'gemini' ? (
              <>
                Paste your free <strong>Google Gemini API Key</strong> (starts with <code>AIzaSy...</code> or <code>AQ....</code>) for high-speed, generous rate limits.{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                  Get free Gemini key at Google AI Studio →
                </a>
              </>
            ) : (
              <>
                Paste your <strong>Groq API Key</strong> (starts with <code>gsk_...</code>).{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                  Get free key at console.groq.com →
                </a>
              </>
            )}
          </div>

          <div className={styles.keyRow}>
            <input
              type="password"
              value={keyDraft || (selectedProvider === 'gemini' ? geminiKey : groqKey)}
              onChange={handleKeyDraftChange}
              onKeyDown={(e) => e.key === 'Enter' && isValidKey(keyDraft) && saveKey()}
              placeholder={selectedProvider === 'gemini' ? 'AIzaSy... or AQ....' : 'gsk_...'}
              className={styles.keyInput}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className={styles.keySave}
              onClick={saveKey}
              disabled={!isValidKey(keyDraft || (selectedProvider === 'gemini' ? geminiKey : groqKey))}
            >
              Save &amp; Connect
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
            onClick={() => {
              onAsk?.();
              executeSend(q);
            }}
            disabled={isLoading}
          >
            {q}
          </button>
        ))}
      </div>

      <div ref={chatAreaRef} className={styles.chatArea}>
        {chatHistory.length === 0 && (
          <div className={styles.emptyState}>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                👋 Welcome to the Class 10 Maths &amp; Geometry Tutor!
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '540px', margin: '0 auto', lineHeight: '1.5' }}>
                Ask me to construct any triangle, incircle, circumcircle, altitude, polygon, or ruler measurement! All geometric drawings are constructed live on your canvas with exact mathematical proofs.
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
          placeholder="Ask a geometry or maths question (e.g., 'Draw a 3-4-5 triangle', 'Draw an incircle in it')..."
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
