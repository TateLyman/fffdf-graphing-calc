/**
 * Inverse of f(x) = A·sin/cos/tan(Bx + C) + D on a domain restriction.
 * Domain of f⁻¹ = range of f on the restriction; range of f⁻¹ = restriction interval.
 */
(function (root) {
  var math = null;

  function setMath(m) {
    math = m;
  }

  function prepExpr(s) {
    return String(s)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function prepParse(s) {
    s = prepExpr(s);
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(-?\d+)\s*(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    return s;
  }

  /**
   * D must be outside sin: f = A·sin(x) + D means "sin(x)" then "-" then constant.
   * 2sin(x)-5 → 2*sin(x)-5  (D = -5, arcsin((x+5)/2)).
   * 2sin(x-5) parses as phase shift sin(x-5) (D = 0), which is a different function — inverse arcsin(x/2)+5.
   * This rewrites unambiguous vertical-shift strings so D is never folded into the sin argument.
   */
  function canonicalExprForVerticalShift(pre) {
    var s = String(pre).replace(/\s+/g, ' ').trim();
    var m = /^(-?\d+(?:\.\d+)?)\s*\*\s*(sin|cos|tan)\s*\(\s*x\s*\)\s*([+-])\s*(\d+(?:\.\d+)?)\s*$/i.exec(s);
    if (m) {
      var A = parseFloat(m[1]);
      var fam = m[2].toLowerCase();
      var k = parseFloat(m[4]);
      var D = m[3] === '+' ? k : -k;
      return A + '*' + fam + '(x)+(' + D + ')';
    }
    m = /^-\s*(sin|cos|tan)\s*\(\s*x\s*\)\s*([+-])\s*(\d+(?:\.\d+)?)\s*$/i.exec(s);
    if (m) {
      var D2 = m[2] === '+' ? parseFloat(m[3]) : -parseFloat(m[3]);
      return '-1*' + m[1].toLowerCase() + '(x)+(' + D2 + ')';
    }
    m = /^(sin|cos|tan)\s*\(\s*x\s*\)\s*([+-])\s*(\d+(?:\.\d+)?)\s*$/i.exec(s);
    if (m) {
      var D3 = m[2] === '+' ? parseFloat(m[3]) : -parseFloat(m[3]);
      return '1*' + m[1].toLowerCase() + '(x)+(' + D3 + ')';
    }
    return null;
  }

  /**
   * Worksheet typo: "2sin(x-5)" meant 2·sin(x) − 5 (D outside sin), not phase sin(x−5).
   * Only for A*trig(x−K) as the whole expression, with K > π so small phase shifts like sin(x−1) stay valid.
   */
  function recoverVerticalShiftTypo(pre) {
    var s = String(pre).replace(/\s+/g, '');
    var m = /^(-?\d+)\*(sin|cos|tan)\(x-(\d+(?:\.\d+)?)\)$/i.exec(s);
    if (!m) return null;
    var k = parseFloat(m[3]);
    if (!(k > Math.PI)) return null;
    var A = parseFloat(m[1]);
    var fam = m[2].toLowerCase();
    return A + '*' + fam + '(x)+(-' + k + ')';
  }

  function nodesEqual(a, b) {
    return math.simplify(new math.OperatorNode('-', 'subtract', [a, b])).toString() === '0';
  }

  function containsFunc(node, names) {
    if (!node) return false;
    if (node.type === 'FunctionNode' && names.indexOf(node.name) !== -1) return true;
    if (node.args) {
      for (var i = 0; i < node.args.length; i++) {
        if (containsFunc(node.args[i], names)) return true;
      }
    }
    return false;
  }

  function findTrigCall(node, names) {
    node = math.simplify(node);
    if (node.type === 'FunctionNode' && names.indexOf(node.name) !== -1) return node;
    if (node.args) {
      for (var i = 0; i < node.args.length; i++) {
        var f = findTrigCall(node.args[i], names);
        if (f) return f;
      }
    }
    return null;
  }

  function flattenSignedTerms(n) {
    var out = [];
    function walk(node, sign) {
      node = math.simplify(node);
      if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
        walk(node.args[0], -sign);
      } else if (node.type === 'OperatorNode' && node.fn === 'add') {
        for (var i = 0; i < node.args.length; i++) walk(node.args[i], sign);
      } else if (node.type === 'OperatorNode' && node.fn === 'subtract') {
        walk(node.args[0], sign);
        walk(node.args[1], -sign);
      } else {
        out.push({ sign: sign, node: node });
      }
    }
    walk(n, 1);
    return out;
  }

  function extractCoeffFromTrigTerm(term, trigCall) {
    term = math.simplify(term);
    if (nodesEqual(term, trigCall)) return 1;
    if (term.type === 'OperatorNode' && term.fn === 'unaryMinus' && nodesEqual(term.args[0], trigCall)) {
      return -1;
    }
    if (term.type === 'OperatorNode' && term.fn === 'multiply') {
      if (nodesEqual(term.args[0], trigCall)) return term.args[1].evaluate({ pi: Math.PI });
      if (nodesEqual(term.args[1], trigCall)) return term.args[0].evaluate({ pi: Math.PI });
    }
    return null;
  }

  function getLinearBC(innerNode) {
    innerNode = math.simplify(innerNode);
    var Bnode = math.simplify(math.derivative(innerNode, 'x'));
    if (Bnode.toString().indexOf('x') !== -1) return null;
    var B = Bnode.evaluate({ pi: Math.PI });
    if (!isFinite(B) || Math.abs(B) < 1e-14) return null;
    var xNode = new math.SymbolNode('x');
    var Bx = new math.OperatorNode('*', 'multiply', [Bnode, xNode]);
    var diff = new math.OperatorNode('-', 'subtract', [innerNode, Bx]);
    var Cnode = math.simplify(diff);
    if (Cnode.toString().indexOf('x') !== -1) return null;
    var C = Cnode.evaluate({ pi: Math.PI });
    return { B: B, C: C };
  }

  function extractAD(full, trigCall) {
    var name = trigCall.name;
    var terms = flattenSignedTerms(full);
    var trigTerms = [];
    var plain = [];
    var i;
    for (i = 0; i < terms.length; i++) {
      if (containsFunc(terms[i].node, [name])) trigTerms.push(terms[i]);
      else plain.push(terms[i]);
    }
    if (trigTerms.length !== 1) return null;
    var tt = trigTerms[0];
    var A = extractCoeffFromTrigTerm(tt.node, trigCall);
    if (A == null || !isFinite(A) || Math.abs(A) < 1e-14) return null;
    A = tt.sign * A;
    var Dnode;
    if (plain.length === 0) {
      Dnode = math.parse('0');
    } else if (plain.length === 1) {
      Dnode = math.simplify(plain[0].node);
      if (plain[0].sign < 0) {
        Dnode = math.simplify(new math.OperatorNode('-', 'unaryMinus', [Dnode]));
      }
    } else {
      var parts = [];
      for (i = 0; i < plain.length; i++) {
        var p = plain[i].node;
        if (plain[i].sign < 0) {
          p = math.simplify(new math.OperatorNode('-', 'unaryMinus', [p]));
        }
        parts.push(p);
      }
      Dnode = math.simplify(parts.reduce(function (a, b) {
        return new math.OperatorNode('+', 'add', [a, b]);
      }));
    }
    if (Dnode.toString().indexOf('x') !== -1) return null;
    var D = Dnode.evaluate({ pi: Math.PI });
    return { A: A, D: D };
  }

  /**
   * Chained inequality: a < x < b or a <= x <= b (also ≤).
   * openLeft true iff strict on the left bound; openRight true iff strict on the right.
   */
  function parseInequalityRestriction(s) {
    var t = prepExpr(s);
    t = t.replace(/\u2264/g, '<=').replace(/\u2265/g, '>=');
    var m = /^\s*(.+?)\s*(<=|<)\s*[xX]\s*(<=|<)\s*(.+)\s*$/.exec(t);
    if (!m) return null;
    var leftExpr = m[1].trim();
    var op1 = m[2];
    var op2 = m[3];
    var rightExpr = m[4].trim();
    var left = math.evaluate(leftExpr, { pi: Math.PI });
    var right = math.evaluate(rightExpr, { pi: Math.PI });
    if (typeof left !== 'number' || typeof right !== 'number' || !isFinite(left) || !isFinite(right)) {
      return null;
    }
    var openLeft = op1 === '<';
    var openRight = op2 === '<';
    return { left: left, right: right, openLeft: openLeft, openRight: openRight };
  }

  function parseInterval(str) {
    var s = prepExpr(str);
    var ineq = parseInequalityRestriction(s);
    if (ineq) return ineq;
    var m = /^\s*([\[(])\s*([^,]+)\s*,\s*([^,]+)\s*([\])])\s*$/.exec(s);
    if (!m) return null;
    var left = math.evaluate(prepExpr(m[2]), { pi: Math.PI });
    var right = math.evaluate(prepExpr(m[3]), { pi: Math.PI });
    if (typeof left !== 'number' || typeof right !== 'number' || !isFinite(left) || !isFinite(right)) {
      return null;
    }
    return { left: left, right: right, openLeft: m[1] === '(', openRight: m[4] === ')' };
  }

  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }

  function formatNumPlain(val) {
    var r = val;
    for (var den = 1; den <= 48; den++) {
      var num = Math.round(r * den);
      if (Math.abs(r - num / den) < 1e-9) {
        if (den === 1) return String(num);
        if (num < 0) return '-' + Math.abs(num) + '/' + den;
        return num + '/' + den;
      }
    }
    return String(Math.round(val * 10000) / 10000);
  }

  function formatPiInterval(lo, hi, openL, openR) {
    var ls = openL ? '(' : '[';
    var rs = openR ? ')' : ']';
    return ls + formatPiNum(lo) + ', ' + formatPiNum(hi) + rs;
  }

  function formatPiNum(val) {
    var r = val / Math.PI;
    if (Math.abs(val) < 1e-10) return '0';
    for (var den = 1; den <= 24; den++) {
      var num = Math.round(r * den);
      if (Math.abs(r - num / den) < 1e-9) {
        var g = gcd(Math.abs(num), den);
        num = num / g;
        den = den / g;
        if (den === 1) {
          if (num === 1) return 'π';
          if (num === -1) return '-π';
          return num + 'π';
        }
        if (num === 1) return 'π/' + den;
        if (num === -1) return '-π/' + den;
        return num + 'π/' + den;
      }
    }
    return formatNumPlain(val);
  }

  function endpointToTex(val) {
    if (Math.abs(val) < 1e-10) return '0';
    var r = val / Math.PI;
    if (Math.abs(r - 0.5) < 1e-9) return '\\frac{\\pi}{2}';
    if (Math.abs(r + 0.5) < 1e-9) return '-\\frac{\\pi}{2}';
    if (Math.abs(r - 1) < 1e-9) return '\\pi';
    if (Math.abs(r + 1) < 1e-9) return '-\\pi';
    if (Math.abs(r - 1 / 3) < 1e-9) return '\\frac{\\pi}{3}';
    if (Math.abs(r + 1 / 3) < 1e-9) return '-\\frac{\\pi}{3}';
    if (Math.abs(r - 2 / 3) < 1e-9) return '\\frac{2\\pi}{3}';
    return formatNumPlain(val);
  }

  function invExprToDesmosLatex(exprStr) {
    var s = prepExpr(exprStr);
    s = s.replace(/(^|[^A-Za-z])arcsin(?=\s*\()/gi, '$1asin');
    s = s.replace(/(^|[^A-Za-z])arccos(?=\s*\()/gi, '$1acos');
    s = s.replace(/(^|[^A-Za-z])arctan(?=\s*\()/gi, '$1atan');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(-?\d+)\s*(asin|acos|atan)\s*\(/gi, '$1*$2(');
    var n = math.parse(s);
    var tex = n.toTex();
    var t = String(tex).replace(/\s+/g, '');
    t = t.replace(/\\cdot/g, '');
    t = t.replace(/\\sin\^\{-1\}/g, '\\arcsin');
    t = t.replace(/\\cos\^\{-1\}/g, '\\arccos');
    t = t.replace(/\\tan\^\{-1\}/g, '\\arctan');
    t = t.replace(/\\mathrm\{arcsin\}/g, '\\arcsin');
    t = t.replace(/\\mathrm\{arccos\}/g, '\\arccos');
    t = t.replace(/\\mathrm\{arctan\}/g, '\\arctan');
    t = t.replace(/\\frac\{\\left\(([^)]+)\\right\)\}\{([^}]+)\}/g, '\\frac{$1}{$2}');
    return t;
  }

  function texToDesmos(tex) {
    var t = String(tex).replace(/\s+/g, '');
    t = t.replace(/~/g, '');
    t = t.replace(/\\cdot(?=\\tan|\\sin|\\cos)/g, '');
    t = t.replace(/\\cdot(?=[0-9])/g, '');
    t = t.replace(/\\cdotx/g, 'x');
    t = t.replace(/\\pix/g, '\\pi*x');
    t = t.replace(/\\cdot\\pi/g, '\\pi');
    t = t.replace(/\\cdot(?=x)/g, '');
    t = t.replace(/\\cdot\\left/g, '\\left');
    return t;
  }

  /**
   * x = A·trig(B·y + C) + D  →  subtract D, divide by A, apply inverse trig, subtract C, divide by B.
   * y = (arc*( (x - D) / A ) - C) / B   — never (x/A - D) or arcsin(x/A)+D.
   */
  function inverseStringToMatchTests(family, A, D, B, C) {
    var fn = family === 'sin' ? 'asin' : family === 'cos' ? 'acos' : 'atan';
    var argOfTrig = '((x - (' + D + ')) / (' + A + '))';
    var node = math.simplify(
      math.parse('(' + fn + '(' + argOfTrig + ') - (' + C + ')) / (' + B + ')')
    );
    var s = node.toString();
    s = s.replace(/\basin\b/g, 'arcsin');
    s = s.replace(/\bacos\b/g, 'arccos');
    s = s.replace(/\batan\b/g, 'arctan');
    s = s.replace(/\s+/g, ' ');
    s = s.replace(/ \+ -/g, ' - ');
    s = s.replace(/ - -/g, ' + ');
    return s.trim();
  }

  function prettyInverseFull(inv) {
    return 'y = ' + inv;
  }

  function trigFuncInverseAnalyze(rawExpr, restrictionStr) {
    if (!math) throw new Error('setMath first');
    if (!restrictionStr || !String(restrictionStr).trim()) return null;

    var interval = parseInterval(restrictionStr);
    if (!interval) return null;

    var pre = prepParse(rawExpr);
    if (!pre) return null;

    var canonical = canonicalExprForVerticalShift(pre);
    if (canonical) {
      pre = canonical;
    } else {
      var typo = recoverVerticalShiftTypo(pre);
      if (typo) pre = typo;
    }

    var n;
    try {
      n = math.simplify(math.parse(pre));
    } catch (e) {
      return null;
    }

    var NAMES = ['sin', 'cos', 'tan'];
    var trigCall = findTrigCall(n, NAMES);
    if (!trigCall || !trigCall.args || trigCall.args.length !== 1) return null;

    var family = trigCall.name;
    var inner = trigCall.args[0];
    var lin = getLinearBC(inner);
    if (!lin) return null;

    var ad = extractAD(n, trigCall);
    if (!ad) return null;

    var A = ad.A;
    var D = ad.D;
    var B = lin.B;
    var C = lin.C;

    // Domain of f⁻¹ = range of f. For sin/cos, sin and cos stay in [-1, 1], so
    // f hits A·(-1)+D and A·(1)+D; if A < 0 swap those two endpoints. Do not infer from plugging x-interval endpoints into the inverse formula.
    var domainInverse;
    if (family === 'tan') {
      domainInverse = '(-∞, ∞)';
    } else {
      var vAtSinNeg1 = A * (-1) + D;
      var vAtSin1 = A * (1) + D;
      var lo = vAtSinNeg1;
      var hi = vAtSin1;
      if (A < 0) {
        lo = vAtSin1;
        hi = vAtSinNeg1;
      }
      domainInverse = '[' + formatNumPlain(lo) + ', ' + formatNumPlain(hi) + ']';
    }

    var rangeInverse = formatPiInterval(interval.left, interval.right, interval.openLeft, interval.openRight);

    var inverse = inverseStringToMatchTests(family, A, D, B, C);
    var inverseFull = prettyInverseFull(inverse);

    var baseNode = math.parse(pre);
    var baseTex = texToDesmos(baseNode.toTex());
    var rest;
    if (!interval.openLeft && !interval.openRight) {
      rest =
        '\\left\\{' +
        endpointToTex(interval.left) +
        '\\le x\\le' +
        endpointToTex(interval.right) +
        '\\right\\}';
    } else {
      rest =
        '\\left\\{' +
        endpointToTex(interval.left) +
        (interval.openLeft ? '<' : '\\le') +
        'x' +
        (interval.openRight ? '<' : '\\le') +
        endpointToTex(interval.right) +
        '\\right\\}';
    }
    var desmosOriginal = baseTex + rest;

    var desmosInverse = invExprToDesmosLatex(inverse);
    var desmosYx = 'y=x';

    return {
      analysisKind: 'trigFuncInverse',
      inverse: inverse,
      inverseFull: inverseFull,
      domainInverse: domainInverse,
      rangeInverse: rangeInverse,
      desmosOriginal: desmosOriginal,
      desmosInverse: desmosInverse,
      desmosYx: desmosYx,
      desmos: desmosOriginal,
      period: '',
      phaseShift: '',
      verticalShift: '',
      amplitude: '',
      asymptotes: ''
    };
  }

  function createTrigFuncInverseApi(mathInstance) {
    setMath(mathInstance);
    return {
      trigFuncInverseAnalyze: trigFuncInverseAnalyze,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createTrigFuncInverseApi,
      trigFuncInverseAnalyze: function (e, r) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return trigFuncInverseAnalyze(e, r);
      },
      setMath: setMath
    };
  }
  root.createTrigFuncInverseApi = createTrigFuncInverseApi;
  root.trigFuncInverseAnalyze = trigFuncInverseAnalyze;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
