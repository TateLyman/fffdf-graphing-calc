/**
 * Polar table / AROC: (r₂ - r₁)/(θ₂ - θ₁), linear estimate, inc/dec, distance from pole.
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

  /**
   * Normalize an angle expression for mathjs and strip optional labels like
   * theta1 = …, θ₂: …, angle = … (you can type "theta" instead of θ).
   */
  function prepTheta(expr) {
    var s = String(expr)
      .replace(/\u03c0/g, 'pi')
      .replace(/\u2212/g, '-')
      .trim();
    s = s.replace(/^(?:theta|θ|ϑ)\s*_(?:\s*)?(?:1|2|₁|₂)\s*[=:]\s*/i, '');
    s = s.replace(/^(?:theta|θ|ϑ)(?:1|2|₁|₂)\s*[=:]\s*/i, '');
    s = s.replace(/^(?:theta|θ|ϑ)\s*[=:]\s*/i, '');
    s = s.replace(/^(?:angle|ang)\s*_(?:\s*)?(?:1|2|a|b|₁|₂)\s*[=:]\s*/i, '');
    s = s.replace(/^(?:angle|ang)(?:1|2|a|b)?\s*[=:]\s*/i, '');
    return s.trim();
  }

  function evalTheta(expr, math) {
    if (typeof expr === 'number' && !isNaN(expr)) return expr;
    return math.evaluate(prepTheta(expr));
  }

  function numR(r) {
    if (typeof r === 'number' && !isNaN(r)) return r;
    var s = String(r).trim().replace(/[\u2212\u2010\u2011\u2012\u2013\u2014]/g, '-');
    s = s.replace(/^(?:r|R)\s*_(?:\s*)?(?:1|2|₁|₂|i|ᵢ)?\s*[=:]\s*/i, '');
    s = s.replace(/^(?:r|R)(?:1|2|₁|₂|i|ᵢ)\s*[=:]\s*/i, '');
    s = s.replace(/^(?:r|R)\s*[=:]\s*/i, '');
    return parseFloat(s.replace(/\s+/g, ''), 10);
  }

  function computeAroc(input) {
    var math = getMath();
    if (!math) {
      return { type: 'aroc', error: 'math unavailable', aroc: '', arocDecimal: NaN, steps: [] };
    }
    var t1 = evalTheta(input.theta1, math);
    var t2 = evalTheta(input.theta2, math);
    var r1 = numR(input.r1);
    var r2 = numR(input.r2);
    var dt = t2 - t1;
    var steps = [
      'AROC = (r₂ - r₁) / (θ₂ - θ₁)',
      '= (' + r2 + ' - (' + r1 + ')) / (' + prepTheta(input.theta2) + ' - (' + prepTheta(input.theta1) + '))'
    ];
    if (Math.abs(dt) < 1e-14) {
      steps.push('θ₂ = θ₁ → division by zero');
      steps.push('AROC is undefined');
      return {
        type: 'aroc',
        aroc: 'undefined',
        arocDecimal: null,
        steps: steps
      };
    }
    var rate = (r2 - r1) / dt;
    var simplified = null;
    try {
      var sym = math.simplify(
        '(' +
          (r2 - r1) +
          ')/(' +
          prepTheta(input.theta2) +
          '-(' +
          prepTheta(input.theta1) +
          '))'
      );
      simplified = sym.toString();
    } catch (e) {}
    return {
      type: 'aroc',
      aroc: simplified != null ? simplified : String(rate),
      arocDecimal: rate,
      steps: steps
    };
  }

  function computeEstimate(input) {
    var math = getMath();
    if (!math) {
      return { type: 'estimate', error: 'math unavailable', estimateDecimal: NaN, steps: [] };
    }
    var t1 = evalTheta(input.theta1, math);
    var te = evalTheta(input.estimateAt, math);
    var r1 = numR(input.r1);
    var aroc = typeof input.aroc === 'number' ? input.aroc : parseFloat(input.aroc, 10);
    var est = r1 + aroc * (te - t1);
    var steps = [
      'f(θ) ≈ f(θ₁) + AROC · (θ - θ₁)',
      '= ' + r1 + ' + ' + aroc + ' · (' + prepTheta(input.estimateAt) + ' - (' + prepTheta(input.theta1) + '))',
      '≈ ' + est.toFixed(6)
    ];
    return {
      type: 'estimate',
      estimate: String(est),
      estimateDecimal: est,
      steps: steps
    };
  }

  function computeIncDec(input) {
    var vals = input.values || [];
    if (vals.length < 2) {
      return { type: 'increasing_decreasing', answer: '—', reason: 'Need at least two points' };
    }
    var rFirst = numR(vals[0].r);
    var rLast = numR(vals[vals.length - 1].r);
    var answer;
    var reason;
    if (rLast > rFirst) {
      answer = 'increasing';
      reason = 'r goes from ' + rFirst + ' to ' + rLast;
    } else if (rLast < rFirst) {
      answer = 'decreasing';
      reason = 'r goes from ' + rFirst + ' to ' + rLast;
    } else {
      answer = 'constant';
      reason = 'r stays at ' + rFirst;
    }
    return { type: 'increasing_decreasing', answer: answer, reason: reason };
  }

  function computeDistance(input) {
    var vals = input.values || [];
    if (vals.length < 2) {
      return { type: 'distance_from_pole', answer: '—', reason: 'Need at least two points' };
    }
    var a0 = Math.abs(numR(vals[0].r));
    var a1 = Math.abs(numR(vals[vals.length - 1].r));
    var answer;
    var reason;
    if (a1 > a0) {
      answer = 'increasing';
      reason = '|r| goes from ' + a0 + ' to ' + a1 + ' — farther from pole';
    } else if (a1 < a0) {
      answer = 'decreasing';
      reason = '|r| goes from ' + a0 + ' to ' + a1 + ' — closer to pole';
    } else {
      answer = 'constant';
      reason = '|r| stays at ' + a0;
    }
    return { type: 'distance_from_pole', answer: answer, reason: reason };
  }

  /**
   * Stress / API: polarRateOfChange(type, input)
   */
  function polarRateOfChange(type, input) {
    if (type === 'aroc') return computeAroc(input);
    if (type === 'estimate') return computeEstimate(input);
    if (type === 'increasing_decreasing') return computeIncDec(input);
    if (type === 'distance_from_pole') return computeDistance(input);
    return { type: type || 'unknown', error: 'Unknown type' };
  }

  /**
   * Parse one line "a, b" for theta (may include pi) and r.
   */
  function parseCommaPair(line) {
    var t = String(line).trim();
    var idx = t.lastIndexOf(',');
    if (idx <= 0) return null;
    return { left: t.slice(0, idx).trim(), right: t.slice(idx + 1).trim() };
  }

  /**
   * UI: single blob — optional estimate line starting with "estimate" or "at"
   * Block 1: four comma-separated θ₁, r₁, θ₂, r₂
   * OR two lines of θ, r
   */
  function polarRocAnalyze(raw) {
    var text = String(raw || '').trim();
    if (!text) {
      return { matched: false, error: 'empty' };
    }
    var math = getMath();
    if (!math) {
      return { matched: false, error: 'Math not loaded' };
    }

    var lines = text.split(/\r?\n/).map(function (l) {
      return l.trim();
    }).filter(Boolean);

    var estimateLine = null;
    var restLines = lines.filter(function (ln) {
      if (
        /^estimate\s*:/i.test(ln) ||
        /^at\s*:/i.test(ln) ||
        /^θ\s*:/i.test(ln) ||
        /^theta\s*:/i.test(ln)
      ) {
        estimateLine = ln
          .replace(/^estimate\s*:\s*/i, '')
          .replace(/^at\s*:\s*/i, '')
          .replace(/^θ\s*:\s*/i, '')
          .replace(/^theta\s*:\s*/i, '')
          .trim();
        return false;
      }
      return true;
    });

    var four = text.replace(/\n/g, ',').split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);

    // Do not require restLines.length <= 2: multi-line pastes (3+ lines) still join to four
    // comma-separated slots; the old guard incorrectly rejected those.
    if (four.length >= 4) {
      var theta1 = four[0];
      var r1 = numR(four[1]);
      var theta2 = four[2];
      var r2 = numR(four[3]);
      var arocRes = computeAroc({ theta1: theta1, r1: r1, theta2: theta2, r2: r2 });
      var out = {
        matched: true,
        mode: 'aroc',
        aroc: arocRes,
        lines: []
      };
      if (estimateLine != null && estimateLine !== '') {
        if (arocRes.arocDecimal == null || arocRes.aroc === 'undefined') {
          out.estimate = { error: 'AROC undefined — cannot estimate' };
        } else {
          out.estimate = computeEstimate({
            theta1: theta1,
            r1: r1,
            aroc: arocRes.arocDecimal,
            estimateAt: estimateLine
          });
        }
      }
      return out;
    }

    if (restLines.length >= 2) {
      var p1 = parseCommaPair(restLines[0]);
      var p2 = parseCommaPair(restLines[1]);
      if (p1 && p2) {
        var r1b = numR(p1.right);
        var r2b = numR(p2.right);
        var aroc2 = computeAroc({
          theta1: p1.left,
          r1: r1b,
          theta2: p2.left,
          r2: r2b
        });
        var out2 = { matched: true, mode: 'aroc', aroc: aroc2, lines: [] };
        if (estimateLine) {
          if (aroc2.arocDecimal == null) {
            out2.estimate = { error: 'AROC undefined' };
          } else {
            out2.estimate = computeEstimate({
              theta1: p1.left,
              r1: r1b,
              aroc: aroc2.arocDecimal,
              estimateAt: estimateLine
            });
          }
        }
        return out2;
      }
    }

    return {
      matched: false,
      error:
        'Enter four values: angles and r (comma-separated). You may label them, e.g. theta1=pi/8, r1=-1.41, theta2=3pi/8, r2=-1.41 — or two lines "theta, r". Optional: estimate: pi/4'
    };
  }

  function createPolarRocApi(mathInstance) {
    if (mathInstance) setMath(mathInstance);
    return {
      polarRateOfChange: polarRateOfChange,
      polarRocAnalyze: polarRocAnalyze,
      setMath: setMath
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createPolarRocApi: createPolarRocApi,
      polarRateOfChange: polarRateOfChange,
      polarRocAnalyze: polarRocAnalyze,
      setMath: setMath
    };
  }

  root.createPolarRocApi = createPolarRocApi;
  root.polarRateOfChange = polarRateOfChange;
  root.polarRocAnalyze = polarRocAnalyze;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
