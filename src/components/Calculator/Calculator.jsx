import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateExpression } from '../../canvas/mathParser';
import styles from './Calculator.module.css';

export default function Calculator() {
  const { calcMemory, setCalcMemory } = useApp();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isError, setIsError] = useState(false);
  const [isDeg, setIsDeg] = useState(true);
  const [lastAns, setLastAns] = useState(0);
  const [history, setHistory] = useState([]);

  // Evaluate expression live on expression change
  useEffect(() => {
    if (!expression.trim()) {
      setResult('0');
      setIsError(false);
      return;
    }
    try {
      const val = evaluateExpression(expression, { isDeg, variables: { ANS: lastAns } });
      if (typeof val === 'number' && !isNaN(val)) {
        const formatted = Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(8)).toString();
        setResult(formatted);
        setIsError(false);
      } else {
        setResult('Error');
        setIsError(true);
      }
    } catch (e) {
      setResult('Error');
      setIsError(true);
    }
  }, [expression, isDeg, lastAns]);

  const handleButtonClick = useCallback((btn) => {
    switch (btn) {
      case 'C':
        setExpression('');
        setResult('0');
        setIsError(false);
        break;

      case '⌫':
        setExpression((prev) => prev.slice(0, -1));
        break;

      case '=':
        if (expression.trim() && !isError && result !== 'Error') {
          const numResult = parseFloat(result);
          setLastAns(numResult);
          setHistory((prev) => [
            { expr: expression, res: result },
            ...prev.slice(0, 4)
          ]);
          setExpression(result);
        }
        break;

      case 'DEG/RAD':
        setIsDeg((prev) => !prev);
        break;

      case 'ANS':
        setExpression((prev) => prev + lastAns.toString());
        break;

      case 'M+':
        if (!isError && result !== 'Error') {
          const numVal = parseFloat(result) || 0;
          setCalcMemory((prev) => prev + numVal);
        }
        break;

      case 'M-':
        if (!isError && result !== 'Error') {
          const numVal = parseFloat(result) || 0;
          setCalcMemory((prev) => prev - numVal);
        }
        break;

      case 'MR':
        setExpression((prev) => prev + calcMemory.toString());
        break;

      case 'MC':
        setCalcMemory(0);
        break;

      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'log':
      case 'ln':
      case 'sqrt':
      case 'abs':
      case 'floor':
      case 'ceil':
      case 'round':
        setExpression((prev) => prev + `${btn}(`);
        break;

      case 'sin⁻¹':
        setExpression((prev) => prev + 'asin(');
        break;
      case 'cos⁻¹':
        setExpression((prev) => prev + 'acos(');
        break;
      case 'tan⁻¹':
        setExpression((prev) => prev + 'atan(');
        break;

      case '√':
        setExpression((prev) => prev + 'sqrt(');
        break;

      case 'x²':
        setExpression((prev) => prev + '^2');
        break;

      case 'xʸ':
      case 'xⁿ':
        setExpression((prev) => prev + '^');
        break;

      case '1/x':
        setExpression((prev) => prev + 'recip(');
        break;

      case 'n!':
        setExpression((prev) => prev + '!');
        break;

      case '±':
        if (expression.startsWith('-')) {
          setExpression((prev) => prev.slice(1));
        } else {
          setExpression((prev) => '-' + prev);
        }
        break;

      case '÷':
        setExpression((prev) => prev + '/');
        break;

      case '×':
        setExpression((prev) => prev + '*');
        break;

      case '−':
        setExpression((prev) => prev + '-');
        break;

      case 'π':
        setExpression((prev) => prev + 'π');
        break;

      case 'e':
        setExpression((prev) => prev + 'e');
        break;

      case 'EXP':
        setExpression((prev) => prev + 'e');
        break;

      default:
        setExpression((prev) => prev + btn);
        break;
    }
  }, [calcMemory, expression, isDeg, isError, lastAns, result, setCalcMemory]);

  // Keyboard navigation support for Calculator
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing into an input field or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        handleButtonClick(e.key);
      } else if (e.key === '.') {
        handleButtonClick('.');
      } else if (e.key === '+') {
        handleButtonClick('+');
      } else if (e.key === '-') {
        handleButtonClick('−');
      } else if (e.key === '*') {
        handleButtonClick('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleButtonClick('÷');
      } else if (e.key === '^') {
        handleButtonClick('xʸ');
      } else if (e.key === '(' || e.key === ')') {
        handleButtonClick(e.key);
      } else if (e.key === '!' || e.key === '%') {
        handleButtonClick(e.key === '!' ? 'n!' : '%');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleButtonClick('=');
      } else if (e.key === 'Backspace') {
        handleButtonClick('⌫');
      } else if (e.key === 'Escape') {
        handleButtonClick('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonClick]);

  const restoreHistory = (item) => {
    setExpression(item.expr);
  };

  const buttons = [
    // Row 1: Trigonometric functions
    { id: 'sin', label: 'sin', action: 'sin', tooltip: 'Sine — Calculates the sine of an angle.', style: styles.funcBtn },
    { id: 'cos', label: 'cos', action: 'cos', tooltip: 'Cosine — Calculates the cosine of an angle.', style: styles.funcBtn },
    { id: 'tan', label: 'tan', action: 'tan', tooltip: 'Tangent — Calculates the tangent of an angle.', style: styles.funcBtn },
    { id: 'asin', label: 'sin⁻¹', action: 'sin⁻¹', tooltip: 'Inverse Sine — Calculates arcsine.', style: styles.funcBtn },
    { id: 'acos', label: 'cos⁻¹', action: 'cos⁻¹', tooltip: 'Inverse Cosine — Calculates arccosine.', style: styles.funcBtn },
    { id: 'atan', label: 'tan⁻¹', action: 'tan⁻¹', tooltip: 'Inverse Tangent — Calculates arctangent.', style: styles.funcBtn },

    // Row 2: Powers, Roots, Logs & Reciprocal
    { id: 'sqrt', label: '√', action: '√', tooltip: 'Square root — Finds the square root of a number.', style: styles.funcBtn },
    { id: 'sqr', label: 'x²', action: 'x²', tooltip: 'Square — Raises a number to the power of 2.', style: styles.funcBtn },
    { id: 'pow', label: 'xʸ', action: 'xʸ', tooltip: 'Power — Raises a number to another power.', style: styles.funcBtn },
    { id: 'recip', label: '1/x', action: '1/x', tooltip: 'Reciprocal — Calculates 1 divided by x.', style: styles.funcBtn },
    { id: 'log', label: 'log', action: 'log', tooltip: 'Logarithm — Calculates log base 10.', style: styles.funcBtn },
    { id: 'ln', label: 'ln', action: 'ln', tooltip: 'Natural log — Calculates log base e.', style: styles.funcBtn },

    // Row 3: Constants & Parentheses & Factorial
    { id: 'fact', label: 'n!', action: 'n!', tooltip: 'Factorial — Multiplies all positive integers up to n.', style: styles.funcBtn },
    { id: 'pi', label: 'π', action: 'π', tooltip: 'Pi — Inserts Archimedes constant π (≈ 3.14159).', style: styles.constBtn },
    { id: 'e', label: 'e', action: 'e', tooltip: "Euler's number — Inserts base of natural log (≈ 2.71828).", style: styles.constBtn },
    { id: 'lparen', label: '(', action: '(', tooltip: 'Open parenthesis — Begin grouped expression.', style: styles.defaultBtn },
    { id: 'rparen', label: ')', action: ')', tooltip: 'Close parenthesis — Close grouped expression.', style: styles.defaultBtn },
    { id: 'pct', label: '%', action: '%', tooltip: 'Percent / Modulo — Calculates remainder or percentage.', style: styles.operatorBtn },

    // Row 4: Digits & Operations
    { id: 'num7', label: '7', action: '7', tooltip: 'Seven', style: styles.defaultBtn },
    { id: 'num8', label: '8', action: '8', tooltip: 'Eight', style: styles.defaultBtn },
    { id: 'num9', label: '9', action: '9', tooltip: 'Nine', style: styles.defaultBtn },
    { id: 'div', label: '÷', action: '÷', tooltip: 'Divide — Divides the left operand by the right.', style: styles.operatorBtn },
    { id: 'clear', label: 'C', action: 'C', tooltip: 'Clear — Erases current calculation expression.', style: styles.clearBtn },
    { id: 'bksp', label: '⌫', action: '⌫', tooltip: 'Backspace — Deletes the last entered character.', style: styles.clearBtn },

    // Row 5:
    { id: 'num4', label: '4', action: '4', tooltip: 'Four', style: styles.defaultBtn },
    { id: 'num5', label: '5', action: '5', tooltip: 'Five', style: styles.defaultBtn },
    { id: 'num6', label: '6', action: '6', tooltip: 'Six', style: styles.defaultBtn },
    { id: 'mul', label: '×', action: '×', tooltip: 'Multiply — Multiplies numbers.', style: styles.operatorBtn },
    { id: 'pm', label: '±', action: '±', tooltip: 'Sign toggle — Inverts the positive/negative sign.', style: styles.defaultBtn },
    { id: 'mod', label: 'mod', action: 'mod', tooltip: 'Modulo — Calculates integer division remainder.', style: styles.operatorBtn },

    // Row 6:
    { id: 'num1', label: '1', action: '1', tooltip: 'One', style: styles.defaultBtn },
    { id: 'num2', label: '2', action: '2', tooltip: 'Two', style: styles.defaultBtn },
    { id: 'num3', label: '3', action: '3', tooltip: 'Three', style: styles.defaultBtn },
    { id: 'sub', label: '−', action: '−', tooltip: 'Subtract — Subtracts the right operand from the left.', style: styles.operatorBtn },
    { id: 'exp', label: 'EXP', action: 'EXP', tooltip: 'Exponential — Inserts scientific notation 10^x.', style: styles.defaultBtn },
    { id: 'ans', label: 'ANS', action: 'ANS', tooltip: 'Answer — Recalls the value of the last calculated result.', style: styles.defaultBtn },

    // Row 7:
    { id: 'num0', label: '0', action: '0', tooltip: 'Zero', style: styles.defaultBtn },
    { id: 'dot', label: '.', action: '.', tooltip: 'Decimal point', style: styles.defaultBtn },
    { id: 'eq', label: '=', action: '=', tooltip: 'Equals — Calculates expression result.', style: `${styles.operatorBtn} ${styles.equalsBtn}` },
    { id: 'add', label: '+', action: '+', tooltip: 'Add — Adds numbers together.', style: styles.operatorBtn },
    { id: 'mplus', label: 'M+', action: 'M+', tooltip: 'Memory Add — Adds the current result to memory.', style: styles.defaultBtn },
    { id: 'mminus', label: 'M−', action: 'M-', tooltip: 'Memory Subtract — Subtracts the current result from memory.', style: styles.defaultBtn },

    // Row 8:
    { id: 'mr', label: 'MR', action: 'MR', tooltip: 'Memory Recall — Pastes stored value from memory.', style: styles.defaultBtn },
    { id: 'mc', label: 'MC', action: 'MC', tooltip: 'Memory Clear — Resets stored memory to 0.', style: styles.defaultBtn },
    {
      id: 'degrad',
      label: isDeg ? 'DEG' : 'RAD',
      action: 'DEG/RAD',
      tooltip: isDeg ? 'Degrees mode — Trigonometric functions evaluate in degrees. Click to toggle to Radians.' : 'Radians mode — Trigonometric functions evaluate in radians. Click to toggle to Degrees.',
      style: styles.modeBtn,
      span: 4
    }
  ];

  return (
    <div className={styles.calculatorCard}>
      <div className={styles.displayArea}>
        <div className={styles.badgeRow}>
          {calcMemory !== 0 && (
            <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginRight: 'auto' }}>
              M = {calcMemory}
            </span>
          )}
          <span
            className={styles.modeBadge}
            title={isDeg ? 'Operating in Degrees mode' : 'Operating in Radians mode'}
          >
            {isDeg ? 'DEG' : 'RAD'}
          </span>
        </div>
        <div className={styles.expressionLine}>{expression || ' '}</div>
        <div className={`${styles.resultLine} ${isError ? styles.errorText : ''}`}>
          {result}
        </div>

        {history.length > 0 && (
          <div className={styles.historyList}>
            {history.map((h, i) => (
              <div
                key={i}
                className={styles.historyItem}
                onClick={() => restoreHistory(h)}
                title="Click to restore this calculation"
              >
                <span>{h.expr}</span>
                <span className={styles.historyRes}>= {h.res}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.buttonGrid}>
        {buttons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className={btn.style}
            style={btn.span ? { gridColumn: `span ${btn.span}` } : undefined}
            onClick={() => handleButtonClick(btn.action)}
            title={btn.tooltip}
            aria-label={btn.tooltip}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
