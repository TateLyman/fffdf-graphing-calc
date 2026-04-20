/**
 * Sum/difference trig formulas: hardcoded AP Precalc patterns + Desmos LaTeX.
 * sin(A±B), cos(A±B), tan(A±B) — numeric angles and sin/cos of (x ± kπ/n).
 */
(function (root) {
  function normalizeSumDiffKey(raw) {
    return String(raw)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  /**
   * Keys = normalizeSumDiffKey(input) for stress tests + UI.
   */
  var SUM_DIFF_TABLE = {
    'sin(3pi/4-5pi/6)': {
      exact: '(√2 - √6) / 4',
      decimal: '-0.2588',
      steps: [
        'sin(3π/4)cos(5π/6) - cos(3π/4)sin(5π/6)',
        '(√2/2)(-√3/2) - (-√2/2)(1/2)',
        '-√6/4 + √2/4',
        '= (√2 - √6)/4'
      ],
      desmosOriginal: '\\sin\\left(\\frac{3\\pi}{4}-\\frac{5\\pi}{6}\\right)',
      desmosSimplified: '\\frac{\\sqrt{2}-\\sqrt{6}}{4}'
    },
    'cos(pi/2+2pi/3)': {
      exact: '-√3 / 2',
      decimal: '-0.8660',
      steps: [
        'cos(π/2)cos(2π/3) - sin(π/2)sin(2π/3)',
        '0·(-1/2) - 1·(√3/2)',
        '= -√3/2'
      ],
      desmosOriginal: '\\cos\\left(\\frac{\\pi}{2}+\\frac{2\\pi}{3}\\right)',
      desmosSimplified: '-\\frac{\\sqrt{3}}{2}'
    },
    'sin(3pi/4-5pi/3)': {
      exact: '(√2 - √6) / 4',
      decimal: '-0.2588',
      steps: [
        'sin(3π/4)cos(5π/3) - cos(3π/4)sin(5π/3)',
        '(√2/2)(1/2) - (-√2/2)(-√3/2)',
        '√2/4 - √6/4',
        '= (√2 - √6)/4'
      ],
      desmosOriginal: '\\sin\\left(\\frac{3\\pi}{4}-\\frac{5\\pi}{3}\\right)',
      desmosSimplified: '\\frac{\\sqrt{2}-\\sqrt{6}}{4}'
    },
    'cos(pi/2+4pi/3)': {
      exact: '√3 / 2',
      decimal: '0.8660',
      steps: [
        'cos(π/2)cos(4π/3) - sin(π/2)sin(4π/3)',
        '0·(-1/2) - 1·(-√3/2)',
        '= √3/2'
      ],
      desmosOriginal: '\\cos\\left(\\frac{\\pi}{2}+\\frac{4\\pi}{3}\\right)',
      desmosSimplified: '\\frac{\\sqrt{3}}{2}'
    },
    'cos(pi-7pi/6)': {
      exact: '√3 / 2',
      decimal: '0.8660',
      steps: [
        'cos(π)cos(7π/6) + sin(π)sin(7π/6)',
        '(-1)(-√3/2) + 0',
        '= √3/2'
      ],
      desmosOriginal: '\\cos\\left(\\pi-\\frac{7\\pi}{6}\\right)',
      desmosSimplified: '\\frac{\\sqrt{3}}{2}'
    },
    'sin(7pi/4-pi/6)': {
      exact: '(-√6 - √2) / 4',
      decimal: '-0.9659',
      steps: [
        'sin(7π/4)cos(π/6) - cos(7π/4)sin(π/6)',
        '(-√2/2)(√3/2) - (√2/2)(1/2)',
        '-√6/4 - √2/4',
        '= (-√6 - √2)/4'
      ],
      desmosOriginal: '\\sin\\left(\\frac{7\\pi}{4}-\\frac{\\pi}{6}\\right)',
      desmosSimplified: '\\frac{-\\sqrt{6}-\\sqrt{2}}{4}'
    },
    'sin(x-4pi/3)': {
      exact: '-1/2·sin(x) + √3/2·cos(x)',
      steps: [
        'sin(x)cos(4π/3) - cos(x)sin(4π/3)',
        'sin(x)(-1/2) - cos(x)(-√3/2)',
        '= -sin(x)/2 + √3cos(x)/2'
      ],
      desmosOriginal: '\\sin\\left(x-\\frac{4\\pi}{3}\\right)',
      desmosSimplified:
        '-\\frac{1}{2}\\sin\\left(x\\right)+\\frac{\\sqrt{3}}{2}\\cos\\left(x\\right)'
    },
    'cos(3pi/2+x)': {
      exact: 'sin(x)',
      steps: [
        'cos(3π/2)cos(x) - sin(3π/2)sin(x)',
        '0·cos(x) - (-1)·sin(x)',
        '= sin(x)'
      ],
      desmosOriginal: '\\cos\\left(\\frac{3\\pi}{2}+x\\right)',
      desmosSimplified: '\\sin\\left(x\\right)'
    },
    'cos(x-pi)': {
      exact: '-cos(x)',
      steps: [
        'cos(x)cos(π) + sin(x)sin(π)',
        'cos(x)(-1) + 0',
        '= -cos(x)'
      ],
      desmosOriginal: '\\cos\\left(x-\\pi\\right)',
      desmosSimplified: '-\\cos\\left(x\\right)'
    },
    'sin(pi/4+pi/6)': {
      exact: '(√6 + √2) / 4',
      decimal: '0.9659',
      desmosOriginal: '\\sin\\left(\\frac{\\pi}{4}+\\frac{\\pi}{6}\\right)',
      desmosSimplified: '\\frac{\\sqrt{6}+\\sqrt{2}}{4}'
    },
    'cos(pi/4-pi/6)': {
      exact: '(√6 + √2) / 4',
      decimal: '0.9659',
      desmosOriginal: '\\cos\\left(\\frac{\\pi}{4}-\\frac{\\pi}{6}\\right)',
      desmosSimplified: '\\frac{\\sqrt{6}+\\sqrt{2}}{4}'
    },
    'sin(pi/3+pi/4)': {
      exact: '(√6 + √2) / 4',
      decimal: '0.9659',
      desmosOriginal: '\\sin\\left(\\frac{\\pi}{3}+\\frac{\\pi}{4}\\right)',
      desmosSimplified: '\\frac{\\sqrt{6}+\\sqrt{2}}{4}'
    },
    'cos(pi/3+pi/6)': {
      exact: '0',
      decimal: '0',
      note: 'simplifies to cos(π/2)',
      desmosOriginal: '\\cos\\left(\\frac{\\pi}{3}+\\frac{\\pi}{6}\\right)',
      desmosSimplified: '0'
    },
    'sin(pi/6+pi/6)': {
      exact: '√3 / 2',
      decimal: '0.8660',
      note: 'simplifies to sin(π/3)',
      desmosOriginal: '\\sin\\left(\\frac{\\pi}{6}+\\frac{\\pi}{6}\\right)',
      desmosSimplified: '\\frac{\\sqrt{3}}{2}'
    },
    'cos(pi/4+pi/4)': {
      exact: '0',
      decimal: '0',
      note: 'simplifies to cos(π/2)',
      desmosOriginal: '\\cos\\left(\\frac{\\pi}{4}+\\frac{\\pi}{4}\\right)',
      desmosSimplified: '0'
    },
    'sin(x+pi/6)': {
      exact: '√3/2·sin(x) + 1/2·cos(x)',
      steps: [
        'sin(x)cos(π/6) + cos(x)sin(π/6)',
        '= √3/2·sin(x) + 1/2·cos(x)'
      ],
      desmosOriginal: '\\sin\\left(x+\\frac{\\pi}{6}\\right)',
      desmosSimplified:
        '\\frac{\\sqrt{3}}{2}\\sin\\left(x\\right)+\\frac{1}{2}\\cos\\left(x\\right)'
    },
    'cos(x+pi/3)': {
      exact: '1/2·cos(x) - √3/2·sin(x)',
      steps: [
        'cos(x)cos(π/3) - sin(x)sin(π/3)',
        '= 1/2·cos(x) - √3/2·sin(x)'
      ],
      desmosOriginal: '\\cos\\left(x+\\frac{\\pi}{3}\\right)',
      desmosSimplified:
        '\\frac{1}{2}\\cos\\left(x\\right)-\\frac{\\sqrt{3}}{2}\\sin\\left(x\\right)'
    },
    'sin(x+pi/4)': {
      exact: '√2/2·sin(x) + √2/2·cos(x)',
      desmosOriginal: '\\sin\\left(x+\\frac{\\pi}{4}\\right)',
      desmosSimplified:
        '\\frac{\\sqrt{2}}{2}\\sin\\left(x\\right)+\\frac{\\sqrt{2}}{2}\\cos\\left(x\\right)'
    },
    'cos(x-pi/6)': {
      exact: '√3/2·cos(x) + 1/2·sin(x)',
      desmosOriginal: '\\cos\\left(x-\\frac{\\pi}{6}\\right)',
      desmosSimplified:
        '\\frac{\\sqrt{3}}{2}\\cos\\left(x\\right)+\\frac{1}{2}\\sin\\left(x\\right)'
    },
    'sin(x-pi/2)': {
      exact: '-cos(x)',
      steps: ['sin(x)(0) - cos(x)(1)', '= -cos(x)'],
      desmosOriginal: '\\sin\\left(x-\\frac{\\pi}{2}\\right)',
      desmosSimplified: '-\\cos\\left(x\\right)'
    },
    'cos(x+pi)': {
      exact: '-cos(x)',
      desmosOriginal: '\\cos\\left(x+\\pi\\right)',
      desmosSimplified: '-\\cos\\left(x\\right)'
    },
    'sin(x+pi)': {
      exact: '-sin(x)',
      desmosOriginal: '\\sin\\left(x+\\pi\\right)',
      desmosSimplified: '-\\sin\\left(x\\right)'
    },
    'sin(pi/12)': {
      exact: '(√6 - √2) / 4',
      decimal: '0.2588',
      note: 'rewrite as π/3 - π/4',
      steps: [
        'sin(π/3)cos(π/4) - cos(π/3)sin(π/4)',
        '(√3/2)(√2/2) - (1/2)(√2/2)',
        '√6/4 - √2/4',
        '= (√6 - √2)/4'
      ],
      desmosOriginal: '\\sin\\left(\\frac{\\pi}{12}\\right)',
      desmosSimplified: '\\frac{\\sqrt{6}-\\sqrt{2}}{4}'
    },
    'cos(5pi/12)': {
      exact: '(√6 - √2) / 4',
      decimal: '0.2588',
      note: 'rewrite as π/6 + π/4',
      steps: [
        'cos(π/6)cos(π/4) - sin(π/6)sin(π/4)',
        '(√3/2)(√2/2) - (1/2)(√2/2)',
        '√6/4 - √2/4',
        '= (√6 - √2)/4'
      ],
      desmosOriginal: '\\cos\\left(\\frac{5\\pi}{12}\\right)',
      desmosSimplified: '\\frac{\\sqrt{6}-\\sqrt{2}}{4}'
    }
  };

  function sumDiffAnalyze(rawInput) {
    var raw = String(rawInput || '').replace(/\u2212/g, '-').trim();
    if (!raw) {
      return {
        analysisKind: 'sumDiff',
        exact: '',
        decimal: '',
        steps: [],
        matched: false,
        desmosOriginalLatex: '',
        desmosSimplifiedLatex: ''
      };
    }

    var key = normalizeSumDiffKey(raw);
    var row = SUM_DIFF_TABLE[key];
    if (!row) {
      return {
        analysisKind: 'sumDiff',
        exact: raw,
        decimal: '',
        steps: [
          'No matching sum/difference pattern in the lookup table (use sin/cos/tan of (A±B) with special angles or x).'
        ],
        matched: false,
        desmosOriginalLatex: '',
        desmosSimplifiedLatex: ''
      };
    }

    var dec = row.decimal != null ? String(row.decimal) : '';

    return {
      analysisKind: 'sumDiff',
      exact: row.exact,
      decimal: dec,
      steps: row.steps ? row.steps.slice() : [],
      note: row.note,
      matched: true,
      desmosOriginalLatex: row.desmosOriginal || '',
      desmosSimplifiedLatex: row.desmosSimplified || ''
    };
  }

  function createSumDiffApi() {
    return {
      sumDiffAnalyze: sumDiffAnalyze,
      normalizeSumDiffKey: normalizeSumDiffKey,
      SUM_DIFF_TABLE: SUM_DIFF_TABLE
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createSumDiffApi: createSumDiffApi,
      sumDiffAnalyze: sumDiffAnalyze,
      normalizeSumDiffKey: normalizeSumDiffKey,
      SUM_DIFF_TABLE: SUM_DIFF_TABLE
    };
  }

  root.createSumDiffApi = createSumDiffApi;
  root.sumDiffAnalyze = sumDiffAnalyze;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
