/**
 * Graph trig: reciprocal conversion, Desmos LaTeX, period / phase / shift / amplitude, asymptotes.
 */
(function (root) {
  var math = null;
  var asymptoteFormulaFn = null;
  var inverseTrigAnalyzeCached = null;
  var trigFuncInverseAnalyzeCached = null;

  function getTrigFuncInverseAnalyze() {
    if (trigFuncInverseAnalyzeCached) return trigFuncInverseAnalyzeCached;
    if (typeof root.trigFuncInverseAnalyze === 'function') {
      trigFuncInverseAnalyzeCached = root.trigFuncInverseAnalyze;
      return trigFuncInverseAnalyzeCached;
    }
    try {
      trigFuncInverseAnalyzeCached = require('./trig-func-inverse.js').trigFuncInverseAnalyze;
    } catch (e) {
      trigFuncInverseAnalyzeCached = null;
    }
    return trigFuncInverseAnalyzeCached;
  }

  function getInverseTrigAnalyze() {
    if (inverseTrigAnalyzeCached) return inverseTrigAnalyzeCached;
    if (typeof root.inverseTrigAnalyze === 'function') {
      inverseTrigAnalyzeCached = root.inverseTrigAnalyze;
      return inverseTrigAnalyzeCached;
    }
    try {
      inverseTrigAnalyzeCached = require('./inverse-trig.js').inverseTrigAnalyze;
    } catch (e) {
      inverseTrigAnalyzeCached = null;
    }
    return inverseTrigAnalyzeCached;
  }

  function setMath(m) {
    math = m;
  }

  function setAsymptoteFormula(fn) {
    asymptoteFormulaFn = typeof fn === 'function' ? fn : null;
  }

  function prepExpr(s) {
    return String(s)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeTrigExprChars(s) {
    return String(s)
      .replace(/\uFF08/g, '(')
      .replace(/\uFF09/g, ')')
      .replace(/\u1D465|\uFF58/g, 'x');
  }

  /** Same as trig-equation.js: coef*sin(num)+x → coef*sin(x)+num (worksheet variable is x). */
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

  function prepParse(s) {
    s = prepExpr(s);
    s = normalizeTrigExprChars(s);
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(\d)(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(-?\d+)\s*(sin|cos|tan)\s*\(/gi, '$1*$2(');
    s = s.replace(/(\d)\(/g, '$1*(');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    s = repairTrigLinearConstantForm(s);
    return s;
  }

  function applyReciprocalsString(s) {
    var t = s;
    t = t.replace(/(\d+)\s*sec\s*\(/gi, '$1/cos(');
    t = t.replace(/(^|[^\w\d])sec\s*\(/gi, function (_, p) {
      return p + '1/cos(';
    });
    t = t.replace(/(\d+)\s*csc\s*\(/gi, '$1/sin(');
    t = t.replace(/(^|[^\w\d])csc\s*\(/gi, function (_, p) {
      return p + '1/sin(';
    });
    t = t.replace(/(\d+)\s*cot\s*\(/gi, '$1/tan(');
    t = t.replace(/(^|[^\w\d])cot\s*\(/gi, function (_, p) {
      return p + '1/tan(';
    });
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

  function exprToDesmosLatex(withRec) {
    var n = math.parse(withRec);
    return texToDesmos(n.toTex());
  }

  function walkFindTrig(n) {
    n = math.simplify(n);
    if (!n) return null;
    if (n.type === 'OperatorNode' && n.fn === 'divide') {
      var den = n.args[1];
      if (den.type === 'FunctionNode' && den.name === 'tan') {
        return { family: 'cot', arg: den.args[0], innerNodeName: 'tan' };
      }
      if (den.type === 'FunctionNode' && den.name === 'sin') {
        return { family: 'csc', arg: den.args[0], innerNodeName: 'sin' };
      }
      if (den.type === 'FunctionNode' && den.name === 'cos') {
        return { family: 'sec', arg: den.args[0], innerNodeName: 'cos' };
      }
    }
    if (n.type === 'FunctionNode' && n.name === 'sin') {
      return { family: 'sin', arg: n.args[0], innerNodeName: 'sin' };
    }
    if (n.type === 'FunctionNode' && n.name === 'cos') {
      return { family: 'cos', arg: n.args[0], innerNodeName: 'cos' };
    }
    if (n.type === 'FunctionNode' && n.name === 'tan') {
      return { family: 'tan', arg: n.args[0], innerNodeName: 'tan' };
    }
    if (n.args) {
      for (var i = 0; i < n.args.length; i++) {
        var ww = walkFindTrig(n.args[i]);
        if (ww) return ww;
      }
    }
    return null;
  }

  function isXFree(node) {
    try {
      var d = math.simplify(math.derivative(node, 'x'));
      var t = d.toString();
      return t === '0' || (d.type === 'ConstantNode' && math.abs(d.value) < 1e-12);
    } catch (e) {
      return false;
    }
  }

  function splitConstantRest(node) {
    var n = math.simplify(node);
    if (isXFree(n)) return { rest: math.parse('0'), c: n };
    if (n.type === 'OperatorNode' && n.fn === 'subtract') {
      var L = n.args[0];
      var R = n.args[1];
      if (isXFree(L) && !isXFree(R)) {
        return { rest: R, c: L };
      }
      if (!isXFree(L) && isXFree(R)) {
        return { rest: L, c: new math.OperatorNode('-', 'unaryMinus', [R]) };
      }
      if (isXFree(R)) {
        var sp = splitConstantRest(L);
        return {
          rest: sp.rest,
          c: math.simplify(new math.OperatorNode('-', 'subtract', [sp.c, R]))
        };
      }
    }
    if (n.type === 'OperatorNode' && n.fn === 'add') {
      var restParts = [];
      var constParts = [];
      for (var i = 0; i < n.args.length; i++) {
        var a = n.args[i];
        if (isXFree(a)) constParts.push(a);
        else restParts.push(a);
      }
      if (constParts.length === 0) return { rest: n, c: math.parse('0') };
      var rest =
        restParts.length === 1 ? restParts[0] : new math.OperatorNode('+', 'add', restParts);
      var c =
        constParts.length === 1 ? constParts[0] : new math.OperatorNode('+', 'add', constParts);
      return { rest: math.simplify(rest), c: math.simplify(c) };
    }
    return { rest: n, c: math.parse('0') };
  }

  function getBC(inner) {
    var innerNode = math.simplify(inner);
    var Bnode = math.simplify(math.derivative(innerNode, 'x'));
    if (Bnode.toString().indexOf('x') !== -1) throw new Error('nonlinear');
    var xNode = new math.SymbolNode('x');
    var Bx = new math.OperatorNode('*', 'multiply', [Bnode, xNode]);
    var diff = new math.OperatorNode('-', 'subtract', [innerNode, Bx]);
    var Cnode = math.simplify(diff);
    var B = Bnode.evaluate();
    if (!isFinite(B) || B === 0) throw new Error('badB');
    return { Bnode: Bnode, Cnode: Cnode, B: B };
  }

  function piExprToDisplayString(node) {
    var n = math.simplify(node);
    var str = n.toString().replace(/\s+/g, '');
    str = str.replace(/pi\*-1\//g, '-π/');
    str = str.replace(/pi\*(\d+)(\/\d+)?/g, function (_, num, frac) {
      if (num === '1' && frac) return 'π' + frac;
      return num + 'π' + (frac || '');
    });
    str = str.replace(/pi\//g, 'π/');
    str = str.replace(/\*pi/g, 'π');
    str = str.replace(/pi/g, 'π');
    str = str.replace(/\*/g, '');
    return str;
  }

  function formatPhaseLeftRight(CoverB) {
    var ev = math.simplify(CoverB);
    var v = ev.evaluate();
    if (Math.abs(v) < 1e-10) return 'none';
    var s = piExprToDisplayString(ev);
    if (v > 0) return 'left ' + s;
    return 'right ' + piExprToDisplayString(math.simplify(new math.OperatorNode('-', 'unaryMinus', [ev])));
  }

  function periodString(family, Bnode) {
    var Bstr = Bnode.toString().replace(/\s+/g, '');
    var usePiOnly = family === 'tan' || family === 'cot';
    var periodN = math.simplify(
      usePiOnly ? math.parse('pi / (' + Bstr + ')') : math.parse('2*pi / (' + Bstr + ')')
    );
    return piExprToDisplayString(periodN);
  }

  function constToVertString(cnode) {
    var v = cnode.evaluate();
    if (Math.abs(v) < 1e-10) return '0';
    if (Math.abs(v - Math.round(v)) < 1e-10) return String(Math.round(v));
    return String(v);
  }

  function nodesEqual(a, b) {
    return math.simplify(new math.OperatorNode('-', 'subtract', [a, b])).toString() === '0';
  }

  function coefOfTrig(full, tg) {
    var n = math.simplify(full);
    var nm = tg.innerNodeName;
    if (n.type === 'OperatorNode' && n.fn === 'subtract' && isXFree(n.args[0]) && !isXFree(n.args[1])) {
      return coefOfTrig(n.args[1], tg);
    }
    if (n.type === 'OperatorNode' && n.fn === 'subtract' && !isXFree(n.args[0]) && isXFree(n.args[1])) {
      return coefOfTrig(n.args[0], tg);
    }
    if (n.type === 'OperatorNode' && n.fn === 'divide') {
      var den = n.args[1];
      if (den.type === 'FunctionNode' && den.name === nm) {
        if (nodesEqual(den.args[0], tg.arg)) {
          return math.simplify(n.args[0]);
        }
      }
    }
    if (n.type === 'OperatorNode' && n.fn === 'multiply') {
      var acc = [];
      var fnd = null;
      for (var i = 0; i < n.args.length; i++) {
        var a = n.args[i];
        if (a.type === 'FunctionNode' && a.name === nm) {
          if (nodesEqual(a.args[0], tg.arg)) {
            fnd = true;
            continue;
          }
        }
        acc.push(a);
      }
      if (fnd) {
        if (acc.length === 0) return math.parse('1');
        if (acc.length === 1) return math.simplify(acc[0]);
        return math.simplify(new math.OperatorNode('*', 'multiply', acc));
      }
    }
    if (n.type === 'FunctionNode' && n.name === nm) {
      return math.parse('1');
    }
    if (n.type === 'OperatorNode' && n.fn === 'unaryMinus') {
      var inr = n.args[0];
      if (inr.type === 'FunctionNode' && inr.name === nm) {
        return math.parse('-1');
      }
      if (inr.type === 'OperatorNode' && inr.fn === 'divide') {
        var den2 = inr.args[1];
        if (den2.type === 'FunctionNode' && den2.name === nm) {
          return math.simplify(
            new math.OperatorNode('*', 'multiply', [math.parse('-1'), inr.args[0]])
          );
        }
      }
    }
    return math.parse('1');
  }

  function amplitudeString(family, ampNode) {
    if (family === 'tan' || family === 'cot') return 'none';
    var v = Math.abs(ampNode.evaluate());
    if (Math.abs(v - Math.round(v)) < 1e-10) return String(Math.round(v));
    return piExprToDisplayString(math.simplify(ampNode));
  }

  function graphTrigAnalyze(raw, restriction) {
    if (!math) throw new Error('setMath first');
    if (restriction != null && String(restriction).trim()) {
      var tfi = getTrigFuncInverseAnalyze();
      if (tfi) {
        try {
          var tfR = tfi(raw, String(restriction).trim());
          if (tfR && tfR.analysisKind === 'trigFuncInverse') return tfR;
        } catch (eTfi) {}
      }
      return {
        analysisKind: 'trigFuncInverseFailed',
        desmos: '',
        period: '',
        phaseShift: '',
        verticalShift: '',
        amplitude: '',
        asymptotes: 'none'
      };
    }
    var invFn = getInverseTrigAnalyze();
    if (invFn) {
      try {
        var invR = invFn(raw);
        if (invR && invR.analysisKind === 'inverse') return invR;
      } catch (eInv) {}
    }
    var pre = prepParse(raw);
    if (!pre) {
      return {
        desmos: '',
        period: '',
        phaseShift: '',
        verticalShift: '',
        amplitude: '',
        asymptotes: 'none'
      };
    }
    var withRec = applyReciprocalsString(pre);
    var desmos = exprToDesmosLatex(withRec);
    var converted = math.simplify(math.parse(withRec));

    var tg = walkFindTrig(converted);
    var period = '';
    var phaseShift = 'none';
    var verticalShift = '0';
    var amplitude = 'none';
    var asymptotes = 'none';

    if (tg) {
      try {
        var bc = getBC(tg.arg);
        var CoverB = math.simplify(new math.OperatorNode('/', 'divide', [bc.Cnode, bc.Bnode]));
        phaseShift = formatPhaseLeftRight(CoverB);
        period = periodString(tg.family, bc.Bnode);
        var ampN = coefOfTrig(converted, tg);
        amplitude = amplitudeString(tg.family, ampN);
        var sp = splitConstantRest(converted);
        verticalShift = constToVertString(sp.c);
      } catch (e) {}
    }

    if (asymptoteFormulaFn) {
      try {
        asymptotes = asymptoteFormulaFn(raw);
      } catch (e2) {
        asymptotes = 'none';
      }
    }

    return {
      desmos: desmos,
      period: period,
      phaseShift: phaseShift,
      verticalShift: verticalShift,
      amplitude: amplitude,
      asymptotes: asymptotes
    };
  }

  function createGraphTrigApi(mathInstance, asymptoteFn) {
    setMath(mathInstance);
    setAsymptoteFormula(asymptoteFn);
    try {
      if (typeof root.createInverseTrigApi === 'function') {
        root.createInverseTrigApi(mathInstance);
      } else if (typeof require !== 'undefined') {
        require('./inverse-trig.js').setMath(mathInstance);
      }
    } catch (e) {}
    try {
      if (typeof root.createTrigFuncInverseApi === 'function') {
        root.createTrigFuncInverseApi(mathInstance);
      } else if (typeof require !== 'undefined') {
        require('./trig-func-inverse.js').setMath(mathInstance);
      }
    } catch (e2) {}
    return {
      graphTrigAnalyze: graphTrigAnalyze,
      setMath: setMath,
      setAsymptoteFormula: setAsymptoteFormula
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createGraphTrigApi,
      graphTrigAnalyze: function (s, r) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return graphTrigAnalyze(s, r);
      },
      setMath: setMath,
      setAsymptoteFormula: setAsymptoteFormula
    };
  }
  root.createGraphTrigApi = createGraphTrigApi;
  root.graphTrigAnalyze = graphTrigAnalyze;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
