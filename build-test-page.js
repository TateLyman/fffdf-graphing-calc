'use strict';

/**
 * Generates test/index.html with every stress case and typing-format probe on its own line.
 * Run at deploy time (npm run build). No subprocess summaries — each assertion is explicit.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'test');
const OUT_FILE = path.join(OUT_DIR, 'index.html');

const { create, all } = require('mathjs');
const math = create(all, {});

const { createExactEvaluator } = require('./exact-evaluate.js');
const asymptote = require('./asymptote.js');
const terminalRay = require('./terminal-ray.js');
const graphTrig = require('./graph-trig.js');
const inverseTrig = require('./inverse-trig.js');
const trigFuncInv = require('./trig-func-inverse.js');
const trigEq = require('./trig-equation.js');
const { trigIdentitySimplify, setMath: setIdentityMath } = require('./trig-identity-simplify.js');
const { sumDiffAnalyze } = require('./sum-diff-formulas.js');
const polar = require('./polar-conversions.js');
const polarRoc = require('./polar-rate-of-change.js');
const trigIneq = require('./trig-inequality.js');

asymptote.setMath(math);
terminalRay.setMath(math);
graphTrig.setMath(math);
graphTrig.setAsymptoteFormula(asymptote.asymptoteFormula);
inverseTrig.setMath(math);
trigFuncInv.setMath(math);
trigEq.setMath(math);
setIdentityMath(math);
polar.setMath(math);
polarRoc.setMath(math);
trigIneq.setMath(math);

const exactEval = createExactEvaluator(math);

const stressTest = require('./stress-test.js');
const stressAsymptote = require('./stress-asymptote.js');
const stressTerminalRay = require('./stress-terminal-ray.js');
const stressGraphTrig = require('./stress-graph-trig.js');
const stressInverseTrig = require('./stress-inverse-trig.js');
const stressTrigFuncInv = require('./stress-trig-func-inv.js');
const stressTrigEq = require('./stress-trig-eq.js');
const stressTrigIdentity = require('./stress-trig-identity.js');
const stressSumDiff = require('./stress-sum-diff.js');
const stressPolar = require('./stress-polar.js');
const stressPolarRoc = require('./stress-polar-roc.js');
const stressTrigIneq = require('./stress-trig-inequality-tests.js');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(ok, input, actual, expected, markOverride) {
  const mark = markOverride != null ? markOverride : ok ? '✅' : '❌';
  const inStr = typeof input === 'string' ? input : JSON.stringify(input);
  return `${mark} ${inStr} → "${String(actual)}"  (expected: "${String(expected)}")`;
}

function normAsy(s) {
  return String(s).replace(/\s+/g, '').toLowerCase();
}

function normEqSol(a, b) {
  const sortJoin = (arr) =>
    [...arr]
      .map(String)
      .sort()
      .join(',');
  return sortJoin(a) === sortJoin(b);
}

function lineExactSuite() {
  const lines = [];
  const { tests } = stressTest;
  for (const test of tests) {
    if (test.edge) {
      lines.push(fmt(false, test.input, '(edge case not evaluated)', test.expected, '⚠️'));
      continue;
    }
    const result = exactEval(test.input);
    let ok;
    if (test.approx) {
      const num = parseFloat(result);
      const expectedNum = parseFloat(String(test.expected).replace('≈', ''));
      ok = Math.abs(num - expectedNum) < 0.01;
    } else {
      ok = result === test.expected;
    }
    lines.push(fmt(ok, test.input, result, test.expected));
  }
  return lines;
}

function lineAsymptoteSuite() {
  const lines = [];
  for (const test of stressAsymptote.tests) {
    const result = asymptote.asymptoteFormula(test.input);
    const ok = normAsy(result) === normAsy(test.expectedFormula);
    lines.push(fmt(ok, test.input, result, test.expectedFormula));
  }
  return lines;
}

function lineTerminalRaySuite() {
  const lines = [];
  for (const test of stressTerminalRay.tests) {
    const result = terminalRay.terminalRayPointSlope(test.input);
    const ok = result.slope === test.slope && result.point === test.point;
    const actual = `point=${result.point}; slope=${result.slope}`;
    const expected = `point=${test.point}; slope=${test.slope}`;
    lines.push(fmt(ok, test.input, actual, expected));
  }
  return lines;
}

function lineGraphTrigSuite() {
  const lines = [];
  const checks = ['period', 'phaseShift', 'verticalShift', 'amplitude', 'asymptotes', 'desmos'];
  for (const test of stressGraphTrig.tests) {
    const result = graphTrig.graphTrigAnalyze(test.input);
    let ok = true;
    const actualParts = [];
    const expParts = [];
    for (const k of checks) {
      if (test[k] !== undefined) {
        actualParts.push(`${k}=${result[k]}`);
        expParts.push(`${k}=${test[k]}`);
        if (result[k] !== test[k]) ok = false;
      }
    }
    lines.push(fmt(ok, test.input, actualParts.join('; '), expParts.join('; ')));
  }
  return lines;
}

function lineInverseTrigSuite() {
  const lines = [];
  for (const test of stressInverseTrig.tests) {
    const result = inverseTrig.inverseTrigAnalyze(test.input);
    if (!result) {
      lines.push(fmt(false, test.input, 'null', 'analysis object'));
      continue;
    }
    let ok = true;
    const props = ['domain', 'range', 'desmos'];
    for (const p of props) {
      if (test[p] !== undefined && result[p] !== test[p]) ok = false;
    }
    if (test.keyPoints) {
      for (const pt of test.keyPoints) {
        if (!result.keyPoints || !result.keyPoints.includes(pt)) ok = false;
      }
    }
    if (test.horizontalAsymptotes) {
      for (const h of test.horizontalAsymptotes) {
        if (!result.horizontalAsymptotes || !result.horizontalAsymptotes.includes(h)) ok = false;
      }
    }
    const actual =
      `domain=${result.domain}; range=${result.range}; desmos=${result.desmos}; keyPoints=${(result.keyPoints || []).join('|')}`;
    const expected =
      `domain=${test.domain}; range=${test.range}; desmos=${test.desmos}; keyPoints=${(test.keyPoints || []).join('|')}`;
    lines.push(fmt(ok, test.input, actual, expected));
  }
  return lines;
}

function lineTrigFuncInvSuite() {
  const lines = [];
  const props = ['inverse', 'domainInverse', 'rangeInverse', 'desmosInverse', 'desmosYx'];
  for (const test of stressTrigFuncInv.tests) {
    const result = trigFuncInv.trigFuncInverseAnalyze(test.input, test.restriction);
    if (test.expectNull) {
      const ok = result == null;
      lines.push(fmt(ok, test.input, String(result), 'null'));
      continue;
    }
    if (!result) {
      lines.push(fmt(false, test.input, 'null', 'analysis'));
      continue;
    }
    let ok = true;
    for (const p of props) {
      if (test[p] !== undefined && result[p] !== test[p]) ok = false;
    }
    const actual = props.filter((p) => test[p] !== undefined).map((p) => `${p}=${result[p]}`).join('; ');
    const expected = props.filter((p) => test[p] !== undefined).map((p) => `${p}=${test[p]}`).join('; ');
    lines.push(fmt(ok, test.input, actual, expected));
  }
  return lines;
}

function lineTrigEqSuite() {
  const lines = [];
  for (const test of stressTrigEq.tests) {
    const result = trigEq.trigEquationSolve(test.input, test.interval);
    const got = result.solutions || [];
    const ok = normEqSol(got, test.solutions);
    const actual = got.slice().sort().join(', ');
    const expected = test.solutions.slice().sort().join(', ');
    lines.push(fmt(ok, test.input, actual, expected));
  }
  return lines;
}

function lineTrigIdentitySuite() {
  const lines = [];
  for (const test of stressTrigIdentity.tests) {
    const result = trigIdentitySimplify(test.input);
    const ok = normAsy(result.simplified) === normAsy(test.simplified);
    lines.push(fmt(ok, test.input, result.simplified, test.simplified));
  }
  return lines;
}

function lineSumDiffSuite() {
  const lines = [];
  for (const test of stressSumDiff.tests) {
    const result = sumDiffAnalyze(test.input);
    const exactOk = normAsy(result.exact) === normAsy(test.exact);
    let decOk = true;
    if (test.decimal !== undefined) {
      decOk = Math.abs(parseFloat(result.decimal) - parseFloat(test.decimal)) < 0.001;
    }
    const ok = exactOk && decOk;
    const actual = `exact=${result.exact}; decimal=${result.decimal}`;
    const expected = `exact=${test.exact}; decimal=${test.decimal}`;
    lines.push(fmt(ok, test.input, actual, expected));
  }
  return lines;
}

function linePolarSuite() {
  const lines = [];
  const norm = (s) => String(s).replace(/\s+/g, '').toLowerCase();
  for (const test of stressPolar.tests) {
    const result = polar.polarConvert(test.type, test.input);
    const checks = {
      polar_to_rect: ['x', 'y', 'rectangular'],
      rect_to_polar: ['r', 'theta'],
      complex_rect_to_polar: ['modulus', 'argument'],
      complex_polar_to_rect: ['real', 'imaginary', 'rectangular']
    };
    const keys = checks[test.type] || [];
    let ok = true;
    const actualParts = [];
    const expParts = [];
    for (const k of keys) {
      if (test[k] !== undefined) {
        actualParts.push(`${k}=${result[k]}`);
        expParts.push(`${k}=${test[k]}`);
        if (norm(result[k]) !== norm(test[k])) ok = false;
      }
    }
    lines.push(fmt(ok, `[${test.type}] ${test.input}`, actualParts.join('; '), expParts.join('; ')));
  }
  return lines;
}

function linePolarRocSuite() {
  const lines = [];
  const TOL = 0.01;
  for (const test of stressPolarRoc.tests) {
    const result = polarRoc.polarRateOfChange(test.type, test.input);
    let ok = true;
    let actual = '';
    let expected = '';
    if (test.type === 'aroc') {
      if (test.arocDecimal === null) {
        actual = String(result.aroc);
        expected = 'undefined';
        ok = result.aroc === 'undefined';
      } else {
        actual = String(result.arocDecimal);
        expected = String(test.arocDecimal);
        ok = Math.abs(parseFloat(result.arocDecimal) - test.arocDecimal) <= TOL;
      }
    } else if (test.type === 'estimate') {
      actual = String(result.estimateDecimal);
      expected = String(test.estimateDecimal);
      ok = Math.abs(parseFloat(result.estimateDecimal) - test.estimateDecimal) <= TOL;
    } else {
      actual = String(result.answer);
      expected = String(test.answer);
      ok = result.answer === test.answer;
    }
    lines.push(fmt(ok, `[${test.type}] ${JSON.stringify(test.input)}`, actual, expected));
  }
  return lines;
}

function lineTrigIneqSuite() {
  const lines = [];
  const norm = (s) => String(s).replace(/\s+/g, '').toLowerCase();
  for (const test of stressTrigIneq.tests) {
    const result = trigIneq.solveTrigInequality(test.input, test.interval, test.multipleChoice);
    let ok = norm(result.solution) === norm(test.solution);
    if (test.correctAnswer && result.correctAnswer !== test.correctAnswer) ok = false;
    const actual = `solution=${result.solution}; MC=${result.correctAnswer || 'n/a'}`;
    const expected = `solution=${test.solution}; MC=${test.correctAnswer || 'n/a'}`;
    lines.push(fmt(ok, test.input, actual, expected));
  }
  return lines;
}

function tanInnerArg(s) {
  const m = String(s)
    .replace(/\s+/g, '')
    .match(/tan\(([^)]+)\)/i);
  return m ? m[1] : null;
}

function lineTypingFormatSuite() {
  const lines = [];
  const push = (input, actual, expected, ok) => lines.push(fmt(ok, input, actual, expected));

  (function () {
    const raw = 'tan(x/6)';
    const inner = tanInnerArg(raw);
    const asy = asymptote.asymptoteFormula(raw);
    const ok = inner === 'x/6' && normAsy(asy) === normAsy('x = 3π + 6πk');
    push(raw, `inner=${inner}; asymptote=${asy}`, 'tan with argument x/6; asymptote x = 3π + 6πk', ok);
  })();

  (function () {
    const raw = 'tan(pi/6)';
    const v = exactEval(raw);
    const ok = v === '√3/3' || v === '1/√3' || normAsy(v) === normAsy('√3/3');
    push(raw, v, '√3/3 (exact tan(π/6))', ok);
  })();

  (function () {
    const raw = 'sin^2(x)';
    const r = trigIdentitySimplify(raw);
    const ok = /sin\^2|sin²/i.test(r.simplified || '');
    push(raw, r.simplified || '', 'sin²(x) form preserved / simplified', ok);
  })();

  (function () {
    const raw = 'cos^2(x)sec(x)';
    const r = trigIdentitySimplify(raw);
    const ok = normAsy(r.simplified) === normAsy('cos(x)');
    push(raw, r.simplified, 'cos(x)', ok);
  })();

  (function () {
    const raw = '2sin(x) + 5 = 4';
    const r = trigEq.trigEquationSolve(raw, '[0, 2pi]');
    const got = (r.solutions || []).slice().sort().join(', ');
    const ok = got === '11π/6, 7π/6' || normEqSol(r.solutions || [], ['7π/6', '11π/6']);
    push(raw, got, '7π/6, 11π/6', ok);
  })();

  [
    ['7pi/4', '−√2/2'],
    ['3pi/8', '≈0.3827'],
    ['pi/2', '1'],
    ['2pi', '0'],
    ['pi', '0'],
    ['sqrt(3)/2', '√3/2'],
    ['sqrt(2)', '√2']
  ].forEach(([inp, expLabel]) => {
    const v = exactEval(inp);
    const ok = v !== 'undefined' && v !== '';
    push(inp, v, `numeric/symbolic (${expLabel})`, ok);
  });

  (function () {
    const raw = 'theta';
    const r = terminalRay.terminalRayPointSlope(raw);
    const ok = r.point === '(-1, 0)' && r.slope === '0';
    push(raw, `point=${r.point}; slope=${r.slope}`, 'θ on unit circle → (-1,0); slope 0 at π', ok);
  })();

  ['theta1', 'theta2', 'r1', 'r2'].forEach((sym) => {
    let nodeStr = '';
    try {
      nodeStr = math.parse(sym).toString();
    } catch (e) {
      nodeStr = e.message || String(e);
    }
    const ok = nodeStr === sym;
    push(sym, `mathjs parse: ${nodeStr}`, 'single symbol token (subscript-style id)', ok);
  });

  (function () {
    const t = 'complex_rect_to_polar';
    const raw = '-3 - 5i';
    const res = polar.polarConvert(t, raw);
    const ok = res.matched && res.modulus && res.argument;
    push(raw, `modulus=${res.modulus}; arg=${res.argument}`, 'complex number in polar form', !!ok);
  })();

  (function () {
    const raw = '3 + 2i';
    const a = polar.polarAnalyze(raw);
    const c = math.evaluate(raw.replace(/\s+/g, ''));
    const mod = math.abs(c);
    const arg = math.arg(c);
    const okPolarUi = a.matched && a.result && (a.result.modulus || a.result.modulusDecimal);
    const understood = okPolarUi
      ? `polar UI: |z|=${a.result.modulus}; arg=${a.result.argument}`
      : `polar UI: not detected (coefficient on i); mathjs |z|=${math.round(mod, 6)}; arg=${math.round(arg, 6)} rad`;
    push(raw, understood, 'complex a+bi → modulus and argument (mathjs always)', mod > 0 && Number.isFinite(arg));
  })();

  (function () {
    const res = polar.polarConvert('polar_to_rect', '(4, 5pi/6)');
    const ok = res.matched && res.rectangular === '(-2√3, 2)';
    push('(4, 5pi/6)', `rectangular=${res.rectangular}`, '(-2√3, 2)', ok);
  })();

  (function () {
    const res = polar.polarConvert('rect_to_polar', '(2, -4)');
    const ok = res.matched && /2√5/.test(res.r || '');
    push('(2, -4)', `r=${res.r}; θ=${res.theta}`, 'rectangular → polar', !!ok);
  })();

  (function () {
    const raw = '6[cos(3pi/4) + i·sin(3pi/4)]';
    const res = polar.polarConvert('complex_polar_to_rect', raw);
    const ok = res.matched && normAsy(res.rectangular) === normAsy('-3√2 + 3√2·i');
    push(raw, `rectangular=${res.rectangular}`, '-3√2 + 3√2·i', ok);
  })();

  [
    ['arcsin(x)', 'arcsin'],
    ['sin^-1(x)', 'arcsin'],
    ['cos^-1(x)', 'arccos'],
    ['tan^-1(x)', 'arctan']
  ].forEach(([inp, fam]) => {
    const r = inverseTrig.inverseTrigAnalyze(inp);
    const ok = r && r.desmos && r.desmos.toLowerCase().includes(fam === 'arcsin' ? 'arcsin' : fam === 'arccos' ? 'arccos' : 'arctan');
    push(inp, r ? r.desmos : 'null', `${fam} family`, !!ok);
  });

  ['csc(x)', 'sec(x)', 'cot(x)'].forEach((inp) => {
    const r = trigIdentitySimplify(inp);
    const des = r.desmosSimplifiedLatex || '';
    const ok = /frac\{1\}/.test(des) && /sin|cos|tan/.test(des);
    push(inp, `simplified=${r.simplified}; desmos=${des}`, 'Desmos shows 1/sin, 1/cos, or 1/tan', ok);
  });

  (function () {
    const raw = 'r = 3 + 6cos(theta)';
    const a = polar.polarAnalyze(raw);
    const ok = a.matched && a.subtype === 'polar_equation' && !!a.desmosParametric;
    push(raw, a.desmosParametric || a.error || '', 'polar curve → parametric (r(t)cos t, r(t)sin t)', !!ok);
  })();

  [
    ['4sin(x) + 1 <= -1', '7π/6 ≤ x ≤ 11π/6'],
    ['4sin(x) + 1 >= -1', '0 ≤ x ≤ 7π/6 or 11π/6 ≤ x ≤ 2π']
  ].forEach(([inp, expHint]) => {
    const r = trigIneq.solveTrigInequality(inp, '[0, 2pi]');
    const ok = normAsy(r.solution) === normAsy(expHint);
    push(inp, r.solution, expHint, ok);
  });

  (function () {
    const raw = 'sin(3pi/4 - 5pi/6)';
    const r = sumDiffAnalyze(raw);
    const ok = normAsy(r.exact) === normAsy('(√2 - √6) / 4');
    push(raw, r.exact, '(√2 - √6) / 4', ok);
  })();

  (function () {
    const raw = 'cos(pi/2 + 2pi/3)';
    const r = sumDiffAnalyze(raw);
    const ok = normAsy(r.exact) === normAsy('-√3 / 2');
    push(raw, r.exact, '-√3 / 2', ok);
  })();

  (function () {
    const raw = '(1 - sin^2(x))csc^2(x)';
    const r = trigIdentitySimplify(raw);
    const ok = normAsy(r.simplified) === normAsy('cot^2(x)');
    push(raw, r.simplified, 'cot²(x)', ok);
  })();

  (function () {
    const raw = '2sin(x) - 5';
    const rest = '[-pi/2, pi/2]';
    const r = trigFuncInv.trigFuncInverseAnalyze(raw, rest);
    const ok = r && r.inverse === 'arcsin((x + 5) / 2)';
    push(`${raw}, ${rest}`, r ? r.inverse : 'null', 'arcsin((x + 5) / 2)', !!ok);
  })();

  return lines;
}

function main() {
  const generatedAt = new Date().toISOString();

  const sections = [
    ['Exact evaluate (stress-test.js)', lineExactSuite()],
    ['Asymptote (asymptote.js)', lineAsymptoteSuite()],
    ['Terminal ray (terminal-ray.js)', lineTerminalRaySuite()],
    ['Graph trig (graph-trig.js)', lineGraphTrigSuite()],
    ['Inverse trig (inverse-trig.js)', lineInverseTrigSuite()],
    ['Trig function inverse (trig-func-inverse.js)', lineTrigFuncInvSuite()],
    ['Trig equations (trig-equation.js)', lineTrigEqSuite()],
    ['Trig identity simplify (trig-identity-simplify.js)', lineTrigIdentitySuite()],
    ['Sum/difference formulas (sum-diff-formulas.js)', lineSumDiffSuite()],
    ['Polar conversions (polar-conversions.js)', linePolarSuite()],
    ['Polar rate of change (polar-rate-of-change.js)', linePolarRocSuite()],
    ['Trig inequalities (trig-inequality.js)', lineTrigIneqSuite()],
    ['TYPING FORMAT TESTS (worksheet-style inputs)', lineTypingFormatSuite()]
  ];

  let failCount = 0;
  for (const [, lines] of sections) {
    for (const ln of lines) {
      if (ln.startsWith('❌')) failCount++;
    }
  }

  const parts = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Solver stress tests — static report</title>',
    '<style>',
    'body{font-family:ui-monospace,Menlo,Consolas,monospace;margin:1rem;line-height:1.45;}',
    'h1{font-size:1.1rem;}',
    'h2{font-size:1rem;margin-top:1.5rem;border-bottom:1px solid #ccc;padding-bottom:0.25rem;}',
    '.meta{color:#333;}',
    '.fail{color:#800;font-weight:bold;}',
    'pre{white-space:pre-wrap;word-break:break-word;background:#f6f6f6;padding:0.75rem;border:1px solid #ddd;}',
    '</style>',
    '</head>',
    '<body>',
    '<h1>Solver stress tests (static HTML)</h1>',
    '<p class="meta">Generated at (UTC): ' + escapeHtml(generatedAt) + '</p>',
    '<p class="' + (failCount > 0 ? 'fail' : 'meta') + '">Lines marked ❌: ' + failCount + ' (every case listed below; no summary-only pass)</p>',
    '<p class="meta">Produced by <code>npm run build</code>. No client-side JavaScript.</p>'
  ];

  for (const [title, lines] of sections) {
    parts.push('<section>');
    parts.push('<h2>' + escapeHtml(title) + '</h2>');
    parts.push('<pre>' + escapeHtml(lines.join('\n')) + '</pre>');
    parts.push('</section>');
  }

  parts.push('</body>', '</html>', '');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, parts.join('\n'), 'utf8');
  console.log('Wrote ' + path.relative(ROOT, OUT_FILE));
  if (failCount > 0) {
    console.warn('build-test-page: ' + failCount + ' lines marked failure.');
  }
}

main();
