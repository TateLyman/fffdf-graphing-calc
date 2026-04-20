/**
 * Exact value calculator (unit circle table + numeric fallback).
 * Browser: after mathjs loads, call createExactEvaluator(window.math).
 * Node: const math = require('mathjs'); createExactEvaluator(math);
 */
(function (root) {
  var exactValues = {
    '0': '0',
    '0.0000': '0',
    '-0.0000': '0',
    '0.5': '1/2',
    '-0.5': '-1/2',
    '0.5000': '1/2',
    '-0.5000': '-1/2',
    '0.7071': '√2/2',
    '-0.7071': '-√2/2',
    '0.8660': '√3/2',
    '-0.8660': '-√3/2',
    '0.5774': '√3/3',
    '-0.5774': '-√3/3',
    '1': '1',
    '-1': '-1',
    '1.7321': '√3',
    '-1.7321': '-√3',
    '2': '2',
    '-2': '-2',
    '1.1547': '2√3/3',
    '-1.1547': '-2√3/3',
    '1.4142': '√2',
    '-1.4142': '-√2'
  };

  var SING_EPS = 1e-10;

  function applyReciprocals(s) {
    return s
      .replace(/\bsec\s*\(/gi, '1/cos(')
      .replace(/\bcsc\s*\(/gi, '1/sin(')
      .replace(/\bcot\s*\(/gi, '1/tan(');
  }

  function normalizeInput(s) {
    return String(s)
      .replace(/\u2212/g, '-')
      .replace(/\u00b7/g, '*')
      .trim();
  }

  function stripFunctionDefinition(s) {
    var m = /^\s*[a-zA-Z_]\w*\s*\(\s*(?:theta|θ|\u03b8)\s*\)\s*=\s*(.*)$/i.exec(s);
    if (m) return m[1].trim();
    return s;
  }

  function implicitPiMultiply(s) {
    return s
      .replace(/(\d+)\s*pi\b/gi, '$1*pi')
      .replace(/\)\s*pi\b/gi, ')*pi');
  }

  function evalAngle(inner, math, scope) {
    var p = implicitPiMultiply(String(inner).trim());
    return math.evaluate(p, scope);
  }

  function checkSingularities(compact, math, scope) {
    var m;
    var th;
    // Do not match tan inside 1/tan (cot); cot(π/2) is 0, not undefined.
    if ((m = /(?:^|[^/])tan\(([^)]+)\)/.exec(compact))) {
      th = evalAngle(m[1], math, scope);
      if (typeof th === 'number' && isFinite(th) && Math.abs(Math.cos(th)) < SING_EPS) return true;
    }
    if ((m = /1\/sin\(([^)]+)\)/.exec(compact))) {
      th = evalAngle(m[1], math, scope);
      if (typeof th === 'number' && isFinite(th) && Math.abs(Math.sin(th)) < SING_EPS) return true;
    }
    if ((m = /1\/cos\(([^)]+)\)/.exec(compact))) {
      th = evalAngle(m[1], math, scope);
      if (typeof th === 'number' && isFinite(th) && Math.abs(Math.cos(th)) < SING_EPS) return true;
    }
    if ((m = /1\/tan\(([^)]+)\)/.exec(compact))) {
      th = evalAngle(m[1], math, scope);
      if (typeof th === 'number' && isFinite(th) && Math.abs(Math.sin(th)) < SING_EPS) return true;
    }
    return false;
  }

  function exactFormForNumber(n) {
    if (typeof n !== 'number' || n !== n || !isFinite(n)) return 'undefined';
    var rounded = Math.round(n * 10000) / 10000;
    var key = rounded.toFixed(4);
    if (key === '-0.0000') key = '0.0000';
    if (Object.prototype.hasOwnProperty.call(exactValues, key)) return exactValues[key];
    if (/^-?\d+\.0000$/.test(key)) {
      var intKey = String(parseInt(key, 10));
      if (Object.prototype.hasOwnProperty.call(exactValues, intKey)) return exactValues[intKey];
    }
    return String(rounded);
  }

  /** True if input looks like "LHS = RHS" (not ==, <=, etc.) — math.evaluate would not return a scalar. */
  function looksLikeEquation(compact) {
    if (!/=/.test(compact)) return false;
    if (/===|!==|==|<=|>=|!=/.test(compact)) return false;
    return /(^|[^=!<>])=([^=]|$)/.test(compact);
  }

  function createExactEvaluator(math) {
    // theta (and θ) is the unit-circle angle variable — same as pi for this worksheet-style tool.
    var scope = {
      pi: Math.PI,
      theta: Math.PI,
      '\u03b8': Math.PI,
      // Same reference angle as theta (worksheet-style); enables tan(x/6) etc.
      x: Math.PI,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan
    };

    return function exactEvaluate(raw) {
      var t = normalizeInput(raw);
      if (!t) return '';

      t = stripFunctionDefinition(t);
      if (!t) return '';

      var prepared = implicitPiMultiply(applyReciprocals(t));
      var compact = prepared.replace(/\s+/g, '');

      if (looksLikeEquation(compact)) {
        return 'Use Trig equation row (⌘⇧Q) for =';
      }

      if (checkSingularities(compact, math, scope)) return 'undefined';

      var val;
      try {
        val = math.evaluate(prepared, scope);
      } catch (e) {
        return 'undefined';
      }

      if (val && typeof val === 'object') {
        if (typeof val.re === 'number' && typeof val.im === 'number' && Math.abs(val.im) > 1e-10) {
          return 'undefined';
        }
        if (typeof val.valueOf === 'function') val = val.valueOf();
      }

      if (typeof val !== 'number' || val !== val || !isFinite(val)) return 'undefined';

      return exactFormForNumber(val);
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createExactEvaluator, exactValues };
  }
  root.createExactEvaluator = createExactEvaluator;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
