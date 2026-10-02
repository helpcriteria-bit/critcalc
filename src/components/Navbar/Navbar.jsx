import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { groqKey, setGroqKey, resetCanvasToNew } = useApp();
  const { user, signOut, openAuthModal } = useAuth();

  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [tempKey, setTempKey] = useState(groqKey);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setGroqKey(tempKey.trim());
    setShowKeyDropdown(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (!e.target.closest(`.${styles.keyIndicatorWrapper}`)) {
        setShowKeyDropdown(false);
      }
      if (!e.target.closest(`.${styles.authSection}`)) {
        setShowUserDropdown(false);
      }
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const handleNewCanvas = () => {
    resetCanvasToNew();
    setShowUserDropdown(false);
    navigate('/canvas');
  };

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'ST';
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <NavLink to="/" className={styles.brand}>
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" />
          </svg>
          <span>CritCalc</span>
        </NavLink>
      </div>

      <nav className={styles.center}>
        <NavLink to="/" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)} end>
          Home
        </NavLink>
        <NavLink to="/canvas" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
          Canvas
        </NavLink>
        <NavLink to="/my-canvases" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
          My Canvases
        </NavLink>
        <NavLink to="/calculator" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
          Calculator
        </NavLink>
        <NavLink to="/tutor" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
          Tutor
        </NavLink>
      </nav>

      <div className={styles.right}>
        {/* Groq Connection */}
        <div className={styles.keyIndicatorWrapper}>
          <button
            type="button"
            className={styles.keyButton}
            onClick={() => {
              setTempKey(groqKey);
              setShowKeyDropdown(!showKeyDropdown);
            }}
            title="Groq API Key Settings"
          >
            <span className={`${styles.dot} ${groqKey ? styles.dotGreen : styles.dotGrey}`} />
            <span className={styles.keyText}>{groqKey ? 'Groq Connected' : 'Set Groq Key'}</span>
          </button>

          {showKeyDropdown && (
            <div className={styles.dropdown}>
              <form onSubmit={handleSaveKey}>
                <label className={styles.label}>Groq API Key</label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="gsk_..."
                  className={styles.input}
                  autoFocus
                />
                <div className={styles.dropdownActions}>
                  <button type="submit" className={styles.saveBtn}>Save Key</button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowKeyDropdown(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className={styles.linkHelp}
              >
                Get free key at console.groq.com →
              </a>
            </div>
          )}
        </div>

        {/* Student Auth Section */}
        <div className={styles.authSection}>
          {user ? (
            <>
              <button
                type="button"
                className={styles.userChip}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                title="Account menu"
              >
                <div className={styles.avatar}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Student'} className={styles.avatarImg} />
                  ) : (
                    <span>{getInitials(user.displayName, user.email)}</span>
                  )}
                </div>
                <span className={styles.userName}>{user.displayName || user.email?.split('@')[0]}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showUserDropdown && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <span className={styles.userDropdownName}>{user.displayName || 'Student User'}</span>
                    <span className={styles.userDropdownEmail}>{user.email}</span>
                    <span className={styles.uidBadge} title={`Firebase UID: ${user.uid}`}>
                      UID: {user.uid.slice(0, 8)}...
                    </span>
                  </div>

                  <Link
                    to="/my-canvases"
                    className={styles.userDropdownItem}
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span>My Canvases</span>
                  </Link>

                  <button
                    type="button"
                    className={styles.userDropdownItem}
                    onClick={handleNewCanvas}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>New Canvas</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.userDropdownItem} ${styles.signOutItem}`}
                    onClick={() => {
                      setShowUserDropdown(false);
                      signOut();
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              className={styles.signInBtn}
              onClick={() => openAuthModal('Sign in to access your student cloud storage')}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
