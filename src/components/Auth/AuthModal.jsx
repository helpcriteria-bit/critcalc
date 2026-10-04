import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../../firebase/authService';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMessage,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isConfigured
  } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || (mode !== 'reset' && !password)) {
      setError(mode === 'reset' ? 'Please provide your email address.' : 'Please provide both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('If an account exists for that email, a password reset link will be sent.');
        setMode('signin');
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        const result = await signUpWithEmail(email, password, displayName);
        setMode('signin');
        setSuccess(`Account created. Check ${result.email} for a verification link before signing in.`);
      }
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          closeAuthModal();
        }
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.brandIcon}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" />
              </svg>
            </div>
            <div>
              <div id="auth-title" className={styles.title}>
                {mode === 'signin' ? 'Student Sign In' : mode === 'signup' ? 'Create Student Account' : 'Reset Password'}
              </div>
              <div className={styles.subtitle}>
                Save and access your geometric canvases from any device
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeAuthModal}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {authModalMessage && (
          <div className={styles.bannerMessage}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{authModalMessage}</span>
          </div>
        )}

        {!isConfigured && (
          <div style={{ padding: '0 24px', marginTop: 14 }}>
            <div className={styles.notConfiguredAlert}>
              <b>Firebase Configuration Pending</b>
              Please add your Firebase keys (<code>VITE_FIREBASE_*</code>) to your <code>.env</code> file to enable student authentication and cloud sync.
            </div>
          </div>
        )}

        {mode !== 'reset' && <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signin' ? styles.activeTab : ''}`}
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccess('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccess('');
            }}
          >
            Create Account
          </button>
        </div>}

        <div className={styles.body}>
          {error && (
            <div className={styles.errorAlert}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && <div className={styles.successAlert}>{success}</div>}

          {mode !== 'reset' && <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleSignIn}
            disabled={loading || !isConfigured}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.31 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.43l4.02-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>}

          {mode !== 'reset' && <div className={styles.divider}>or with email</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'signup' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Alex Turing"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Student Email</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="student@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {mode !== 'reset' && <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={mode === 'signup' ? 8 : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                disabled={loading}
              />
            </div>}

            {mode === 'signin' && (
              <button
                type="button"
                className={styles.textAction}
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setSuccess('');
                }}
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !isConfigured}
            >
              {loading && <div className={styles.spinner} />}
              <span>{mode === 'signin' ? 'Sign In to CritCalc' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
            </button>
          </form>
          {mode === 'reset' && (
            <button
              type="button"
              className={styles.textAction}
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('');
              }}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
