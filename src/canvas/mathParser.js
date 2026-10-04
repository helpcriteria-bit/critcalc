/**
 * MathParser - Recursive Descent Parser for Mathematical Expressions
 * Evaluates math expressions safely without using eval().
 */

export function evaluateExpression(exprString, options = {}) {
  const { isDeg = true, variables = {} } = options;

  if (!exprString || typeof exprString !== 'string' || !exprString.trim()) {
    throw new Error('Empty expression');
  }

  // Pre-process symbols like ×, ÷, −, π
  let sanitized = exprString
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/sin⁻¹/g, 'asin')
    .replace(/cos⁻¹/g, 'acos')
    .replace(/tan⁻¹/g, 'atan')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√([0-9a-zA-Z._]+)/g, 'sqrt($1)');

  // Tokenize
  const tokens = [];
  let i = 0;
  const len = sanitized.length;

  while (i < len) {
    const ch = sanitized[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Numbers (including decimals and scientific notation like 1.5e3)
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(sanitized[i + 1]))) {
      let numStr = '';
      while (i < len && (/[0-9.]/.test(sanitized[i]))) {
        numStr += sanitized[i];
        i++;
      }
      // Check for e or E followed by + or - and digits (scientific notation)
      if (i < len && (sanitized[i] === 'e' || sanitized[i] === 'E')) {
        let eStr = sanitized[i];
        let peek = i + 1;
        if (peek < len && (sanitized[peek] === '+' || sanitized[peek] === '-')) {
          eStr += sanitized[peek];
          peek++;
        }
        if (peek < len && /[0-9]/.test(sanitized[peek])) {
          i = peek;
          while (i < len && /[0-9]/.test(sanitized[i])) {
            eStr += sanitized[i];
            i++;
          }
          numStr += eStr;
        }
      }
      const val = parseFloat(numStr);
      if (isNaN(val)) throw new Error(`Invalid number: ${numStr}`);
      tokens.push({ type: 'NUMBER', value: val });
      continue;
    }

    // Identifiers (functions, constants, mod)
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < len && /[a-zA-Z0-9_]/.test(sanitized[i])) {
        id += sanitized[i];
        i++;
      }
      tokens.push({ type: 'IDENT', value: id });
      continue;
    }

    // Operators & Punctuation
    if (['+', '-', '*', '/', '^', '%', '(', ')', '!'].includes(ch)) {
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: '${ch}'`);
  }

  // Parser State
  let tokenIdx = 0;

  function peek() {
    return tokens[tokenIdx];
  }

  function consume() {
    return tokens[tokenIdx++];
  }

  function factorial(n) {
    if (n < 0 || Math.floor(n) !== n) throw new Error('Factorial requires non-negative integer');
    if (n > 170) return Infinity;
    let res = 1;
    for (let j = 2; j <= n; j++) res *= j;
    return res;
  }

  function parseExpr() {
    let left = parseTerm();
    while (tokenIdx < tokens.length) {
      const tok = peek();
      if (tok && tok.type === 'OP' && (tok.value === '+' || tok.value === '-')) {
        consume();
        const right = parseTerm();
        if (tok.value === '+') left = left + right;
        else left = left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (tokenIdx < tokens.length) {
      const tok = peek();
      const next = tokens[tokenIdx + 1];
      const isModulo = tok && (
        (tok.type === 'OP' && tok.value === '%') ||
        (tok.type === 'IDENT' && tok.value === 'mod')
      ) && next && (
        next.type === 'NUMBER' ||
        next.type === 'IDENT' ||
        (next.type === 'OP' && next.value === '(')
      );
      const isExplicitOperator = tok && tok.type === 'OP' && ['*', '/', '%'].includes(tok.value) &&
        (tok.value !== '%' || isModulo);
      const isWordModulo = tok && tok.type === 'IDENT' && tok.value === 'mod';
      const isImplicitProduct = tok && (
        tok.type === 'IDENT' && tok.value.toLowerCase() !== 'mod' ||
        tok.type === 'OP' && tok.value === '('
      );
      if (isExplicitOperator || isWordModulo) {
        consume();
        const right = parseFactor();
        if (tok.value === '*') left = left * right;
        else if (tok.value === '/') {
          if (right === 0) throw new Error('Division by zero');
          left = left / right;
        } else if (tok.value === '%' || tok.value === 'mod') {
          if (right === 0) throw new Error('Modulo by zero');
          left = left % right;
        }
      } else if (isImplicitProduct) {
        left *= parseFactor();
      } else {
        break;
      }
    }
    return left;
  }

  function parseFactor() {
    return parseUnary();
  }

  function parseUnary() {
    const tok = peek();
    if (tok && tok.type === 'OP' && (tok.value === '+' || tok.value === '-')) {
      consume();
      const operand = parseUnary();
      return tok.value === '-' ? -operand : operand;
    }
    return parsePower();
  }

  function parsePower() {
    const base = parsePostfix();
    const tok = peek();
    if (tok && tok.type === 'OP' && tok.value === '^') {
      consume();
      return Math.pow(base, parseUnary());
    }
    return base;
  }

  function parsePostfix() {
    let prim = parsePrimary();
    while (tokenIdx < tokens.length) {
      const tok = peek();
      if (tok?.type === 'OP' && tok.value === '!') {
        consume();
        prim = factorial(prim);
      } else if (tok?.type === 'OP' && tok.value === '%') {
        const next = tokens[tokenIdx + 1];
        if (next && (
          next.type === 'NUMBER' ||
          next.type === 'IDENT' ||
          (next.type === 'OP' && next.value === '(')
        )) break;
        consume();
        prim /= 100;
      } else {
        break;
      }
    }
    return prim;
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) {
      throw new Error('Unexpected end of expression');
    }

    if (tok.type === 'NUMBER') {
      consume();
      return tok.value;
    }

    if (tok.type === 'OP' && tok.value === '(') {
      consume();
      const expr = parseExpr();
      const next = peek();
      if (!next || next.type !== 'OP' || next.value !== ')') {
        throw new Error("Missing closing parenthesis ')'");
      }
      consume();
      return expr;
    }

    if (tok.type === 'IDENT') {
      const name = tok.value.toLowerCase();
      consume();

      // Check if function call
      const nextTok = peek();
      if (nextTok && nextTok.type === 'OP' && nextTok.value === '(') {
        consume(); // consume '('
        const arg = parseExpr();
        const closeTok = peek();
        if (!closeTok || closeTok.type !== 'OP' || closeTok.value !== ')') {
          throw new Error(`Missing closing ')' for function '${name}'`);
        }
        consume(); // consume ')'

        return applyFunction(name, arg, isDeg);
      }

      // Check for constants or variables
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      for (const variableName of [tok.value, name]) {
        if (Object.prototype.hasOwnProperty.call(variables, variableName)) {
          const value = variables[variableName];
          if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new Error(`Variable '${tok.value}' must contain a finite number`);
          }
          return value;
        }
      }

      // Handle function used without parenthesis like sin30 or sqrt9 if applicable
      throw new Error(`Unknown variable or function call missing '()': ${tok.value}`);
    }

    throw new Error(`Unexpected token '${tok.value}'`);
  }

  function applyFunction(name, arg, isDeg) {
    const rad = isDeg ? (arg * Math.PI) / 180 : arg;

    switch (name) {
      case 'sin': return Math.sin(rad);
      case 'cos': return Math.cos(rad);
      case 'tan': {
        const val = Math.tan(rad);
        if (Math.abs(val) > 1e15) throw new Error('Undefined (tan of 90°)');
        return val;
      }
      case 'asin': {
        if (arg < -1 || arg > 1) throw new Error('asin out of range [-1, 1]');
        const res = Math.asin(arg);
        return isDeg ? (res * 180) / Math.PI : res;
      }
      case 'acos': {
        if (arg < -1 || arg > 1) throw new Error('acos out of range [-1, 1]');
        const res = Math.acos(arg);
        return isDeg ? (res * 180) / Math.PI : res;
      }
      case 'atan': {
        const res = Math.atan(arg);
        return isDeg ? (res * 180) / Math.PI : res;
      }
      case 'sqrt': {
        if (arg < 0) throw new Error('Square root of negative number');
        return Math.sqrt(arg);
      }
      case 'log': {
        if (arg <= 0) throw new Error('Logarithm of non-positive number');
        return Math.log10(arg);
      }
      case 'ln': {
        if (arg <= 0) throw new Error('Ln of non-positive number');
        return Math.log(arg);
      }
      case 'abs': return Math.abs(arg);
      case 'floor': return Math.floor(arg);
      case 'ceil': return Math.ceil(arg);
      case 'round': return Math.round(arg);
      case 'fact': return factorial(arg);
      case 'recip': {
        if (arg === 0) throw new Error('Division by zero');
        return 1 / arg;
      }
      default:
        throw new Error(`Unknown function: '${name}'`);
    }
  }

  const result = parseExpr();
  if (tokenIdx < tokens.length) {
    throw new Error(`Unexpected token '${tokens[tokenIdx].value}'`);
  }
  if (!Number.isFinite(result)) {
    throw new Error('Result is not finite');
  }
  return result;
}
