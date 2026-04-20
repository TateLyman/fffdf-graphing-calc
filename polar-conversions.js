/**
 * Polar coordinates: ordered detection, table + mathjs fallbacks, quadrant θ rules.
 */
(function (root) {
  var _math = null;

  function setMath(m) {
    _math = m;
  }

  function getMath() {
    if (_math) return _math;
    if (typeof require !== 'undefined') {
      try {
        var mm = require('mathjs');
        _math = mm.create(mm.all, {});
        return _math;
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.math) return window.math;
    return null;
  }

  var HELP_FORMATS =
    'Use one of: r = f(theta) · (r, θ) where θ contains π/pi (e.g. 5pi/6) → polar→rectangular · ' +
    '(x, y) where the second value has no π/pi (plain numbers) → rectangular→polar · a + bi · ' +
    'r[cos(angle) + i·sin(angle)] · or a single angle for the unit circle.';

  function normalizePolarInput(s) {
    return String(s)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  function normalizeComplexPolarKey(s) {
    return normalizePolarInput(s).replace(/·/g, '·');
  }

  function startsWithREquals(s) {
    return /^r\s*=/i.test(String(s).trim());
  }

  /** (a, b) with comma — not nested parens for simplicity. */
  function tryParseTuple(s) {
    var t = String(s).trim();
    var m = t.match(/^\(\s*([^,]+)\s*,\s*([^)]+)\s*\)\s*$/);
    if (!m) return null;
    return { first: m[1].trim(), second: m[2].trim() };
  }

  /**
   * Disambiguate (a, b): polar→rectangular iff the second value contains π or the letters pi
   * (e.g. 5pi/6). Otherwise the second value is treated as a Cartesian coordinate → rect→polar.
   * Using /\bpi\b/ would miss "5pi/6" (no word boundary between digit and p).
   */
  function secondComponentIsPolarAngle(second) {
    return /π|pi/i.test(String(second));
  }

  function matchesComplexRectangular(s) {
    var t = String(s).trim();
    if (!t) return false;
    if (startsWithREquals(t)) return false;
    if (tryParseTuple(t)) return false;
    if (matchesComplexPolarForm(t)) return false;
    if (!/\bi\s*\)?\s*$/i.test(t)) return false;
    if (/^sin|^cos|^tan|^ln|^log/i.test(t.replace(/^\s*\(/, ''))) return false;
    return true;
  }

  function matchesComplexPolarForm(s) {
    var t = String(s).trim();
    return (
      /\[/.test(t) &&
      /\bcos\s*\(/i.test(t) &&
      /\bsin\s*\(/i.test(t) &&
      /\]/.test(t)
    );
  }

  /** Lone angle: unit circle — no comma tuple, not r=, not complex rect/polar. */
  function matchesSingleAngle(s) {
    var t = String(s).trim();
    if (!t) return false;
    if (startsWithREquals(t)) return false;
    if (tryParseTuple(t)) return false;
    if (matchesComplexRectangular(t)) return false;
    if (matchesComplexPolarForm(t)) return false;
    if (/,/.test(t)) return false;
    return isAngleLikeToken(t);
  }

  function isAngleLikeToken(t) {
    var c = t.replace(/\s+/g, '');
    if (/\bpi\b|π|theta|θ/i.test(t)) return true;
    if (/^-?\d+\.\d+([eE][+-]?\d+)?$/.test(c)) return true;
    if (/^-?\d+[eE][+-]?\d+$/.test(c)) return true;
    if (/^-?\d+$/.test(c)) return true;
    if (/^[\-+*/().\d\s]+$/.test(t) && (/pi|π/.test(t) || /\d/.test(t))) return true;
    return false;
  }

  /**
   * Detection order (exact):
   * 1) r =
   * 2) (a, b) — if b contains π/pi → polar→rect; else → rect→polar
   * 3) a + bi
   * 4) r[cos + i sin]
   * 5) single angle → unit circle
   */
  function detectPolarSubtype(raw) {
    var s = String(raw).trim();
    if (!s) return null;
    if (startsWithREquals(s)) return 'polar_equation';
    var tup = tryParseTuple(s);
    if (tup) {
      return secondComponentIsPolarAngle(tup.second) ? 'polar_to_rect' : 'rect_to_polar';
    }
    if (matchesComplexRectangular(s)) return 'complex_rect_to_polar';
    if (matchesComplexPolarForm(s)) return 'complex_polar_to_rect';
    if (matchesSingleAngle(s)) return 'unit_circle_angle';
    return null;
  }

  function rectToPolarQuadrantRad(x, y) {
    if (x === 0 && y === 0) {
      return { thetaRad: NaN, quadrant: 'origin' };
    }
    if (x === 0 && y > 0) {
      return { thetaRad: Math.PI / 2, quadrant: 'positive y-axis' };
    }
    if (x === 0 && y < 0) {
      return { thetaRad: (3 * Math.PI) / 2, quadrant: 'negative y-axis' };
    }
    if (y === 0 && x > 0) {
      return { thetaRad: 0, quadrant: 'positive x-axis' };
    }
    if (y === 0 && x < 0) {
      return { thetaRad: Math.PI, quadrant: 'negative x-axis' };
    }
    if (x > 0 && y > 0) {
      return { thetaRad: Math.atan2(y, x), quadrant: 'Q1' };
    }
    if (x < 0 && y > 0) {
      return { thetaRad: Math.atan(y / x) + Math.PI, quadrant: 'Q2' };
    }
    if (x < 0 && y < 0) {
      return { thetaRad: Math.atan(y / x) + Math.PI, quadrant: 'Q3' };
    }
    if (x > 0 && y < 0) {
      return { thetaRad: Math.atan(y / x) + 2 * Math.PI, quadrant: 'Q4' };
    }
    return { thetaRad: Math.atan2(y, x), quadrant: '—' };
  }

  var POLAR_TABLE = {
    polar_to_rect: {
      '(4,5pi/6)': {
        x: '-2√3',
        y: '2',
        rectangular: '(-2√3, 2)',
        xDecimal: '-3.4641',
        yDecimal: '2',
        desmosPoint: '(-2\\sqrt{3},2)'
      },
      '(1,pi/4)': {
        x: '√2/2',
        y: '√2/2',
        rectangular: '(√2/2, √2/2)',
        desmosPoint: '(\\frac{\\sqrt{2}}{2},\\frac{\\sqrt{2}}{2})'
      },
      '(2,pi/3)': {
        x: '1',
        y: '√3',
        rectangular: '(1, √3)',
        desmosPoint: '(1,\\sqrt{3})'
      },
      '(3,pi)': { x: '-3', y: '0', rectangular: '(-3, 0)', desmosPoint: '(-3,0)' },
      '(2,3pi/2)': { x: '0', y: '-2', rectangular: '(0, -2)', desmosPoint: '(0,-2)' },
      '(6,7pi/6)': {
        x: '-3√3',
        y: '-3',
        rectangular: '(-3√3, -3)',
        desmosPoint: '(-3\\sqrt{3},-3)'
      },
      '(-3,2pi/3)': {
        x: '3/2',
        y: '-3√3/2',
        rectangular: '(3/2, -3√3/2)',
        desmosPoint: '(\\frac{3}{2},-\\frac{3\\sqrt{3}}{2})'
      },
      '(0,pi/4)': {
        x: '0',
        y: '0',
        rectangular: '(0, 0)',
        desmosPoint: '(0,0)'
      }
    },
    rect_to_polar: {
      '(2,-4)': {
        r: '2√5',
        rDecimal: '4.4721',
        theta: 'arctan(-2) + 2π',
        thetaDecimal: '5.1760',
        quadrant: 'Q4',
        polar: '(2√5, 5.176)',
        desmosPointPolarApprox: '(4.472\\cos(5.176),4.472\\sin(5.176))'
      },
      '(1,1)': {
        r: '√2',
        theta: 'π/4',
        thetaExact: 'π/4',
        quadrant: 'Q1',
        polar: '(√2, π/4)',
        desmosPointPolarApprox: '(\\sqrt{2}\\cos(\\frac{\\pi}{4}),\\sqrt{2}\\sin(\\frac{\\pi}{4}))'
      },
      '(-1,√3)': {
        r: '2',
        theta: '2π/3',
        thetaExact: '2π/3',
        quadrant: 'Q2',
        polar: '(2, 2π/3)',
        desmosPointPolarApprox: '(2\\cos(\\frac{2\\pi}{3}),2\\sin(\\frac{2\\pi}{3}))'
      },
      '(-√3,-1)': {
        r: '2',
        theta: '7π/6',
        thetaExact: '7π/6',
        quadrant: 'Q3',
        polar: '(2, 7π/6)',
        desmosPointPolarApprox: '(2\\cos(\\frac{7\\pi}{6}),2\\sin(\\frac{7\\pi}{6}))'
      },
      '(0,3)': {
        r: '3',
        theta: 'π/2',
        thetaExact: 'π/2',
        quadrant: 'positive y-axis',
        polar: '(3, π/2)',
        desmosPointPolarApprox: '(0,3)'
      },
      '(0,-5)': {
        r: '5',
        theta: '3π/2',
        thetaExact: '3π/2',
        quadrant: 'negative y-axis',
        polar: '(5, 3π/2)',
        desmosPointPolarApprox: '(0,-5)'
      },
      '(-4,0)': {
        r: '4',
        theta: 'π',
        thetaExact: 'π',
        quadrant: 'negative x-axis',
        polar: '(4, π)',
        desmosPointPolarApprox: '(-4,0)'
      },
      '(0,0)': {
        r: '0',
        theta: 'undefined',
        polar: '(0, undefined)',
        desmosPointPolarApprox: '(0,0)'
      },
      '(3,0)': {
        r: '3',
        theta: '0',
        thetaExact: '0',
        quadrant: 'positive x-axis',
        polar: '(3, 0)',
        desmosPointPolarApprox: '(3,0)'
      }
    },
    complex_rect_to_polar: {
      '-3-5i': {
        modulus: '√34',
        modulusDecimal: '5.831',
        argument: 'arctan(5/3) + π',
        argumentDecimal: '4.171',
        polar: '√34[cos(4.171) + i·sin(4.171)]'
      },
      '1+i': {
        modulus: '√2',
        modulusDecimal: '1.4142',
        argument: 'π/4',
        argumentDecimal: '0.7854',
        polar: '√2[cos(π/4) + i·sin(π/4)]'
      },
      '-1+√3·i': {
        modulus: '2',
        argument: '2π/3',
        argumentDecimal: '2.0944',
        polar: '2[cos(2π/3) + i·sin(2π/3)]'
      },
      '3-3i': {
        modulus: '3√2',
        argument: '7π/4',
        argumentDecimal: '5.4978',
        polar: '3√2[cos(7π/4) + i·sin(7π/4)]'
      },
      '-2-2i': {
        modulus: '2√2',
        argument: '5π/4',
        argumentDecimal: '3.9270',
        polar: '2√2[cos(5π/4) + i·sin(5π/4)]'
      }
    },
    complex_polar_to_rect: {
      '6[cos(3pi/4)+i·sin(3pi/4)]': {
        real: '-3√2',
        imaginary: '3√2',
        rectangular: '-3√2 + 3√2·i',
        desmosPointRect: '(-3\\sqrt{2},3\\sqrt{2})'
      },
      '2[cos(pi/3)+i·sin(pi/3)]': {
        real: '1',
        imaginary: '√3',
        rectangular: '1 + √3·i',
        desmosPointRect: '(1,\\sqrt{3})'
      },
      '4[cos(pi)+i·sin(pi)]': {
        real: '-4',
        imaginary: '0',
        rectangular: '-4',
        desmosPointRect: '(-4,0)'
      },
      '3[cos(3pi/2)+i·sin(3pi/2)]': {
        real: '0',
        imaginary: '-3',
        rectangular: '-3i',
        desmosPointRect: '(0,-3)'
      },
      '√2[cos(pi/4)+i·sin(pi/4)]': {
        real: '1',
        imaginary: '1',
        rectangular: '1 + i',
        desmosPointRect: '(1,1)'
      }
    }
  };

  function polarConvert(type, input) {
    var key =
      type === 'complex_polar_to_rect' ? normalizeComplexPolarKey(input) : normalizePolarInput(input);
    var bucket = POLAR_TABLE[type];
    var row = bucket && bucket[key];
    if (!row) {
      return { type: type, matched: false };
    }
    var out = { type: type, matched: true };
    Object.keys(row).forEach(function (k) {
      out[k] = row[k];
    });
    return out;
  }

  function prepForMathjs(expr) {
    return String(expr)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/√\s*\(/g, 'sqrt(')
      .replace(/√([0-9]+)/g, 'sqrt($1)');
  }

  function computePolarToRect(rStr, thetaStr, math) {
    var rE = prepForMathjs(rStr);
    var thE = prepForMathjs(thetaStr);
    var rVal = math.evaluate(rE);
    var x = math.evaluate(rVal + ' * cos(' + thE + ')');
    var y = math.evaluate(rVal + ' * sin(' + thE + ')');
    var xd = math.round(x, 6);
    var yd = math.round(y, 6);
    var rect =
      '(' + String(xd) + ', ' + String(yd) + ')';
    return {
      x: String(xd),
      y: String(yd),
      rectangular: rect,
      desmosPoint: '(' + String(xd) + ',' + String(yd) + ')',
      computed: true
    };
  }

  function computeRectToPolar(xStr, yStr, math) {
    var x = math.evaluate(prepForMathjs(xStr));
    var y = math.evaluate(prepForMathjs(yStr));
    var qp = rectToPolarQuadrantRad(x, y);
    var r = math.sqrt(x * x + y * y);
    var rd = math.round(r, 6);
    if (x === 0 && y === 0) {
      return {
        r: '0',
        theta: 'undefined',
        polar: '(0, undefined)',
        quadrant: 'origin',
        desmosRectInput:
          '(' + String(xStr).replace(/\s+/g, '') + ',' + String(yStr).replace(/\s+/g, '') + ')',
        desmosPointPolarApprox: '(0,0)',
        computed: true
      };
    }
    var th = qp.thetaRad;
    var thStr = String(math.round(th, 6));
    return {
      r: String(rd),
      rDecimal: String(rd),
      theta: thStr + ' rad',
      thetaDecimal: thStr,
      quadrant: qp.quadrant,
      polar: '(' + rd + ', ' + thStr + ')',
      desmosRectInput:
        '(' + String(xStr).replace(/\s+/g, '') + ',' + String(yStr).replace(/\s+/g, '') + ')',
      desmosPointPolarApprox: '(' + rd + '\\cos(' + thStr + '),' + rd + '\\sin(' + thStr + '))',
      computed: true
    };
  }

  function computeComplexRectToPolar(s, math) {
    var expr = prepForMathjs(String(s).trim()).replace(/·/g, '*');
    var c = math.evaluate(expr);
    var re = math.re(c);
    var im = math.im(c);
    var mod = math.sqrt(re * re + im * im);
    var qp = rectToPolarQuadrantRad(re, im);
    var arg = qp.thetaRad;
    if (re === 0 && im === 0) {
      return {
        modulus: '0',
        argument: 'undefined',
        polar: '0',
        computed: true
      };
    }
    return {
      modulus: String(math.round(mod, 6)),
      modulusDecimal: String(math.round(mod, 6)),
      argument: String(math.round(arg, 6)) + ' rad',
      argumentDecimal: String(math.round(arg, 6)),
      polar:
        String(math.round(mod, 6)) +
        '[cos(' +
        String(math.round(arg, 6)) +
        ') + i·sin(' +
        String(math.round(arg, 6)) +
        ')]',
      computed: true
    };
  }

  function parseComplexPolarBracket(s) {
    var t = String(s).trim();
    var m = t.match(
      /^(.+?)\s*\[\s*cos\s*\(\s*([^)]+)\s*\)\s*\+\s*i\s*[·.]?\s*sin\s*\(\s*([^)]+)\s*\)\s*\]\s*$/i
    );
    if (!m) return null;
    return { coef: m[1].trim(), theta1: m[2].trim(), theta2: m[3].trim() };
  }

  function computeComplexPolarToRect(s, math) {
    var p = parseComplexPolarBracket(s);
    if (!p) return null;
    var th = prepForMathjs(p.theta1);
    var rCoef = prepForMathjs(p.coef);
    var rVal = math.evaluate(rCoef);
    var real = math.evaluate(rVal + ' * cos(' + th + ')');
    var imag = math.evaluate(rVal + ' * sin(' + th + ')');
    var rr = math.round(real, 6);
    var ii = math.round(imag, 6);
    var rect =
      ii === 0
        ? String(rr)
        : rr === 0
          ? String(ii) + 'i'
          : String(rr) + ' + ' + String(ii) + 'i';
    return {
      real: String(rr),
      imaginary: String(ii),
      rectangular: rect,
      desmosPointRect: '(' + String(rr) + ',' + String(ii) + ')',
      computed: true
    };
  }

  function polarEquationToParametricLatex(rEquals) {
    var m = String(rEquals)
      .trim()
      .match(/^r\s*=\s*(.+)$/i);
    if (!m) return null;
    var rhs = m[1].trim();
    var f = rhs
      .replace(/\btheta\b/gi, 't')
      .replace(/θ/g, 't')
      .replace(/\u03b8/g, 't');
    return '(' + f + ')\\cos(t),(' + f + ')\\sin(t)';
  }

  function unitCircleDesmosLatex(angleRaw, math) {
    var t = String(angleRaw).trim().replace(/\s+/g, '');
    if (/^-?\d+\.\d+([eE][+-]?\d+)?$/.test(t) || /^-?\d+[eE]/.test(t)) {
      var ev = math.evaluate(t);
      var num = math.round(ev, 8);
      return '(\\cos(' + String(num) + '),\\sin(' + String(num) + '))';
    }
    var thL = t.replace(/π/g, '\\pi').replace(/pi/gi, '\\pi');
    return '(\\cos(' + thL + '),\\sin(' + thL + '))';
  }

  function resolvePolarResult(sub, raw, math) {
    var res = polarConvert(sub, raw);
    if (res && res.matched) return res;
    if (!math) return null;
    if (sub === 'polar_to_rect') {
      var tup = tryParseTuple(raw);
      if (!tup) return null;
      return computePolarToRect(tup.first, tup.second, math);
    }
    if (sub === 'rect_to_polar') {
      var tup2 = tryParseTuple(raw);
      if (!tup2) return null;
      return computeRectToPolar(tup2.first, tup2.second, math);
    }
    if (sub === 'complex_rect_to_polar') {
      return computeComplexRectToPolar(raw, math);
    }
    if (sub === 'complex_polar_to_rect') {
      return computeComplexPolarToRect(raw, math);
    }
    return null;
  }

  function polarAnalyze(input) {
    var raw = String(input || '').trim();
    if (!raw) {
      return { analysisKind: 'polar', matched: false, error: HELP_FORMATS };
    }
    var math = getMath();
    var sub = detectPolarSubtype(raw);

    if (sub === 'polar_equation') {
      var pm = polarEquationToParametricLatex(raw);
      return {
        analysisKind: 'polar',
        subtype: 'polar_equation',
        matched: !!pm,
        display: raw,
        desmosParametric: pm || '',
        steps: ['Parametric: (r(t)cos t, r(t)sin t) with t = θ.'],
        error: pm ? '' : HELP_FORMATS
      };
    }

    if (!sub) {
      return {
        analysisKind: 'polar',
        subtype: 'unknown',
        matched: false,
        display: raw,
        error: HELP_FORMATS
      };
    }

    if (sub === 'unit_circle_angle') {
      if (!math) {
        return {
          analysisKind: 'polar',
          subtype: 'unit_circle_angle',
          matched: false,
          display: raw,
          error: HELP_FORMATS
        };
      }
      var ul = unitCircleDesmosLatex(raw, math);
      return {
        analysisKind: 'polar',
        subtype: 'unit_circle_angle',
        matched: true,
        display: raw,
        lines: ['Unit circle: (cos θ, sin θ) for θ = ' + raw],
        desmosA: ul,
        desmosB: '',
        result: { computed: true }
      };
    }

    var res = resolvePolarResult(sub, raw, math);
    if (!res || (!res.matched && !res.computed)) {
      return {
        analysisKind: 'polar',
        subtype: sub,
        matched: false,
        display: raw,
        error: HELP_FORMATS
      };
    }

    var tupm = raw.match(/^\(\s*([^,]+)\s*,\s*([^)]+)\s*\)\s*$/);
    if (sub === 'rect_to_polar' && tupm) {
      res.desmosRectInput =
        '(' + String(tupm[1]).replace(/\s+/g, '') + ',' + String(tupm[2]).replace(/\s+/g, '') + ')';
    }

    var lines = [];
    var desA = [];
    var desB = [];

    if (sub === 'polar_to_rect') {
      lines.push('Rectangular: ' + res.rectangular);
      lines.push('x = ' + res.x + ', y = ' + res.y);
      if (res.desmosPoint) desA.push(res.desmosPoint);
    } else if (sub === 'rect_to_polar') {
      lines.push('Polar: ' + (res.polar || '(' + res.r + ', ' + res.theta + ')'));
      lines.push('r = ' + res.r + ', θ = ' + res.theta);
      if (res.quadrant) lines.push('Quadrant: ' + res.quadrant);
      if (res.desmosRectInput) desA.push(res.desmosRectInput);
      if (res.desmosPointPolarApprox) desB.push(res.desmosPointPolarApprox);
    } else if (sub === 'complex_rect_to_polar') {
      lines.push('|z| = ' + res.modulus + ', arg z = ' + res.argument);
      lines.push('Polar: ' + res.polar);
    } else if (sub === 'complex_polar_to_rect') {
      lines.push('Rectangular: ' + res.rectangular);
      if (res.desmosPointRect) desA.push(res.desmosPointRect);
    }

    return {
      analysisKind: 'polar',
      subtype: sub,
      matched: true,
      display: raw,
      result: res,
      lines: lines,
      desmosA: desA[0] || '',
      desmosB: desB[0] || ''
    };
  }

  function createPolarApi(mathInstance) {
    if (mathInstance) setMath(mathInstance);
    return {
      polarConvert: polarConvert,
      polarAnalyze: polarAnalyze,
      polarEquationToParametricLatex: polarEquationToParametricLatex,
      detectPolarSubtype: detectPolarSubtype,
      normalizePolarInput: normalizePolarInput,
      rectToPolarQuadrantRad: rectToPolarQuadrantRad,
      setMath: setMath,
      POLAR_TABLE: POLAR_TABLE,
      HELP_FORMATS: HELP_FORMATS
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createPolarApi: createPolarApi,
      polarConvert: polarConvert,
      polarAnalyze: polarAnalyze,
      polarEquationToParametricLatex: polarEquationToParametricLatex,
      detectPolarSubtype: detectPolarSubtype,
      normalizePolarInput: normalizePolarInput,
      rectToPolarQuadrantRad: rectToPolarQuadrantRad,
      POLAR_TABLE: POLAR_TABLE,
      setMath: setMath
    };
  }

  root.createPolarApi = createPolarApi;
  root.polarConvert = polarConvert;
  root.polarAnalyze = polarAnalyze;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
