/**
 * Asymptotes for tan / cot / sec / csc in the form x = [first] + [period] k
 * (Node + mathjs 12)
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

  function prepInner(s) {
    s = prepExpr(s);
    // Derivatives use x; worksheet-style theta/θ is the same independent variable.
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    return s;
  }

  function extractArgFromOpen(str, openIdx) {
    var depth = 0;
    for (var i = openIdx; i < str.length; i++) {
      var c = str[i];
      if (c === '(') depth++;
      else if (c === ')') {
        depth--;
        if (depth === 0) return str.slice(openIdx + 1, i);
      }
    }
    return null;
  }

  function findTrig(expr) {
    var s = prepExpr(expr);
    // Do not use \b: digits before tan (e.g. 5tan, -2tan) have no word boundary before "tan".
    // Skip names like "atan" by requiring a non-letter (or start) before tan|cot|sec|csc.
    var re = /(^|[^A-Za-z])(tan|cot|sec|csc)\s*\(/gi;
    var m = re.exec(s);
    if (!m) return null;
    var open = s.indexOf('(', m.index);
    var arg = extractArgFromOpen(s, open);
    if (arg == null) return null;
    return { type: m[2].toLowerCase(), arg: arg.trim() };
  }

  function getBC(innerRaw) {
    var inner = prepInner(innerRaw);
    var innerNode = math.simplify(math.parse(inner));
    var Bnode = math.simplify(math.derivative(innerNode, 'x'));
    if (Bnode.toString().indexOf('x') !== -1) {
      throw new Error('nonlinear');
    }
    var xNode = new math.SymbolNode('x');
    var Bx = new math.OperatorNode('*', 'multiply', [Bnode, xNode]);
    var diff = new math.OperatorNode('-', 'subtract', [innerNode, Bx]);
    var Cnode = math.simplify(diff);
    var B = Bnode.evaluate();
    if (!isFinite(B) || B === 0) {
      throw new Error('badB');
    }
    return { Bnode: Bnode, Cnode: Cnode, B: B };
  }

  function stripLeadingMinus(str) {
    var s = String(str).replace(/\s+/g, '');
    return s[0] === '-' ? s.slice(1) : s;
  }

  function buildFirstTan(Cnode, Bnode) {
    var halfPi = math.parse('pi/2');
    var num = new math.OperatorNode('-', 'subtract', [halfPi, Cnode]);
    return math.simplify(new math.OperatorNode('/', 'divide', [num, Bnode]));
  }

  function buildFirstCot(Cnode, Bnode) {
    var zero = math.parse('0');
    var num = new math.OperatorNode('-', 'subtract', [zero, Cnode]);
    return math.simplify(new math.OperatorNode('/', 'divide', [num, Bnode]));
  }

  function buildPeriod(Bnode) {
    var den = stripLeadingMinus(Bnode.toString());
    return math.simplify(math.parse('pi / (' + den + ')'));
  }

  function nodeToDisplay(n) {
    var s = math.simplify(n).toString();
    s = s.replace(/\s+/g, '');
    s = s.replace(/pi\*-1\//g, '-\u03c0/');
    s = s.replace(/-1\/(\d+)\*pi/g, '-\u03c0/$1');
    s = s.replace(/pi\*1\//g, '\u03c0/');
    s = s.replace(/1\/(\d+)\*pi/g, '\u03c0/$1');
    s = s.replace(/pi\*(\d+)(\/\d+)?/g, function (_, num, frac) {
      if (num === '1' && frac) {
        return '\u03c0' + frac;
      }
      return num + '\u03c0' + (frac || '');
    });
    s = s.replace(/pi\//g, '\u03c0/');
    s = s.replace(/\*pi/g, '\u03c0');
    s = s.replace(/pi/g, '\u03c0');
    s = s.replace(/\*/g, '');
    return s;
  }

  function isZeroNode(n) {
    try {
      var v = math.simplify(n).evaluate();
      return Math.abs(v) < 1e-14;
    } catch (e) {
      return false;
    }
  }

  function periodNeedsParens(periodStr) {
    return periodStr.indexOf('/') !== -1;
  }

  function formatLine(firstStr, periodStr) {
    var parenP = periodNeedsParens(periodStr) ? '(' + periodStr + ')' : periodStr;
    if (periodStr === '1') {
      return 'x = ' + firstStr + ' + k';
    }
    if (firstStr === '0' || firstStr === '') {
      return 'x = ' + parenP + 'k';
    }
    return 'x = ' + firstStr + ' + ' + parenP + 'k';
  }

  function asymptoteFormula(raw) {
    if (!math) throw new Error('call setMath(math) first');
    var expr = prepExpr(raw);
    var t = findTrig(expr);
    if (!t) {
      if (/\b(sin|cos)\b/i.test(expr)) return 'none';
      return 'none';
    }
    var family = t.type === 'tan' || t.type === 'sec' ? 'tan' : 'cot';
    var Bnode;
    var Cnode;
    var B;
    try {
      var bc = getBC(t.arg);
      Bnode = bc.Bnode;
      Cnode = bc.Cnode;
      B = bc.B;
    } catch (e) {
      return 'none';
    }

    var firstN = family === 'tan' ? buildFirstTan(Cnode, Bnode) : buildFirstCot(Cnode, Bnode);
    var periodN = buildPeriod(Bnode);

    var firstStr = nodeToDisplay(firstN);
    var periodStr = nodeToDisplay(periodN);

    if (isZeroNode(firstN)) {
      firstStr = '0';
    }

    return formatLine(firstStr, periodStr);
  }

  function createAsymptoteApi(mathInstance) {
    setMath(mathInstance);
    return {
      asymptoteFormula: asymptoteFormula,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createAsymptoteApi,
      asymptoteFormula: function (s) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return asymptoteFormula(s);
      },
      setMath: setMath
    };
  }
  root.createAsymptoteApi = createAsymptoteApi;
  root.asymptoteFormula = asymptoteFormula;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
