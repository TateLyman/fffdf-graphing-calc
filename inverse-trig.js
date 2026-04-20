/**
 * Inverse trig: A·asin/acos/atan(Bx+C)+D — domain, range, key points, Desmos LaTeX.
 * mathjs 12 — asin/acos/atan internally; arcsin/arccos/arctan in user input.
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

  function prepInverseParse(s) {
    s = prepExpr(s);
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    // sin^-1 / sin^(-1) (textbook inverse notation; digit before sin is OK)
    s = s.replace(/(^|[^A-Za-z])sin\s*\^\s*(?:\(\s*-?\s*1\s*\)|-1)\s*(?=\()/gi, '$1asin');
    s = s.replace(/(^|[^A-Za-z])cos\s*\^\s*(?:\(\s*-?\s*1\s*\)|-1)\s*(?=\()/gi, '$1acos');
    s = s.replace(/(^|[^A-Za-z])tan\s*\^\s*(?:\(\s*-?\s*1\s*\)|-1)\s*(?=\()/gi, '$1atan');
    s = s.replace(/(^|[^A-Za-z])arcsin(?=\s*\()/gi, '$1asin');
    s = s.replace(/(^|[^A-Za-z])arccos(?=\s*\()/gi, '$1acos');
    s = s.replace(/(^|[^A-Za-z])arctan(?=\s*\()/gi, '$1atan');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(-?\d+)\s*(asin|acos|atan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    return s;
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

  function countInv(node, names) {
    var c = 0;
    if (!node) return 0;
    if (node.type === 'FunctionNode' && names.indexOf(node.name) !== -1) c++;
    if (node.args) {
      for (var i = 0; i < node.args.length; i++) c += countInv(node.args[i], names);
    }
    return c;
  }

  function findInvCall(node, names) {
    node = math.simplify(node);
    if (node.type === 'FunctionNode' && names.indexOf(node.name) !== -1) return node;
    if (node.args) {
      for (var i = 0; i < node.args.length; i++) {
        var f = findInvCall(node.args[i], names);
        if (f) return f;
      }
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
    return { Bnode: Bnode, B: B, Cnode: Cnode, C: Cnode.evaluate({ pi: Math.PI }) };
  }

  function extractAFromTerm(term, invCall) {
    term = math.simplify(term);
    if (nodesEqual(term, invCall)) return 1;
    if (term.type === 'OperatorNode' && term.fn === 'unaryMinus' && nodesEqual(term.args[0], invCall)) {
      return -1;
    }
    if (term.type === 'OperatorNode' && term.fn === 'multiply') {
      if (nodesEqual(term.args[0], invCall)) return term.args[1].evaluate({ pi: Math.PI });
      if (nodesEqual(term.args[1], invCall)) return term.args[0].evaluate({ pi: Math.PI });
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

  var NAMES = ['asin', 'acos', 'atan'];

  function extractAD(full, invCall) {
    var name = invCall.name;
    var terms = flattenSignedTerms(full);
    var invTerms = [];
    var plain = [];
    var i;
    for (i = 0; i < terms.length; i++) {
      if (containsFunc(terms[i].node, [name])) invTerms.push(terms[i]);
      else plain.push(terms[i]);
    }
    if (invTerms.length !== 1) return null;
    var it = invTerms[0];
    var A = extractAFromTerm(it.node, invCall);
    if (A == null || !isFinite(A)) return null;
    A = it.sign * A;
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
    return { A: A, Dnode: Dnode, D: Dnode.evaluate({ pi: Math.PI }) };
  }

  function closestPiRational(val) {
    var r = val / Math.PI;
    if (Math.abs(r) < 1e-10) return '0';
    for (var den = 1; den <= 24; den++) {
      var num = Math.round(r * den);
      if (Math.abs(r - num / den) < 1e-9) {
        return formatFracPi(num, den);
      }
    }
    return String(Math.round(val * 10000) / 10000);
  }

  function formatFracPi(num, den) {
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

  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }

  function formatCoord(val) {
    var r = val;
    for (var den = 1; den <= 24; den++) {
      var num = Math.round(r * den);
      if (Math.abs(r - num / den) < 1e-9) {
        if (den === 1) return String(num);
        if (num < 0) return '-' + Math.abs(num) + '/' + den;
        return num + '/' + den;
      }
    }
    return String(Math.round(val * 10000) / 10000);
  }

  function formatInterval(low, high, openLow, openHigh) {
    var ls = openLow ? '(' : '[';
    var rs = openHigh ? ')' : ']';
    return ls + formatCoord(low) + ', ' + formatCoord(high) + rs;
  }

  function formatIntervalOpen(low, high) {
    return '(' + closestPiRational(low) + ', ' + closestPiRational(high) + ')';
  }

  function sortPair(a, b) {
    return a <= b ? [a, b] : [b, a];
  }

  function invTexToDesmos(tex) {
    var t = String(tex).replace(/\s+/g, '');
    t = t.replace(/\\cdot/g, '');
    t = t.replace(/\\sin\^\{-1\}/g, '\\arcsin');
    t = t.replace(/\\cos\^\{-1\}/g, '\\arccos');
    t = t.replace(/\\tan\^\{-1\}/g, '\\arctan');
    t = t.replace(/\\mathrm\{arcsin\}/g, '\\arcsin');
    t = t.replace(/\\mathrm\{arccos\}/g, '\\arccos');
    t = t.replace(/\\mathrm\{arctan\}/g, '\\arctan');
    return t;
  }

  function inverseTrigAnalyze(raw) {
    if (!math) throw new Error('setMath first');
    var pre = prepInverseParse(raw);
    if (!pre) return null;
    if (!/\b(asin|acos|atan)\s*\(/i.test(pre)) return null;

    var n;
    var desmos;
    try {
      var parsed = math.parse(pre);
      desmos = invTexToDesmos(parsed.toTex());
      n = math.simplify(parsed);
    } catch (e) {
      return null;
    }

    var total = countInv(n, NAMES);
    if (total !== 1) return null;

    var invCall = findInvCall(n, NAMES);
    if (!invCall || !invCall.args || invCall.args.length !== 1) return null;

    var family = invCall.name;
    var inner = invCall.args[0];
    var lin = getLinearBC(inner);
    if (!lin) return null;

    var ad = extractAD(n, invCall);
    if (!ad) return null;

    var A = ad.A;
    var D = ad.D;
    var B = lin.B;
    var C = lin.C;

    var domain;
    var rangeStr;
    var keyPoints = [];
    var horizontalAsymptotes = null;

    if (family === 'atan') {
      domain = '(-∞, ∞)';
      var lo = A * (-Math.PI / 2) + D;
      var hi = A * (Math.PI / 2) + D;
      var pair = sortPair(lo, hi);
      rangeStr = '(' + closestPiRational(pair[0]) + ', ' + closestPiRational(pair[1]) + ')';
      var xMid = -C / B;
      keyPoints.push(formatCoord(xMid) + ', ' + closestPiRational(A * 0 + D));
      var ay1 = A * (-Math.PI / 2) + D;
      var ay2 = A * (Math.PI / 2) + D;
      var a1 = Math.min(ay1, ay2);
      var a2 = Math.max(ay1, ay2);
      horizontalAsymptotes = ['y = ' + closestPiRational(a1), 'y = ' + closestPiRational(a2)];
    } else {
      var x1 = (-1 - C) / B;
      var x2 = (1 - C) / B;
      var xd = sortPair(x1, x2);
      domain = formatInterval(xd[0], xd[1], false, false);

      if (family === 'asin') {
        var yLo = A * (-Math.PI / 2) + D;
        var yHi = A * (Math.PI / 2) + D;
        var yp = sortPair(yLo, yHi);
        rangeStr = '[' + closestPiRational(yp[0]) + ', ' + closestPiRational(yp[1]) + ']';
        var us = [-1, 0, 1];
        for (var j = 0; j < us.length; j++) {
          var u = us[j];
          var xv = (u - C) / B;
          var yv = A * Math.asin(u) + D;
          keyPoints.push(formatCoord(xv) + ', ' + closestPiRational(yv));
        }
      } else {
        var yLoC = A * Math.PI + D;
        var yHiC = A * 0 + D;
        var ypc = sortPair(yLoC, yHiC);
        rangeStr = '[' + closestPiRational(ypc[0]) + ', ' + closestPiRational(ypc[1]) + ']';
        var usc = [-1, 0, 1];
        for (var k = 0; k < usc.length; k++) {
          var uc = usc[k];
          var xvc = (uc - C) / B;
          var yvc = A * Math.acos(uc) + D;
          keyPoints.push(formatCoord(xvc) + ', ' + closestPiRational(yvc));
        }
      }
    }

    return {
      analysisKind: 'inverse',
      desmos: desmos,
      domain: domain,
      range: rangeStr,
      keyPoints: keyPoints,
      horizontalAsymptotes: horizontalAsymptotes,
      period: '',
      phaseShift: '',
      verticalShift: '',
      amplitude: '',
      asymptotes: ''
    };
  }

  function createInverseTrigApi(mathInstance) {
    setMath(mathInstance);
    return {
      inverseTrigAnalyze: inverseTrigAnalyze,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createInverseTrigApi,
      inverseTrigAnalyze: function (s) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return inverseTrigAnalyze(s);
      },
      setMath: setMath
    };
  }
  root.createInverseTrigApi = createInverseTrigApi;
  root.inverseTrigAnalyze = inverseTrigAnalyze;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
