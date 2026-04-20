/**
 * Terminal ray: unit circle point (cos θ, sin θ) and slope tan θ in exact form.
 * Angles are snapped to multiples of π/12 (standard unit circle grid).
 */
(function (root) {
  var math = null;
  var TWO_PI = 2 * Math.PI;
  var SNAP = 1e-7;

  function setMath(m) {
    math = m;
  }

  function prepAngle(s) {
    return String(s)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .replace(/\u03b8/g, 'x')
      .replace(/\btheta\b/gi, 'x')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function prepForParse(s) {
    s = prepAngle(s);
    s = s.replace(/(\d)(pi)\b/gi, '$1*$2');
    s = s.replace(/(\))(\d)/g, '$1*$2');
    return s;
  }

  function normalize0to2pi(th) {
    var t = th % TWO_PI;
    if (t < 0) t += TWO_PI;
    return t;
  }

  /**
   * k = 0..23 for angle k*pi/12
   */
  var TABLE = [
    { point: '(1, 0)', slope: '0' },
    { point: '((√6+√2)/4, (√6-√2)/4)', slope: '2-√3' },
    { point: '(√3/2, 1/2)', slope: '√3/3' },
    { point: '(√2/2, √2/2)', slope: '1' },
    { point: '(1/2, √3/2)', slope: '√3' },
    { point: '((√6-√2)/4, (√6+√2)/4)', slope: '2+√3' },
    { point: '(0, 1)', slope: 'undefined' },
    { point: '(-(√6-√2)/4, (√6+√2)/4)', slope: '-2-√3' },
    { point: '(-1/2, √3/2)', slope: '-√3' },
    { point: '(-√2/2, √2/2)', slope: '-1' },
    { point: '(-√3/2, 1/2)', slope: '-√3/3' },
    { point: '(-(√6+√2)/4, (√6-√2)/4)', slope: '-2+√3' },
    { point: '(-1, 0)', slope: '0' },
    { point: '(-(√6+√2)/4, -(√6-√2)/4)', slope: '2-√3' },
    { point: '(-√3/2, -1/2)', slope: '√3/3' },
    { point: '(-√2/2, -√2/2)', slope: '1' },
    { point: '(-1/2, -√3/2)', slope: '√3' },
    { point: '(-(√6-√2)/4, -(√6+√2)/4)', slope: '2+√3' },
    { point: '(0, -1)', slope: 'undefined' },
    { point: '((√6-√2)/4, -(√6+√2)/4)', slope: '-2-√3' },
    { point: '(1/2, -√3/2)', slope: '-√3' },
    { point: '(√2/2, -√2/2)', slope: '-1' },
    { point: '(√3/2, -1/2)', slope: '-√3/3' },
    { point: '((√6+√2)/4, -(√6-√2)/4)', slope: '-2+√3' }
  ];

  function nearestGridIndex(th) {
    var t = normalize0to2pi(th);
    var k = Math.round((12 * t) / Math.PI);
    if (k === 24) k = 0;
    k = ((k % 24) + 24) % 24;
    var target = (k * Math.PI) / 12;
    var d = Math.abs(t - target);
    if (d > SNAP && Math.abs(t - target + TWO_PI) > SNAP && Math.abs(t - target - TWO_PI) > SNAP) {
      return null;
    }
    return k;
  }

  function evaluateAngleRadians(raw) {
    if (!math) throw new Error('setMath first');
    var p = prepForParse(raw);
    if (!p) return NaN;
    // Match exact-evaluate worksheet: x, theta, θ refer to the reference angle (π rad).
    var scope = {
      pi: Math.PI,
      x: Math.PI,
      theta: Math.PI,
      '\u03b8': Math.PI
    };
    return math.evaluate(p, scope);
  }

  function terminalRayPointSlope(raw) {
    if (!math) throw new Error('setMath first');
    var th;
    try {
      th = evaluateAngleRadians(raw);
    } catch (e) {
      return { point: '', slope: '', error: true };
    }
    if (typeof th !== 'number' || th !== th || !isFinite(th)) {
      return { point: '', slope: '', error: true };
    }
    var idx = nearestGridIndex(th);
    if (idx === null) {
      return { point: '', slope: '', error: true };
    }
    var row = TABLE[idx];
    return { point: row.point, slope: row.slope, theta: th, index: idx };
  }

  /** Desmos LaTeX for the angle expression (right-hand side of a=...). */
  function angleExprToDesmosLatex(raw) {
    var s = prepAngle(raw);
    if (!s) return '';
    s = s.replace(/\*/g, '');
    s = s.replace(/pi/gi, '\\pi');
    return s;
  }

  function createTerminalRayApi(mathInstance) {
    setMath(mathInstance);
    return {
      terminalRayPointSlope: terminalRayPointSlope,
      angleExprToDesmosLatex: angleExprToDesmosLatex,
      evaluateAngleRadians: evaluateAngleRadians,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createTerminalRayApi,
      terminalRayPointSlope: function (s) {
        if (!math) {
          var m = require('mathjs');
          setMath(m.create(m.all, {}));
        }
        return terminalRayPointSlope(s);
      },
      angleExprToDesmosLatex: angleExprToDesmosLatex,
      evaluateAngleRadians: evaluateAngleRadians,
      setMath: setMath
    };
  }
  root.createTerminalRayApi = createTerminalRayApi;
  root.terminalRayPointSlope = terminalRayPointSlope;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
