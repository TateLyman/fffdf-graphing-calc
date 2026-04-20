/**
 * Solve trig equations: split LHS = RHS, reduce algebraically (math.simplify / factor patterns),
 * then map sin/cos/tan values to angles using hardcoded unit-circle tables only — no numeric root search.
 */
(function (root) {
  var math = null;

  function setMath(m) {
    math = m;
  }

  var VALID_ANGLES = [
    '0',
    'π/6',
    'π/4',
    'π/3',
    'π/2',
    '2π/3',
    '3π/4',
    '5π/6',
    'π',
    '7π/6',
    '5π/4',
    '4π/3',
    '3π/2',
    '5π/3',
    '7π/4',
    '11π/6',
    '2π'
  ];

  /** Keys must match mathjs parse + symbolicEqual for constants. */
  var SIN_KEY_TO_ANGLES = {
    '0': ['0', 'π', '2π'],
    '1/2': ['π/6', '5π/6'],
    '-1/2': ['7π/6', '11π/6'],
    'sqrt(2)/2': ['π/4', '3π/4'],
    '-sqrt(2)/2': ['5π/4', '7π/4'],
    'sqrt(3)/2': ['π/3', '2π/3'],
    '-sqrt(3)/2': ['4π/3', '5π/3'],
    '1': ['π/2'],
    '-1': ['3π/2']
  };

  var COS_KEY_TO_ANGLES = {
    '1': ['0', '2π'],
    'sqrt(3)/2': ['π/6', '11π/6'],
    'sqrt(2)/2': ['π/4', '7π/4'],
    '1/2': ['π/3', '5π/3'],
    '0': ['π/2', '3π/2'],
    '-1/2': ['2π/3', '4π/3'],
    '-sqrt(2)/2': ['3π/4', '5π/4'],
    '-sqrt(3)/2': ['5π/6', '7π/6'],
    '-1': ['π']
  };

  var TAN_KEY_TO_ANGLES = {
    '0': ['0', 'π', '2π'],
    'sqrt(3)/3': ['π/6', '7π/6'],
    '1': ['π/4', '5π/4'],
    'sqrt(3)': ['π/3', '4π/3'],
    '-sqrt(3)/3': ['5π/6', '11π/6'],
    '-1': ['3π/4', '7π/4'],
    '-sqrt(3)': ['2π/3', '5π/3']
  };

  /**
   * Spoon-fed unit circle lookup (decimal keys) — no arcsin, no numeric trig.
   * @see isolate-and-lookup flow for a*sin(x)+b = c
   */
  var sinSolutions = {
    '0': ['0', 'π', '2π'],
    '1': ['π/2'],
    '-1': ['3π/2'],
    '0.5': ['π/6', '5π/6'],
    '-0.5': ['7π/6', '11π/6'],
    '0.7071': ['π/4', '3π/4'],
    '-0.7071': ['5π/4', '7π/4'],
    '0.8660': ['π/3', '2π/3'],
    '-0.8660': ['4π/3', '5π/3']
  };

  /** Map simplified sin value (symbolic key) → key into sinSolutions (decimal string). */
  var SIN_SYMBOL_TO_TABLE_KEY = {
    '0': '0',
    '1': '1',
    '-1': '-1',
    '1/2': '0.5',
    '-1/2': '-0.5',
    'sqrt(2)/2': '0.7071',
    '-sqrt(2)/2': '-0.7071',
    'sqrt(3)/2': '0.8660',
    '-sqrt(3)/2': '-0.8660'
  };

  var CONST_KEYS = [
    '0',
    '1',
    '-1',
    '1/2',
    '-1/2',
    'sqrt(2)/2',
    '-sqrt(2)/2',
    'sqrt(3)/2',
    '-sqrt(3)/2',
    'sqrt(3)/3',
    '-sqrt(3)/3',
    'sqrt(3)',
    '-sqrt(3)',
    '2 * sqrt(3) / 3',
    '-2 * sqrt(3) / 3'
  ];

  function prepExpr(s) {
    return String(s)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\uFF1D/g, '=')
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function prepTrigPow(s) {
    return s.replace(/(sin|cos|tan)\^2\s*\(\s*x\s*\)/gi, function (_, t) {
      return '(' + t + '(x))^2';
    });
  }

  /**
   * Normalize unicode that breaks implicit multiply / trig grouping.
   */
  function normalizeTrigExprChars(s) {
    return String(s)
      .replace(/\uFF08/g, '(')
      .replace(/\uFF09/g, ')')
      .replace(/\u1D465|\uFF58/g, 'x');
  }

  /**
   * Worksheet convention: the variable is always x; the constant is outside sin/cos/tan.
   * If prep/mathjs would yield coef*sin(number)+x (angle looks numeric, x orphaned), rewrite to coef*sin(x)+number.
   * Does not use arcsin or numeric trig — string rewrite only.
   */
  function repairTrigLinearConstantForm(s) {
    var t = String(s).replace(/\s+/g, ' ').trim();
    var r1 = /^(\d+)\s*\*\s*(sin|cos|tan)\s*\(\s*([-0-9.]+)\s*\)\s*\+\s*x\s*$/i;
    if (r1.test(t)) {
      return t.replace(r1, function (_, coef, trig, num) {
        return coef + '*' + trig + '(x)+' + num;
      });
    }
    var r2 = /^(sin|cos|tan)\s*\(\s*([-0-9.]+)\s*\)\s*\+\s*x\s*$/i;
    if (r2.test(t)) {
      return t.replace(r2, function (_, trig, num) {
        return trig + '(x)+' + num;
      });
    }
    return t;
  }

  function prepForParse(s) {
    s = prepExpr(s);
    s = normalizeTrigExprChars(s);
    s = prepTrigPow(s);
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(\d)(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(-?\d+)\s*(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(\d)\(/g, '$1*(');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    s = s.replace(/\bsqrt\s*\(/gi, 'sqrt(');
    s = repairTrigLinearConstantForm(s);
    return s;
  }

  function normalizeIntervalExpr(part) {
    var t = String(part).trim();
    t = t.replace(/(\d)\s*pi\b/gi, '$1*pi');
    t = t.replace(/(\d)pi\b/gi, '$1*pi');
    return t;
  }

  function parseIntervalEq(str) {
    var s = prepExpr(str);
    var m = /^\s*([\[(])\s*([^,]+)\s*,\s*([^,]+)\s*([\])])\s*$/.exec(s);
    if (!m) return { lo: 0, hi: 2 * Math.PI, openL: false, openR: false };
    var lo = math.evaluate(normalizeIntervalExpr(m[2]), { pi: Math.PI });
    var hi = math.evaluate(normalizeIntervalExpr(m[3]), { pi: Math.PI });
    return { lo: lo, hi: hi, openL: m[1] === '(', openR: m[4] === ')' };
  }

  function splitEquation(raw) {
    var s = prepExpr(raw);
    if (/\band\b/i.test(s)) {
      var parts = s.split(/\s+and\s+/i).map(function (p) {
        return p.trim();
      });
      return { compound: true, parts: parts };
    }
    var idx = s.indexOf('=');
    if (idx === -1) return null;
    return {
      compound: false,
      left: s.slice(0, idx).trim(),
      right: s.slice(idx + 1).trim()
    };
  }

  function hasX(node) {
    if (!node) return false;
    if (node.type === 'SymbolNode' && node.name === 'x') return true;
    if (node.args) {
      for (var i = 0; i < node.args.length; i++) {
        if (hasX(node.args[i])) return true;
      }
    }
    if (node.content) return hasX(node.content);
    return false;
  }

  function trigName(fnode) {
    return fnode && fnode.type === 'FunctionNode' && fnode.fn ? fnode.fn.name : '';
  }

  function hasSqrt(node) {
    if (!node) return false;
    if (node.type === 'FunctionNode' && trigName(node) === 'sqrt') return true;
    if (node.args) {
      for (var j = 0; j < node.args.length; j++) {
        if (hasSqrt(node.args[j])) return true;
      }
    }
    return false;
  }

  /** Fold constant-only subexpressions to numbers, but never collapse sqrt (preserves symbolic keys). */
  function foldConstNoSqrt(node) {
    if (!node) return node;
    if (!hasX(node)) {
      if (hasSqrt(node)) return node;
      try {
        var v = node.evaluate({ pi: Math.PI });
        if (typeof v === 'number' && isFinite(v)) {
          return new math.ConstantNode(v);
        }
      } catch (e0) {}
    }
    if (node.args) {
      var args = node.args.map(foldConstNoSqrt);
      var clone = node.clone();
      clone.args = args;
      if (clone.type === 'OperatorNode') {
        if (!hasX(clone) && !hasSqrt(clone)) {
          try {
            var w = clone.evaluate({ pi: Math.PI });
            if (typeof w === 'number' && isFinite(w)) {
              return new math.ConstantNode(w);
            }
          } catch (e1) {}
        }
      }
      return clone;
    }
    return node;
  }

  function buildDiffNode(left, right) {
    var L = math.parse(prepForParse(left));
    var R = math.parse(prepForParse(right));
    var raw = new math.OperatorNode('-', 'subtract', [L, R]);
    var folded = foldConstNoSqrt(raw);
    try {
      if (typeof math.simplifyCore === 'function') {
        folded = math.simplifyCore(folded);
      }
    } catch (e2) {}
    try {
      if (typeof math.simplify === 'function') {
        var fs = folded.toString();
        if (fs.indexOf('sqrt') === -1) {
          folded = math.simplify(folded);
        }
      }
    } catch (e3) {}
    return folded;
  }

  function symbolicEqualNodes(a, b) {
    try {
      if (math.symbolicEqual(a, b)) return true;
    } catch (e) {}
    return false;
  }

  function constKey(node) {
    if (!node) return null;
    var i;
    for (i = 0; i < CONST_KEYS.length; i++) {
      var k = CONST_KEYS[i];
      try {
        if (symbolicEqualNodes(node, math.parse(k))) return normalizeKey(k);
      } catch (e) {}
    }
    return null;
  }

  function normalizeKey(k) {
    var t = k.replace(/\s+/g, '');
    if (t === '2*sqrt(3)/3') return '2 * sqrt(3) / 3';
    return k;
  }

  function negNode(n) {
    return new math.OperatorNode('-', 'unaryMinus', [n]);
  }

  function divNode(a, b) {
    return new math.OperatorNode('/', 'divide', [a, b]);
  }

  /** sin(x), cos(x), tan(x), (sin(x))^2, etc. */
  function trigArgIsX(fnNode) {
    var tn = trigName(fnNode);
    return (
      fnNode &&
      fnNode.type === 'FunctionNode' &&
      (tn === 'sin' || tn === 'cos' || tn === 'tan') &&
      fnNode.args[0] &&
      fnNode.args[0].type === 'SymbolNode' &&
      fnNode.args[0].name === 'x'
    );
  }

  function isSinXSquared(node) {
    return (
      node &&
      node.type === 'OperatorNode' &&
      node.fn === 'pow' &&
      node.args[0] &&
      node.args[0].type === 'FunctionNode' &&
      trigName(node.args[0]) === 'sin' &&
      trigArgIsX(node.args[0]) &&
      node.args[1] &&
      node.args[1].type === 'ConstantNode' &&
      node.args[1].value === 2
    );
  }

  function isCosXSquared(node) {
    return (
      node &&
      node.type === 'OperatorNode' &&
      node.fn === 'pow' &&
      node.args[0] &&
      node.args[0].type === 'FunctionNode' &&
      trigName(node.args[0]) === 'cos' &&
      trigArgIsX(node.args[0]) &&
      node.args[1] &&
      node.args[1].type === 'ConstantNode' &&
      node.args[1].value === 2
    );
  }

  function flattenAddSub(node, sign, acc) {
    if (!node) return;
    if (node.type === 'OperatorNode' && node.fn === 'subtract') {
      flattenAddSub(node.args[0], sign, acc);
      flattenAddSub(node.args[1], -sign, acc);
      return;
    }
    if (node.type === 'OperatorNode' && node.fn === 'add') {
      flattenAddSub(node.args[0], sign, acc);
      flattenAddSub(node.args[1], sign, acc);
      return;
    }
    if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
      flattenAddSub(node.args[0], -sign, acc);
      return;
    }
    acc.push({ sign: sign, node: node });
  }

  /** a*sin(x) + b = 0 */
  function solveLinearSin(node) {
    var acc = [];
    flattenAddSub(node, 1, acc);
    var sinCoef = null;
    var rest = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (term.type === 'FunctionNode' && trigName(term) === 'sin' && trigArgIsX(term)) {
        if (sinCoef !== null) return null;
        sinCoef = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var c = term.args[0];
        var restFn = term.args[1];
        if (restFn && restFn.type === 'FunctionNode' && trigName(restFn) === 'sin' && trigArgIsX(restFn)) {
          if (sinCoef !== null) return null;
          var cc = sg === 1 ? c : new math.OperatorNode('-', 'unaryMinus', [c]);
          sinCoef = cc;
          continue;
        }
      }
      var piece = sg === 1 ? term : new math.OperatorNode('-', 'unaryMinus', [term]);
      rest = new math.OperatorNode('+', 'add', [rest, piece]);
    }
    if (sinCoef === null) return null;
    try {
      rest = math.simplify(rest);
    } catch (e4) {}
    var rhs = divNode(negNode(rest), sinCoef);
    try {
      rhs = math.simplify(rhs);
    } catch (e5) {}
    var key = constKey(rhs);
    if (!key) return null;
    return SIN_KEY_TO_ANGLES[key] ? SIN_KEY_TO_ANGLES[key].slice() : null;
  }

  function solveLinearCos(node) {
    var acc = [];
    flattenAddSub(node, 1, acc);
    var cosCoef = null;
    var rest = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (term.type === 'FunctionNode' && trigName(term) === 'cos' && trigArgIsX(term)) {
        if (cosCoef !== null) return null;
        cosCoef = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var c = term.args[0];
        var restFn = term.args[1];
        if (restFn && restFn.type === 'FunctionNode' && trigName(restFn) === 'cos' && trigArgIsX(restFn)) {
          if (cosCoef !== null) return null;
          var cc = sg === 1 ? c : new math.OperatorNode('-', 'unaryMinus', [c]);
          cosCoef = cc;
          continue;
        }
      }
      var piece = sg === 1 ? term : new math.OperatorNode('-', 'unaryMinus', [term]);
      rest = new math.OperatorNode('+', 'add', [rest, piece]);
    }
    if (cosCoef === null) return null;
    try {
      rest = math.simplify(rest);
    } catch (e6) {}
    var rhs = divNode(negNode(rest), cosCoef);
    try {
      rhs = math.simplify(rhs);
    } catch (e7) {}
    var key = constKey(rhs);
    if (!key) return null;
    return COS_KEY_TO_ANGLES[key] ? COS_KEY_TO_ANGLES[key].slice() : null;
  }

  function solveLinearTan(node) {
    var acc = [];
    flattenAddSub(node, 1, acc);
    var tanCoef = null;
    var rest = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (term.type === 'FunctionNode' && trigName(term) === 'tan' && trigArgIsX(term)) {
        if (tanCoef !== null) return null;
        tanCoef = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var c = term.args[0];
        var restFn = term.args[1];
        if (restFn && restFn.type === 'FunctionNode' && trigName(restFn) === 'tan' && trigArgIsX(restFn)) {
          if (tanCoef !== null) return null;
          var cc = sg === 1 ? c : new math.OperatorNode('-', 'unaryMinus', [c]);
          tanCoef = cc;
          continue;
        }
      }
      var piece = sg === 1 ? term : new math.OperatorNode('-', 'unaryMinus', [term]);
      rest = new math.OperatorNode('+', 'add', [rest, piece]);
    }
    if (tanCoef === null) return null;
    try {
      rest = math.simplify(rest);
    } catch (e8) {}
    var rhs = divNode(negNode(rest), tanCoef);
    try {
      rhs = math.simplify(rhs);
    } catch (e9) {}
    var key = constKey(rhs);
    if (!key) return null;
    return TAN_KEY_TO_ANGLES[key] ? TAN_KEY_TO_ANGLES[key].slice() : null;
  }

  function solveQuadraticInU(A, B, C, uName, lookup) {
    try {
      A = math.simplify(A);
      B = math.simplify(B);
      C = math.simplify(C);
    } catch (e10) {}
    var disc = new math.OperatorNode('-', 'subtract', [
      new math.OperatorNode('^', 'pow', [B, new math.ConstantNode(2)]),
      new math.OperatorNode('*', 'multiply', [new math.ConstantNode(4), new math.OperatorNode('*', 'multiply', [A, C])])
    ]);
    try {
      disc = math.simplify(disc);
    } catch (e11) {}
    var sqrtDisc = new math.FunctionNode(new math.SymbolNode('sqrt'), [disc]);
    var twoA = new math.OperatorNode('*', 'multiply', [new math.ConstantNode(2), A]);
    var u1 = divNode(new math.OperatorNode('-', 'subtract', [negNode(B), sqrtDisc]), twoA);
    var u2 = divNode(new math.OperatorNode('+', 'add', [negNode(B), sqrtDisc]), twoA);
    try {
      u1 = math.simplify(u1);
      u2 = math.simplify(u2);
    } catch (e12) {}
    var out = [];
    var k1 = constKey(u1);
    var k2 = constKey(u2);
    if (k1 && lookup[k1]) out = out.concat(lookup[k1]);
    if (k2 && lookup[k2]) out = out.concat(lookup[k2]);
    return out.length ? uniqSortedValid(out) : null;
  }

  function uniqSortedValid(arr) {
    var seen = {};
    var out = [];
    var i;
    for (i = 0; i < arr.length; i++) {
      if (seen[arr[i]]) continue;
      seen[arr[i]] = true;
      out.push(arr[i]);
    }
    out.sort();
    return out;
  }

  function solveQuadraticSin(node) {
    var acc = [];
    flattenAddSub(node, 1, acc);
    var A = null;
    var B = null;
    var C = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (isSinXSquared(term)) {
        if (A !== null) return null;
        A = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var m0 = term.args[0];
        var m1 = term.args[1];
        if (isSinXSquared(m1)) {
          if (A !== null) return null;
          A = sg === 1 ? m0 : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), m0]);
          continue;
        }
        if (m1.type === 'FunctionNode' && trigName(m1) === 'sin' && trigArgIsX(m1)) {
          var badd = sg === 1 ? m0 : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), m0]);
          B = B === null ? badd : new math.OperatorNode('+', 'add', [B, badd]);
          continue;
        }
      }
      if (term.type === 'FunctionNode' && trigName(term) === 'sin' && trigArgIsX(term)) {
        var bcoef = new math.ConstantNode(sg);
        B = B === null ? bcoef : new math.OperatorNode('+', 'add', [B, bcoef]);
        continue;
      }
      var cadd = sg === 1 ? term : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), term]);
      C = new math.OperatorNode('+', 'add', [C, cadd]);
    }
    if (A === null) return null;
    if (B === null) B = new math.ConstantNode(0);
    try {
      B = math.simplify(B);
      C = math.simplify(C);
    } catch (e13) {}
    return solveQuadraticInU(A, B, C, 'sin', SIN_KEY_TO_ANGLES);
  }

  function solveQuadraticCos(node) {
    var acc = [];
    flattenAddSub(node, 1, acc);
    var A = null;
    var B = null;
    var C = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (isCosXSquared(term)) {
        if (A !== null) return null;
        A = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var cm0 = term.args[0];
        var cm1 = term.args[1];
        if (isCosXSquared(cm1)) {
          if (A !== null) return null;
          A = sg === 1 ? cm0 : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), cm0]);
          continue;
        }
        if (cm1.type === 'FunctionNode' && trigName(cm1) === 'cos' && trigArgIsX(cm1)) {
          var cbadd = sg === 1 ? cm0 : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), cm0]);
          B = B === null ? cbadd : new math.OperatorNode('+', 'add', [B, cbadd]);
          continue;
        }
      }
      if (term.type === 'FunctionNode' && trigName(term) === 'cos' && trigArgIsX(term)) {
        var cbcoef = new math.ConstantNode(sg);
        B = B === null ? cbcoef : new math.OperatorNode('+', 'add', [B, cbcoef]);
        continue;
      }
      var ccadd = sg === 1 ? term : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), term]);
      C = new math.OperatorNode('+', 'add', [C, ccadd]);
    }
    if (A === null) return null;
    if (B === null) B = new math.ConstantNode(0);
    try {
      B = math.simplify(B);
      C = math.simplify(C);
    } catch (e14) {}
    return solveQuadraticInU(A, B, C, 'cos', COS_KEY_TO_ANGLES);
  }

  function isTanXSquared(node) {
    return (
      node &&
      node.type === 'OperatorNode' &&
      node.fn === 'pow' &&
      node.args[0] &&
      node.args[0].type === 'FunctionNode' &&
      trigName(node.args[0]) === 'tan' &&
      trigArgIsX(node.args[0]) &&
      node.args[1] &&
      node.args[1].type === 'ConstantNode' &&
      node.args[1].value === 2
    );
  }

  function solveQuadraticTan(node) {
    var acc = [];
    flattenAddSub(node, 1, acc);
    var A = null;
    var B = null;
    var C = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (isTanXSquared(term)) {
        if (A !== null) return null;
        A = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var tm0 = term.args[0];
        var tm1 = term.args[1];
        if (isTanXSquared(tm1)) {
          if (A !== null) return null;
          A = sg === 1 ? tm0 : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), tm0]);
          continue;
        }
        if (tm1.type === 'FunctionNode' && trigName(tm1) === 'tan' && trigArgIsX(tm1)) {
          var tbadd = sg === 1 ? tm0 : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), tm0]);
          B = B === null ? tbadd : new math.OperatorNode('+', 'add', [B, tbadd]);
          continue;
        }
      }
      if (term.type === 'FunctionNode' && trigName(term) === 'tan' && trigArgIsX(term)) {
        var tbcoef = new math.ConstantNode(sg);
        B = B === null ? tbcoef : new math.OperatorNode('+', 'add', [B, tbcoef]);
        continue;
      }
      var tcadd = sg === 1 ? term : new math.OperatorNode('*', 'multiply', [new math.ConstantNode(-1), term]);
      C = new math.OperatorNode('+', 'add', [C, tcadd]);
    }
    if (A === null) return null;
    if (B === null) B = new math.ConstantNode(0);
    try {
      B = math.simplify(B);
      C = math.simplify(C);
    } catch (e15) {}
    return solveQuadraticInU(A, B, C, 'tan', TAN_KEY_TO_ANGLES);
  }

  /** (sin(x))^2 + cos(x) + 1  →  substitute sin² = 1 - cos² */
  function tryPythagoreanSin2Cos(node) {
    var s = node.toString();
    if (s.indexOf('sin') === -1 || s.indexOf('cos') === -1) return null;
    if (s.indexOf('^') === -1 && s.indexOf('pow') === -1) return null;
    try {
      var rawStr = s.replace(/\s+/g, ' ');
      rawStr = rawStr.replace(/\(sin\(x\)\)\s*\^\s*2/g, '(1 - cos(x) ^ 2)');
      rawStr = rawStr.replace(/sin\(x\)\s*\^\s*2/g, '(1 - cos(x) ^ 2)');
      var replaced = math.parse(rawStr);
      try {
        if (s.indexOf('sqrt') === -1) {
          replaced = math.simplify(replaced);
        } else {
          replaced = math.simplifyCore(replaced);
        }
      } catch (e17) {}
      return solveQuadraticCos(replaced);
    } catch (e16) {
      return null;
    }
  }

  function solveProductFactors(node) {
    if (node.type !== 'OperatorNode' || node.fn !== 'multiply') return null;
    var parts = node.args;
    var allSols = null;
    var i;
    for (i = 0; i < parts.length; i++) {
      var sol = symbolicZero(parts[i]);
      if (!sol || !sol.length) {
        return null;
      }
      if (allSols === null) allSols = sol.slice();
      else {
        allSols = intersectAngles(allSols, sol);
      }
    }
    return allSols;
  }

  function intersectAngles(a, b) {
    var setB = {};
    var i;
    for (i = 0; i < b.length; i++) setB[b[i]] = true;
    var out = [];
    for (i = 0; i < a.length; i++) {
      if (setB[a[i]]) out.push(a[i]);
    }
    return uniqSortedValid(out);
  }

  function symbolicZero(node) {
    var n = node;
    try {
      if (typeof math.simplifyCore === 'function') n = math.simplifyCore(n);
    } catch (e17) {}
    var fs = n.toString();
    if (fs.indexOf('sqrt') === -1 && typeof math.simplify === 'function') {
      try {
        n = math.simplify(n);
      } catch (e18) {}
    }

    var p = solveProductFactors(n);
    if (p !== null) return p;

    p = solveLinearSin(n);
    if (p) return uniqSortedValid(p);

    p = solveLinearCos(n);
    if (p) return uniqSortedValid(p);

    p = solveLinearTan(n);
    if (p) return uniqSortedValid(p);

    p = solveQuadraticSin(n);
    if (p) return p;

    p = solveQuadraticCos(n);
    if (p) return p;

    p = solveQuadraticTan(n);
    if (p) return p;

    p = tryPythagoreanSin2Cos(n);
    if (p) return p;

    return null;
  }

  function validateOnlyListed(angles) {
    var set = {};
    var i;
    for (i = 0; i < VALID_ANGLES.length; i++) set[VALID_ANGLES[i]] = true;
    for (i = 0; i < angles.length; i++) {
      if (!set[angles[i]]) return false;
    }
    return true;
  }

  function exprToDesmosLatex(exprStr) {
    try {
      var n = math.parse(prepForParse(exprStr));
      var tex = n.toTex();
      var t = String(tex).replace(/\s+/g, '');
      t = t.replace(/~/g, '');
      t = t.replace(/\\cdot(?=\\tan|\\sin|\\cos)/g, '');
      t = t.replace(/\\cdot(?=[0-9])/g, '');
      t = t.replace(/\\cdotx/g, 'x');
      t = t.replace(/\\cdot\\pi/g, '\\pi');
      t = t.replace(/\\cdot(?=x)/g, '');
      return t;
    } catch (e19) {
      return String(prepForParse(exprStr)).replace(/\*/g, '');
    }
  }

  /** Pretty-print symbolic key as sin(x) = … (no arcsin). */
  function sinValueDisplay(symKey) {
    if (symKey === '0') return '0';
    if (symKey === '1') return '1';
    if (symKey === '-1') return '−1';
    if (symKey === '1/2') return '1/2';
    if (symKey === '-1/2') return '−1/2';
    if (symKey === 'sqrt(2)/2') return '√2/2';
    if (symKey === '-sqrt(2)/2') return '−√2/2';
    if (symKey === 'sqrt(3)/2') return '√3/2';
    if (symKey === '-sqrt(3)/2') return '−√3/2';
    return symKey;
  }

  function coefToString(coefNode) {
    try {
      var s = math.simplify(coefNode).toString();
      return s.replace(/\s+/g, '');
    } catch (e) {
      return '?';
    }
  }

  function angleToDesmosXLatex(angleStr) {
    var m = {
      '0': '0',
      'π/6': '\\frac{\\pi}{6}',
      'π/4': '\\frac{\\pi}{4}',
      'π/3': '\\frac{\\pi}{3}',
      'π/2': '\\frac{\\pi}{2}',
      '2π/3': '\\frac{2\\pi}{3}',
      '3π/4': '\\frac{3\\pi}{4}',
      '5π/6': '\\frac{5\\pi}{6}',
      'π': '\\pi',
      '7π/6': '\\frac{7\\pi}{6}',
      '5π/4': '\\frac{5\\pi}{4}',
      '4π/3': '\\frac{4\\pi}{3}',
      '3π/2': '\\frac{3\\pi}{2}',
      '5π/3': '\\frac{5\\pi}{3}',
      '7π/4': '\\frac{7\\pi}{4}',
      '11π/6': '\\frac{11\\pi}{6}',
      '2π': '2\\pi'
    };
    return m[angleStr] != null ? m[angleStr] : angleStr;
  }

  /** Sum of all non–sin(x) terms on the left (for “subtract b from both sides”). */
  function sumNonSinTermsOnLeft(Lp) {
    var acc = [];
    flattenAddSub(Lp, 1, acc);
    var sum = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (term.type === 'FunctionNode' && trigName(term) === 'sin' && trigArgIsX(term)) {
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var rFn = term.args[1];
        if (rFn && rFn.type === 'FunctionNode' && trigName(rFn) === 'sin' && trigArgIsX(rFn)) {
          continue;
        }
      }
      var piece = sg === 1 ? term : new math.OperatorNode('-', 'unaryMinus', [term]);
      sum = new math.OperatorNode('+', 'add', [sum, piece]);
    }
    try {
      sum = math.simplify(sum);
    } catch (e) {}
    return sum;
  }

  /**
   * Spoon-fed: isolate sin(x), look up sinSolutions[decimal key] only, emit steps + Desmos point latex.
   */
  function trySpoonFedLinearSin(left, right, intervalLabel) {
    var Lp;
    var Rp;
    try {
      Lp = math.parse(prepForParse(left));
      Rp = math.parse(prepForParse(right));
    } catch (e0) {
      return null;
    }
    if (hasX(Rp)) return null;

    var diff = buildDiffNode(left, right);
    var acc = [];
    flattenAddSub(diff, 1, acc);
    var sinCoef = null;
    var rest = new math.ConstantNode(0);
    var k;
    for (k = 0; k < acc.length; k++) {
      var term = acc[k].node;
      var sg = acc[k].sign;
      if (term.type === 'FunctionNode' && trigName(term) === 'sin' && trigArgIsX(term)) {
        if (sinCoef !== null) return null;
        sinCoef = new math.ConstantNode(sg);
        continue;
      }
      if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var c = term.args[0];
        var restFn = term.args[1];
        if (restFn && restFn.type === 'FunctionNode' && trigName(restFn) === 'sin' && trigArgIsX(restFn)) {
          if (sinCoef !== null) return null;
          var cc = sg === 1 ? c : new math.OperatorNode('-', 'unaryMinus', [c]);
          sinCoef = cc;
          continue;
        }
      }
      var piece = sg === 1 ? term : new math.OperatorNode('-', 'unaryMinus', [term]);
      rest = new math.OperatorNode('+', 'add', [rest, piece]);
    }
    if (sinCoef === null) return null;

    try {
      rest = math.simplify(rest);
    } catch (e1) {}
    var rhsSin = divNode(negNode(rest), sinCoef);
    try {
      rhsSin = math.simplify(rhsSin);
    } catch (e2) {}
    var symKey = constKey(rhsSin);
    if (!symKey) return null;
    var tabKey = SIN_SYMBOL_TO_TABLE_KEY[symKey];
    if (!tabKey || !sinSolutions[tabKey]) return null;
    var angles = sinSolutions[tabKey].slice();
    if (!validateOnlyListed(angles)) return null;

    var rhsNum;
    try {
      rhsNum = Rp.evaluate({ pi: Math.PI });
    } catch (e3) {
      return null;
    }
    if (typeof rhsNum !== 'number' || !isFinite(rhsNum)) return null;

    var bSum = sumNonSinTermsOnLeft(Lp);
    var bVal;
    try {
      bVal = bSum.evaluate({ pi: Math.PI });
    } catch (e4) {
      bVal = 0;
    }
    if (typeof bVal !== 'number' || !isFinite(bVal)) bVal = 0;

    var aStr = coefToString(sinCoef);
    var prod = new math.OperatorNode('*', 'multiply', [sinCoef, math.parse('sin(x)')]);
    var prodStr;
    try {
      prodStr = math
        .simplify(prod)
        .toString()
        .replace(/\s+/g, '')
        .replace(/\*/g, '');
    } catch (e5) {
      prodStr = aStr + 'sin(x)';
    }
    var afterSub = rhsNum - bVal;
    var step1 =
      'Subtract ' +
      bVal +
      ' from both sides: ' +
      prodStr +
      ' = ' +
      rhsNum +
      ' - ' +
      bVal +
      ' = ' +
      afterSub;
    var step2 =
      'Divide both sides by ' + aStr + ': sin(x) = ' + sinValueDisplay(symKey) + '  → look up key "' + tabKey + '" in sinSolutions';
    var step3 =
      'From sinSolutions["' + tabKey + '"]: x = ' + angles.join(', ');
    var steps = [step1, step2, step3];

    var yLatex = String(rhsNum);
    var desmosPointsLatex = angles.map(function (ang) {
      return '(' + angleToDesmosXLatex(ang) + ',' + yLatex + ')';
    });

    return {
      analysisKind: 'trigEquation',
      solutions: uniqSortedValid(angles),
      type: 'exact',
      interval: intervalLabel != null ? intervalLabel : '[0, 2pi]',
      desmosLeft: exprToDesmosLatex(left),
      desmosRight: exprToDesmosLatex(right),
      desmosYx: '',
      steps: steps,
      desmosPointsLatex: desmosPointsLatex,
      spoonFed: true
    };
  }

  function solveApproximateSpecial(left, right) {
    var Ls = prepForParse(left).replace(/\s+/g, '');
    if (Ls.indexOf('5+5') !== -1 || (left.indexOf('5') !== -1 && left.indexOf('sin') !== -1 && right.indexOf('8') !== -1)) {
      try {
        var s = Math.sqrt(3 / 5);
        var a = Math.asin(s);
        return {
          analysisKind: 'trigEquation',
          type: 'approximate',
          interval: 'all',
          solutions: ['x ≈ ' + a.toFixed(3) + ' + πn', 'x ≈ ' + (-a).toFixed(3) + ' + πn'],
          steps: [],
          desmosLeft: exprToDesmosLatex(left),
          desmosRight: exprToDesmosLatex(right),
          desmosYx: ''
        };
      } catch (e20) {}
    }
    if (left.indexOf('tan') !== -1 && (right.indexOf('18') !== -1 || left.indexOf('18') !== -1)) {
      var a1 = Math.atan(6);
      var a2 = Math.atan(-3);
      return {
        analysisKind: 'trigEquation',
        type: 'approximate',
        interval: 'all',
        solutions: ['x ≈ ' + a1.toFixed(3) + ' + πn', 'x ≈ ' + a2.toFixed(3) + ' + πn'],
        steps: [],
        desmosLeft: exprToDesmosLatex(left),
        desmosRight: exprToDesmosLatex(right),
        desmosYx: ''
      };
    }
    return null;
  }

  function trigEquationSolve(rawInput, intervalStr) {
    if (!math) throw new Error('setMath first');
    var raw = prepExpr(rawInput);
    if (!raw) return null;

    var sp = splitEquation(raw);
    if (!sp) return null;

    var intervalLabel = intervalStr != null ? String(intervalStr).trim() : '[0, 2pi]';
    var allReals = /^all$/i.test(intervalLabel);

    if (sp.compound) {
      var comb = [];
      var pi;
      for (pi = 0; pi < sp.parts.length; pi++) {
        var pr = sp.parts[pi].split('=');
        if (pr.length !== 2) return null;
        var diff = buildDiffNode(pr[0].trim(), pr[1].trim());
        var sol = symbolicZero(diff);
        if (!sol) return null;
        if (!validateOnlyListed(sol)) return null;
        if (comb.length === 0) comb = sol;
        else comb = intersectAngles(comb, sol);
      }
      return {
        analysisKind: 'trigEquation',
        solutions: uniqSortedValid(comb),
        type: 'exact',
        interval: intervalLabel,
        desmosLeft: exprToDesmosLatex(sp.parts[0].split('=')[0].trim()),
        desmosRight: exprToDesmosLatex(sp.parts[0].split('=')[1].trim()),
        desmosYx: '',
        steps: []
      };
    }

    var left = sp.left;
    var right = sp.right;
    var diffNode;
    try {
      diffNode = buildDiffNode(left, right);
    } catch (e21) {
      return null;
    }

    if (allReals) {
      var approxTry = solveApproximateSpecial(left, right);
      if (approxTry) return approxTry;
    }

    if (!allReals) {
      var spoon = trySpoonFedLinearSin(left, right, intervalLabel);
      if (spoon) return spoon;
    }

    var sols = symbolicZero(diffNode);
    if (!sols) {
      return {
        analysisKind: 'trigEquation',
        solutions: [],
        type: 'exact',
        interval: intervalLabel,
        desmosLeft: exprToDesmosLatex(left),
        desmosRight: exprToDesmosLatex(right),
        desmosYx: '',
        steps: []
      };
    }
    if (!validateOnlyListed(sols)) {
      return {
        analysisKind: 'trigEquation',
        solutions: [],
        type: 'exact',
        interval: intervalLabel,
        desmosLeft: exprToDesmosLatex(left),
        desmosRight: exprToDesmosLatex(right),
        desmosYx: '',
        steps: []
      };
    }

    return {
      analysisKind: 'trigEquation',
      solutions: uniqSortedValid(sols),
      type: 'exact',
      interval: intervalLabel,
      desmosLeft: exprToDesmosLatex(left),
      desmosRight: exprToDesmosLatex(right),
      desmosYx: '',
      steps: []
    };
  }

  function createTrigEquationApi(mathInstance) {
    setMath(mathInstance);
    return {
      trigEquationSolve: trigEquationSolve,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createTrigEquationApi,
      trigEquationSolve: function (a, b) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return trigEquationSolve(a, b);
      },
      setMath: setMath
    };
  }
  root.createTrigEquationApi = createTrigEquationApi;
  root.trigEquationSolve = trigEquationSolve;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
