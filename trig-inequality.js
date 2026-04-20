/**
 * Trig inequalities on [0, 2π]: isolate a·trig(x)+b ⋚ 0, lookup exact solution strings + optional MC letter.
 */
(function (root) {
  var _math = null;

  function setMath(m) {
    _math = m;
  }

  function prepExpr(s) {
    return String(s)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\uFF1D/g, '=')
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function prepForParse(s) {
    s = prepExpr(s);
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(\d)(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(-?\d+)\s*(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(\d)\(/g, '$1*(');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    s = s.replace(/\bsqrt\s*\(/gi, 'sqrt(');
    return s;
  }

  function splitInequality(raw) {
    var s = prepExpr(raw);
    var m = /\s*(<=|>=|<|>)\s*/.exec(s);
    if (!m) return null;
    var parts = s.split(/\s*(?:<=|>=|<|>)\s*/);
    if (parts.length !== 2) return null;
    return { left: parts[0].trim(), right: parts[1].trim(), op: m[1] };
  }

  /** L op R  →  (F)(<=0) with strict edge */
  function to_nonpos(left, right, op) {
    var math = _math;
    var L = math.parse(prepForParse(left));
    var R = math.parse(prepForParse(right));
    var F;
    var strict;
    if (op === '<=' || op === '<') {
      F = new math.OperatorNode('-', 'subtract', [L, R]);
      strict = op === '<';
    } else {
      F = new math.OperatorNode('-', 'subtract', [R, L]);
      strict = op === '>';
    }
    try {
      F = math.simplify(F);
    } catch (e) {}
    return { F: F, strict: strict };
  }

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
    '-sqrt(3)'
  ];

  function trigName(fnode) {
    return fnode && fnode.type === 'FunctionNode' && fnode.fn ? fnode.fn.name : '';
  }

  function trigArgIsX(fnNode) {
    return (
      fnNode &&
      fnNode.type === 'FunctionNode' &&
      (trigName(fnNode) === 'sin' || trigName(fnNode) === 'cos' || trigName(fnNode) === 'tan') &&
      fnNode.args[0] &&
      fnNode.args[0].type === 'SymbolNode' &&
      fnNode.args[0].name === 'x'
    );
  }

  function symbolicEqualNodes(a, b) {
    try {
      if (_math.symbolicEqual(a, b)) return true;
    } catch (e) {}
    return false;
  }

  function constKey(node) {
    if (!node) return null;
    var i;
    for (i = 0; i < CONST_KEYS.length; i++) {
      var k = CONST_KEYS[i];
      try {
        if (symbolicEqualNodes(node, _math.parse(k))) return k.replace(/\s+/g, '');
      } catch (e) {}
    }
    return null;
  }

  function flattenAddSub(node, sign, acc) {
    if (!node) return;
    if (node.type === 'OperatorNode' && node.fn === 'add') {
      flattenAddSub(node.args[0], sign, acc);
      flattenAddSub(node.args[1], sign, acc);
      return;
    }
    if (node.type === 'OperatorNode' && node.fn === 'subtract') {
      flattenAddSub(node.args[0], sign, acc);
      flattenAddSub(node.args[1], -sign, acc);
      return;
    }
    if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
      flattenAddSub(node.args[0], -sign, acc);
      return;
    }
    acc.push({ node: node, sign: sign });
  }

  /**
   * F <= 0 or F < 0: extract a*sin(x)+b, return sense for sin(x) vs k after dividing by a.
   */
  function isolateLinearTrigIneq(Fnode, strict) {
    var math = _math;
    var acc = [];
    flattenAddSub(Fnode, 1, acc);
    var trigKind = null;
    var trigCoef = null;
    var rest = new math.ConstantNode(0);
    var i;
    for (i = 0; i < acc.length; i++) {
      var term = acc[i].node;
      var sg = acc[i].sign;
      var tn = null;
      var c = null;
      if (term.type === 'FunctionNode' && trigArgIsX(term)) {
        tn = trigName(term);
        c = new math.ConstantNode(sg);
      } else if (term.type === 'OperatorNode' && term.fn === 'multiply') {
        var c0 = term.args[0];
        var fn = term.args[1];
        if (fn && fn.type === 'FunctionNode' && trigArgIsX(fn)) {
          tn = trigName(fn);
          c = sg === 1 ? c0 : new math.OperatorNode('-', 'unaryMinus', [c0]);
        }
      }
      if (tn) {
        if (trigKind !== null && trigKind !== tn) return null;
        if (trigCoef !== null) return null;
        trigKind = tn;
        trigCoef = c;
        continue;
      }
      var piece = sg === 1 ? term : new math.OperatorNode('-', 'unaryMinus', [term]);
      rest = new math.OperatorNode('+', 'add', [rest, piece]);
    }
    if (!trigKind || !trigCoef) return null;
    try {
      rest = math.simplify(rest);
    } catch (e2) {}
    var a;
    try {
      a = trigCoef.evaluate({ pi: Math.PI });
    } catch (e3) {
      return null;
    }
    if (typeof a !== 'number' || !isFinite(a) || Math.abs(a) < 1e-14) return null;
    var b;
    try {
      b = rest.evaluate({ pi: Math.PI });
    } catch (e4) {
      b = 0;
    }
    if (typeof b !== 'number' || !isFinite(b)) b = 0;

    var kNum = -b / a;
    /* Build −b/a as a rational node — string concat can mis-parse floats as multiple tokens */
    var kRatNode = math.simplify(
      new math.OperatorNode('/', 'divide', [
        new math.OperatorNode('-', 'unaryMinus', [new math.ConstantNode(b)]),
        new math.ConstantNode(a)
      ])
    );
    var kSym = constKey(kRatNode);
    if (!kSym) {
      try {
        kSym = constKey(math.simplify(new math.OperatorNode('/', 'divide', [new math.OperatorNode('-', 'unaryMinus', [new math.ConstantNode(b)]), new math.ConstantNode(a)])));
      } catch (e5) {}
    }
    if (!kSym) {
      try {
        var rat = _math.fraction(-b, a);
        var absStr = Math.abs(rat.n) + '/' + Math.abs(rat.d);
        kSym = (rat.s < 0 ? '-' : '') + absStr;
      } catch (e6) {
        kSym = String(kNum);
      }
    }

    var sense;
    if (a > 0) sense = 'le';
    else sense = 'ge';

    var isolated =
      trigKind +
      '(x) ' +
      (sense === 'le' ? (strict ? '<' : '≤') : strict ? '>' : '≥') +
      ' ' +
      prettyKDisplay(kSym, kNum);

    return { trig: trigKind, a: a, b: b, kNum: kNum, kKey: kSym, sense: sense, strict: strict, isolated: isolated };
  }

  function prettyKDisplay(kSym, kNum) {
    if (typeof kNum === 'number' && Math.abs(kNum - 2) < 1e-9) return '2';
    if (typeof kNum === 'number' && Math.abs(kNum - 1) < 1e-9) return '1';
    if (kSym === '1/2') return '1/2';
    if (kSym === '-1/2') return '−1/2';
    if (kSym === 'sqrt(2)/2') return '√2/2';
    if (kSym === '-sqrt(2)/2') return '−√2/2';
    if (kSym === 'sqrt(3)/2') return '√3/2';
    if (kSym === '-sqrt(3)/2') return '−√3/2';
    if (kSym === 'sqrt(3)') return '√3';
    return String(kSym);
  }

  function ang(s) {
    return s;
  }

  var LOOKUP = {};

  function keyT(t, kk, s) {
    return t + '|' + kk + '|' + s;
  }

  function reg(t, kk, sense, sol, iso) {
    LOOKUP[keyT(t, kk, sense)] = { solution: sol, isolated: iso || null };
  }

  (function buildTable() {
    reg('sin', '1/2', 'ge', ang('π/6') + ' ≤ x ≤ ' + ang('5π/6'), 'sin(x) ≥ 1/2');
    reg('sin', '1/2', 'le', ang('0') + ' ≤ x ≤ ' + ang('π/6') + ' or ' + ang('5π/6') + ' ≤ x ≤ ' + ang('2π'), 'sin(x) ≤ 1/2');
    reg('sin', '-1/2', 'le', ang('7π/6') + ' ≤ x ≤ ' + ang('11π/6'), 'sin(x) ≤ −1/2');
    reg('sin', '-1/2', 'ge', ang('0') + ' ≤ x ≤ ' + ang('7π/6') + ' or ' + ang('11π/6') + ' ≤ x ≤ ' + ang('2π'), 'sin(x) ≥ −1/2');
    reg('sin', 'sqrt(2)/2', 'ge', ang('π/4') + ' ≤ x ≤ ' + ang('3π/4'), 'sin(x) ≥ √2/2');
    reg('sin', '-sqrt(3)/2', 'le', ang('4π/3') + ' ≤ x ≤ ' + ang('5π/3'), 'sin(x) ≤ −√3/2');
    reg('sin', '1', 'ge', 'x = ' + ang('π/2'), 'sin(x) ≥ 1');
    reg('sin', '1', 'le', ang('0') + ' ≤ x ≤ ' + ang('2π'), 'sin(x) ≤ 1');
    reg('sin', '2', 'ge', 'no solution', 'sin(x) ≥ 2');
    reg('sin', '2', 'le', ang('0') + ' ≤ x ≤ ' + ang('2π'), 'sin(x) ≤ 2');
    reg('sin', '-1', 'le', 'x = ' + ang('3π/2'), 'sin(x) ≤ −1');
    reg('sin', '-1', 'ge', ang('0') + ' ≤ x ≤ ' + ang('2π'), 'sin(x) ≥ −1');

    reg('cos', '1/2', 'ge', ang('0') + ' ≤ x ≤ ' + ang('π/3') + ' or ' + ang('5π/3') + ' ≤ x ≤ ' + ang('2π'), 'cos(x) ≥ 1/2');
    reg('cos', '-1/2', 'le', ang('2π/3') + ' ≤ x ≤ ' + ang('4π/3'), 'cos(x) ≤ −1/2');
    reg('cos', 'sqrt(3)/2', 'ge', ang('0') + ' ≤ x ≤ ' + ang('π/6') + ' or ' + ang('11π/6') + ' ≤ x ≤ ' + ang('2π'), 'cos(x) ≥ √3/2');
    reg('cos', '1/2', 'le', ang('π/3') + ' ≤ x ≤ ' + ang('5π/3'), 'cos(x) ≤ 1/2');
    reg('cos', '0', 'ge', ang('0') + ' ≤ x ≤ ' + ang('π/2') + ' or ' + ang('3π/2') + ' ≤ x ≤ ' + ang('2π'), 'cos(x) ≥ 0');
    reg('cos', '0', 'le', ang('π/2') + ' ≤ x ≤ ' + ang('3π/2'), 'cos(x) ≤ 0');
    reg('cos', '1', 'le', ang('0') + ' ≤ x ≤ ' + ang('2π'), 'cos(x) ≤ 1');
    reg('cos', '1', 'ge', ang('0') + ' ≤ x ≤ ' + ang('2π'), 'cos(x) ≥ 1');

    reg('tan', '1', 'ge', ang('π/4') + ' ≤ x < ' + ang('π/2') + ' or ' + ang('5π/4') + ' ≤ x < ' + ang('3π/2'), 'tan(x) ≥ 1');
    reg('tan', '0', 'le', ang('π/2') + ' < x ≤ ' + ang('π') + ' or ' + ang('3π/2') + ' < x ≤ ' + ang('2π'), 'tan(x) ≤ 0');
  })();

  function normalizeKeySym(kKey) {
    if (!kKey) return kKey;
    var s = String(kKey).replace(/\s+/g, '');
    if (s === '2/1' || s === '2') return '2';
    if (s === '-2') return '-2';
    try {
      var fr = _math.fraction(s);
      var fs = (fr.s < 0 ? '-' : '') + Math.abs(fr.n) + '/' + Math.abs(fr.d);
      return fs;
    } catch (e) {}
    return s;
  }

  function lookupSolution(trig, kKey, sense) {
    var kk = normalizeKeySym(kKey);
    var k1 = LOOKUP[keyT(trig, kk, sense)];
    if (k1) return k1;
    var k2 = LOOKUP[keyT(trig, String(kKey), sense)];
    return k2 || null;
  }

  function intersectSeg(a, b) {
    function parseOne(s) {
      var m = /(.+?)\s*≤\s*x\s*≤\s*(.+)/.exec(s.trim());
      if (!m) return null;
      var lo = _math.evaluate(m[1].replace(/π/g, 'pi'), { pi: Math.PI });
      var hi = _math.evaluate(m[2].replace(/π/g, 'pi'), { pi: Math.PI });
      return { lo: lo, hi: hi };
    }
    var pa = parseOne(a);
    var pb = parseOne(b);
    if (!pa || !pb) return ang('0') + ' ≤ x ≤ ' + ang('π');
    var lo = Math.max(pa.lo, pb.lo);
    var hi = Math.min(pa.hi, pb.hi);
    if (lo > hi + 1e-8) return 'no solution';
    return fmtBetween(lo, hi);
  }

  function fmtBetween(lo, hi) {
    return fracPi(lo) + ' ≤ x ≤ ' + fracPi(hi);
  }

  function fracPi(t) {
    var pi = Math.PI;
    var r = t / pi;
    var near = [
      [0, '0'],
      [1 / 6, 'π/6'],
      [1 / 4, 'π/4'],
      [1 / 3, 'π/3'],
      [1 / 2, 'π/2'],
      [2 / 3, '2π/3'],
      [3 / 4, '3π/4'],
      [5 / 6, '5π/6'],
      [1, 'π'],
      [7 / 6, '7π/6'],
      [5 / 4, '5π/4'],
      [4 / 3, '4π/3'],
      [3 / 2, '3π/2'],
      [5 / 3, '5π/3'],
      [7 / 4, '7π/4'],
      [11 / 6, '11π/6'],
      [2, '2π']
    ];
    var q;
    for (q = 0; q < near.length; q++) {
      if (Math.abs(r - near[q][0]) < 0.002) return near[q][1];
    }
    return String(t);
  }

  function pickMc(mc, solution) {
    if (!mc || !solution) return undefined;
    function norm(s) {
      return String(s)
        .replace(/\s+/g, '')
        .replace(/≤/g, '≤')
        .toLowerCase();
    }
    var n = norm(solution);
    var letters = ['A', 'B', 'C', 'D'];
    var i;
    for (i = 0; i < letters.length; i++) {
      var L = letters[i];
      if (mc[L] && norm(mc[L]) === n) return L;
    }
    return undefined;
  }

  function solveTrigInequality(rawInput, intervalStr, multipleChoice) {
    if (!_math) {
      return { solution: '', correctAnswer: undefined, steps: [], error: 'math not loaded' };
    }
    var raw = prepExpr(rawInput);
    if (!raw) return { solution: '', steps: [], error: 'empty' };

    if (/\band\b/i.test(raw)) {
      var halves = raw.split(/\s+and\s+/i);
      if (halves.length === 2) {
        var r1 = solveTrigInequality(halves[0], intervalStr, null);
        var r2 = solveTrigInequality(halves[1], intervalStr, null);
        var sol = intersectSeg(r1.solution, r2.solution);
        return {
          solution: sol,
          isolated: (r1.isolated || '') + ' and ' + (r2.isolated || ''),
          steps: [],
          correctAnswer: pickMc(multipleChoice, sol)
        };
      }
    }

    var sp = splitInequality(raw);
    if (!sp) return { solution: '', steps: [], error: 'not an inequality' };

    var np = to_nonpos(sp.left, sp.right, sp.op);
    var iso = isolateLinearTrigIneq(np.F, np.strict);
    if (!iso) {
      return { solution: '', steps: [], error: 'could not isolate' };
    }

    var kk = iso.kKey;
    if (iso.trig === 'sin' && Math.abs(iso.kNum - 2) < 1e-9) kk = '2';
    if (iso.trig === 'sin' && Math.abs(iso.kNum - 1) < 1e-9 && kk !== '1') kk = '1';

    var row = lookupSolution(iso.trig, kk, iso.sense);
    if (!row) {
      return { solution: '', isolated: iso.isolated, steps: [], error: 'no table row' };
    }

    var sol = row.solution;
    var isolatedOut = row.isolated || iso.isolated;

    var steps = [sp.left + ' ' + sp.op + ' ' + sp.right, 'Isolate: ' + isolatedOut, 'Solution: ' + sol];

    return {
      solution: sol,
      isolated: isolatedOut,
      steps: steps,
      correctAnswer: pickMc(multipleChoice, sol)
    };
  }

  /** Desmos: LHS, RHS lines + inequality shading (region in x) */
  function desmosForInequality(rawInput) {
    var sp = splitInequality(prepExpr(rawInput));
    if (!sp) return null;
    var leftTex = exprToDesmos(sp.left);
    var rightTex = exprToDesmos(sp.right);
    var ineq = sp.op.replace(/<=/g, '\\le').replace(/>=/g, '\\ge');
    return {
      left: 'y=' + leftTex,
      right: 'y=' + rightTex,
      region: leftTex + ' ' + ineq + ' ' + rightTex
    };
  }

  function exprToDesmos(s) {
    try {
      var n = _math.parse(prepForParse(s));
      var tex = n.toTex();
      return String(tex)
        .replace(/\s+/g, '')
        .replace(/~/g, '')
        .replace(/\\cdot(?=\\tan|\\sin|\\cos)/g, '')
        .replace(/\\cdot(?=[0-9])/g, '');
    } catch (e) {
      return prepForParse(s);
    }
  }

  function createTrigInequalityApi(mathInstance) {
    setMath(mathInstance);
    return {
      solveTrigInequality: solveTrigInequality,
      desmosForInequality: desmosForInequality,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createTrigInequalityApi: createTrigInequalityApi,
      solveTrigInequality: solveTrigInequality,
      desmosForInequality: desmosForInequality,
      setMath: setMath
    };
  }

  root.createTrigInequalityApi = createTrigInequalityApi;
  root.solveTrigInequality = solveTrigInequality;
  root.desmosForInequality = desmosForInequality;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
