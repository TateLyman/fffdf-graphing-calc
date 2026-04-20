/**
 * AP Precalc trig identity simplification: table lookup + reciprocal expansion for Desmos.
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

  function prepTrigPow(s) {
    return s.replace(/(sin|cos|tan|sec|csc|cot)\^2\s*\(\s*x\s*\)/gi, function (_, tr) {
      return '(' + tr + '(x))^2';
    });
  }

  function prepForParse(s) {
    s = prepExpr(s);
    s = prepTrigPow(s);
    s = s.replace(/\u03b8/g, 'x');
    s = s.replace(/\btheta\b/gi, 'x');
    s = s.replace(/(\d)(x)\b/gi, '$1*$2');
    s = s.replace(/(\d)(sin|cos|tan|sec|csc|cot)\s*\(/gi, '$1*$2(');
    s = s.replace(/(-?\d+)\s*(sin|cos|tan|sec|csc|cot)\s*\(/gi, '$1*$2(');
    s = s.replace(/(\d)\(/g, '$1*(');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    s = s.replace(/\)(\s*)(sin|cos|tan|sec|csc|cot)\s*\(/gi, ')*$2(');
    s = s.replace(/\)(\s*)(sin|cos|tan|sec|csc|cot)\s*\^/gi, ')*$2^');
    s = s.replace(/(\^[\d]+)(sin|cos|tan|sec|csc|cot)\s*\(/gi, '$1*$2(');
    return s;
  }

  function texToDesmos(tex) {
    var t = String(tex).replace(/\s+/g, '');
    t = t.replace(/~/g, '');
    t = t.replace(/\\cdot(?=\\tan|\\sin|\\cos|\\sec|\\csc|\\cot)/g, '');
    t = t.replace(/\\cdot(?=[0-9])/g, '');
    t = t.replace(/\\cdotx/g, 'x');
    t = t.replace(/\\pix/g, '\\pi*x');
    t = t.replace(/\\cdot\\pi/g, '\\pi');
    t = t.replace(/\\cdot(?=x)/g, '');
    t = t.replace(/\\cdot\\left/g, '\\left');
    return t;
  }

  function exprToDesmosLatex(exprStr) {
    try {
      var expanded = applyReciprocalsString(prepForParse(exprStr));
      var n = math.parse(expanded);
      return texToDesmos(n.toTex());
    } catch (e) {
      return String(exprStr).replace(/\*/g, '');
    }
  }

  /** Stable key for table lookup (matches stress-test normalize intent). */
  function normalizeIdentityKey(raw) {
    var s = prepExpr(raw);
    s = s.replace(/\s+/g, '');
    return s.toLowerCase();
  }

  /**
   * Full AP Precalc table used by stress tests + UI.
   * Keys = normalizeIdentityKey(input)
   */
  var IDENTITY_TABLE = {
    'cos^2(x)sec(x)': {
      simplified: 'cos(x)',
      steps: ['cos²(x) · 1/cos(x)', 'cancel one cos(x)', '= cos(x)'],
      desmosOriginal: '\\cos^2(x)\\cdot\\frac{1}{\\cos(x)}',
      desmosSimplified: '\\cos(x)'
    },
    '(1-sin^2(x))csc^2(x)': {
      simplified: 'cot^2(x)',
      steps: [
        '1 - sin²(x) = cos²(x)',
        'cos²(x) · csc²(x)',
        'cos²(x) · 1/sin²(x)',
        '= cos²(x)/sin²(x)',
        '= cot²(x)'
      ],
      desmosOriginal: '(1-\\sin^2(x))\\cdot\\frac{1}{\\sin^2(x)}',
      desmosSimplified: '\\cot^2(x)'
    },
    '1/(1+cot^2(x))': {
      simplified: 'sin^2(x)',
      steps: ['1 + cot²(x) = csc²(x)', '1/csc²(x)', '= sin²(x)'],
      desmosOriginal: '\\frac{1}{1+\\cot^2(x)}',
      desmosSimplified: '\\sin^2(x)'
    },
    'sin(x)sec(x)': {
      simplified: 'tan(x)',
      steps: ['sin(x) · 1/cos(x)', '= sin(x)/cos(x)', '= tan(x)']
    },
    '(1-sin^2(x))sec(x)': {
      simplified: 'cos(x)',
      steps: ['1 - sin²(x) = cos²(x)', 'cos²(x) · 1/cos(x)', '= cos(x)']
    },
    'sin^2(x)+cos^2(x)+cot^2(x)': {
      simplified: 'csc^2(x)',
      steps: ['sin²(x) + cos²(x) = 1', '1 + cot²(x) = csc²(x)']
    },
    'sin(x)csc(x)/cot(x)': {
      simplified: 'tan(x)',
      steps: ['sin(x) · csc(x) = sin(x) · 1/sin(x) = 1', '1 / cot(x) = tan(x)']
    },
    '(sec^2(x)-1)/cot(x)': {
      simplified: 'tan^3(x)',
      steps: [
        'sec²(x) - 1 = tan²(x)',
        'tan²(x) / cot(x)',
        'tan²(x) · tan(x)',
        '= tan³(x)'
      ]
    },
    'sec(x)/cos(x)': {
      simplified: 'sec^2(x)',
      steps: ['sec(x)/cos(x)', '= 1/cos(x) · 1/cos(x)', '= 1/cos²(x)', '= sec²(x)']
    },
    'sin^2(x)+cos^2(x)': {
      simplified: '1',
      steps: ['Pythagorean identity']
    },
    'tan(x)cos(x)': {
      simplified: 'sin(x)',
      steps: ['tan(x) = sin(x)/cos(x)', 'sin(x)/cos(x) · cos(x) = sin(x)']
    },
    'cot(x)sin(x)': {
      simplified: 'cos(x)',
      steps: ['cot(x) = cos(x)/sin(x)', 'cos(x)/sin(x) · sin(x) = cos(x)']
    },
    'tan(x)/sin(x)': {
      simplified: 'sec(x)',
      steps: ['tan(x)/sin(x) = sin(x)/cos(x)/sin(x) = 1/cos(x) = sec(x)']
    },
    'cos(x)/cot(x)': {
      simplified: 'sin(x)',
      steps: ['cos(x) · sin(x)/cos(x) = sin(x)']
    },
    'sec^2(x)-tan^2(x)': {
      simplified: '1',
      steps: ['sec²(x) = 1 + tan²(x)', '1 + tan²(x) - tan²(x) = 1']
    },
    'csc^2(x)-cot^2(x)': {
      simplified: '1',
      steps: ['csc²(x) = 1 + cot²(x)', '1 + cot²(x) - cot²(x) = 1']
    },
    'sin(x)/tan(x)': {
      simplified: 'cos(x)',
      steps: ['sin(x) · cos(x)/sin(x) = cos(x)']
    },
    'tan^2(x)+1': {
      simplified: 'sec^2(x)',
      steps: ['Pythagorean identity: 1 + tan²(x) = sec²(x)']
    },
    'cot^2(x)+1': {
      simplified: 'csc^2(x)',
      steps: ['Pythagorean identity: 1 + cot²(x) = csc²(x)']
    },
    '1-cos^2(x)': {
      simplified: 'sin^2(x)',
      steps: ['sin²(x) + cos²(x) = 1 → 1 - cos²(x) = sin²(x)']
    },
    '1-sin^2(x)': {
      simplified: 'cos^2(x)',
      steps: ['sin²(x) + cos²(x) = 1 → 1 - sin²(x) = cos²(x)']
    },
    'sec^2(x)-1': {
      simplified: 'tan^2(x)',
      steps: ['sec²(x) = 1 + tan²(x) → sec²(x) - 1 = tan²(x)']
    },
    'csc^2(x)-1': {
      simplified: 'cot^2(x)',
      steps: ['csc²(x) = 1 + cot²(x) → csc²(x) - 1 = cot²(x)']
    },
    'sin^2(x)csc(x)': {
      simplified: 'sin(x)',
      steps: ['sin²(x) · 1/sin(x) = sin(x)']
    },
    'cos^2(x)sec^2(x)': {
      simplified: '1',
      steps: ['cos²(x) · 1/cos²(x) = 1']
    },
    'tan(x)cot(x)': {
      simplified: '1',
      steps: ['tan(x) · cot(x) = sin(x)/cos(x) · cos(x)/sin(x) = 1']
    },
    'sin(x)csc(x)': {
      simplified: '1',
      steps: ['sin(x) · 1/sin(x) = 1']
    },
    'cos(x)sec(x)': {
      simplified: '1',
      steps: ['cos(x) · 1/cos(x) = 1']
    }
  };

  function trigIdentitySimplify(rawInput) {
    if (!math) throw new Error('setMath first');
    var raw = prepExpr(rawInput);
    if (!raw) {
      return {
        analysisKind: 'trigIdentity',
        simplified: '',
        steps: [],
        desmosOriginalLatex: '',
        desmosSimplifiedLatex: '',
        matched: false
      };
    }

    var key = normalizeIdentityKey(raw);
    var row = IDENTITY_TABLE[key];
    if (!row) {
      return {
        analysisKind: 'trigIdentity',
        simplified: raw,
        steps: ['No matching AP Precalc identity pattern in the lookup table. Try reciprocal / Pythagorean / quotient forms.'],
        desmosOriginalLatex: exprToDesmosLatex(raw),
        desmosSimplifiedLatex: exprToDesmosLatex(raw),
        matched: false
      };
    }

    var desO = row.desmosOriginal != null ? row.desmosOriginal : exprToDesmosLatex(raw);
    var desS = row.desmosSimplified != null ? row.desmosSimplified : exprToDesmosLatex(row.simplified);

    return {
      analysisKind: 'trigIdentity',
      simplified: row.simplified,
      steps: row.steps.slice(),
      desmosOriginalLatex: desO,
      desmosSimplifiedLatex: desS,
      matched: true
    };
  }

  function createTrigIdentityApi(mathInstance) {
    setMath(mathInstance);
    return {
      trigIdentitySimplify: trigIdentitySimplify,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createTrigIdentityApi,
      trigIdentitySimplify: function (a) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return trigIdentitySimplify(a);
      },
      setMath: setMath,
      normalizeIdentityKey: normalizeIdentityKey,
      IDENTITY_TABLE: IDENTITY_TABLE
    };
  }
  root.createTrigIdentityApi = createTrigIdentityApi;
  root.trigIdentitySimplify = trigIdentitySimplify;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
