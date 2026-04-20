'use strict';

const { create, all } = require('mathjs');
const math = create(all, {});
const graphTrig = require('./graph-trig.js');
const asymptote = require('./asymptote.js');

graphTrig.setMath(math);
asymptote.setMath(math);
graphTrig.setAsymptoteFormula(asymptote.asymptoteFormula);

const tests = [
  {
    input: 'tan(x + pi/4) - 1',
    desmos: '\\tan\\left(x+\\frac{\\pi}{4}\\right)-1',
    period: 'π',
    phaseShift: 'left π/4',
    verticalShift: '-1',
    amplitude: 'none',
    asymptotes: 'x = π/4 + πk'
  },
  {
    input: 'tan(theta + pi/4) - 1',
    desmos: '\\tan\\left(x+\\frac{\\pi}{4}\\right)-1',
    period: 'π',
    phaseShift: 'left π/4',
    verticalShift: '-1',
    amplitude: 'none',
    asymptotes: 'x = π/4 + πk'
  },
  {
    input: '-2tan(2x) + 3',
    desmos: '-2\\tan\\left(2x\\right)+3',
    period: 'π/2',
    phaseShift: 'none',
    verticalShift: '3',
    amplitude: 'none',
    asymptotes: 'x = π/4 + (π/2)k'
  },
  { input: 'tan(x)', desmos: '\\tan\\left(x\\right)', period: 'π', phaseShift: 'none', verticalShift: '0', amplitude: 'none', asymptotes: 'x = π/2 + πk' },
  {
    input: 'tan(x/2) + 1',
    desmos: '\\tan\\left(\\frac{x}{2}\\right)+1',
    period: '2π',
    phaseShift: 'none',
    verticalShift: '1',
    amplitude: 'none',
    asymptotes: 'x = π + 2πk'
  },
  {
    input: '3tan(x - pi/3)',
    desmos: '3\\tan\\left(x-\\frac{\\pi}{3}\\right)',
    period: 'π',
    phaseShift: 'right π/3',
    verticalShift: '0',
    amplitude: 'none',
    asymptotes: 'x = 5π/6 + πk'
  },
  {
    input: '2csc(x + pi/2) - 1',
    desmos: '\\frac{2}{\\sin\\left(x+\\frac{\\pi}{2}\\right)}-1',
    period: '2π',
    phaseShift: 'left π/2',
    verticalShift: '-1',
    amplitude: '2',
    asymptotes: 'x = -π/2 + πk'
  },
  { input: 'csc(x)', desmos: '\\frac{1}{\\sin\\left(x\\right)}', period: '2π', phaseShift: 'none', verticalShift: '0', amplitude: '1', asymptotes: 'x = πk' },
  {
    input: '-csc(2x) + 2',
    desmos: '\\frac{-1}{\\sin\\left(2x\\right)}+2',
    period: 'π',
    phaseShift: 'none',
    verticalShift: '2',
    amplitude: '1',
    asymptotes: 'x = (π/2)k'
  },
  {
    input: '3csc(x/2)',
    desmos: '\\frac{3}{\\sin\\left(\\frac{x}{2}\\right)}',
    period: '4π',
    phaseShift: 'none',
    verticalShift: '0',
    amplitude: '3',
    asymptotes: 'x = 2πk'
  },
  {
    input: '3sec(x/2)',
    desmos: '\\frac{3}{\\cos\\left(\\frac{x}{2}\\right)}',
    period: '4π',
    phaseShift: 'none',
    verticalShift: '0',
    amplitude: '3',
    asymptotes: 'x = π + 2πk'
  },
  { input: 'sec(x)', desmos: '\\frac{1}{\\cos\\left(x\\right)}', period: '2π', phaseShift: 'none', verticalShift: '0', amplitude: '1', asymptotes: 'x = π/2 + πk' },
  {
    input: '2sec(x + pi/3) - 1',
    desmos: '\\frac{2}{\\cos\\left(x+\\frac{\\pi}{3}\\right)}-1',
    period: '2π',
    phaseShift: 'left π/3',
    verticalShift: '-1',
    amplitude: '2',
    asymptotes: 'x = π/6 + πk'
  },
  {
    input: '-sec(2x)',
    desmos: '\\frac{-1}{\\cos\\left(2x\\right)}',
    period: 'π',
    phaseShift: 'none',
    verticalShift: '0',
    amplitude: '1',
    asymptotes: 'x = π/4 + (π/2)k'
  },
  { input: 'cot(x)', desmos: '\\frac{1}{\\tan\\left(x\\right)}', period: 'π', phaseShift: 'none', verticalShift: '0', amplitude: 'none', asymptotes: 'x = πk' },
  {
    input: '2cot(x - pi/4) + 1',
    desmos: '\\frac{2}{\\tan\\left(x-\\frac{\\pi}{4}\\right)}+1',
    period: 'π',
    phaseShift: 'right π/4',
    verticalShift: '1',
    amplitude: 'none',
    asymptotes: 'x = π/4 + πk'
  },
  {
    input: '-cot(3x)',
    desmos: '\\frac{-1}{\\tan\\left(3x\\right)}',
    period: 'π/3',
    phaseShift: 'none',
    verticalShift: '0',
    amplitude: 'none',
    asymptotes: 'x = (π/3)k'
  },
  {
    input: '2sin(3x + pi) - 1',
    desmos: '2\\sin\\left(3x+\\pi\\right)-1',
    period: '2π/3',
    phaseShift: 'left π/3',
    verticalShift: '-1',
    amplitude: '2',
    asymptotes: 'none'
  },
  {
    input: '-cos(x/2) + 3',
    desmos: '-\\cos\\left(\\frac{x}{2}\\right)+3',
    period: '4π',
    phaseShift: 'none',
    verticalShift: '3',
    amplitude: '1',
    asymptotes: 'none'
  },
  { input: 'sin(x)', desmos: '\\sin\\left(x\\right)', period: '2π', phaseShift: 'none', verticalShift: '0', amplitude: '1', asymptotes: 'none' },
  {
    input: 'csc(x - pi)',
    desmos: '\\frac{1}{\\sin\\left(x-\\pi\\right)}',
    period: '2π',
    phaseShift: 'right π',
    verticalShift: '0',
    amplitude: '1',
    asymptotes: 'x = π + πk'
  },
  {
    input: '-3sec(x/4) + 2',
    desmos: '\\frac{-3}{\\cos\\left(\\frac{x}{4}\\right)}+2',
    period: '8π',
    phaseShift: 'none',
    verticalShift: '2',
    amplitude: '3',
    asymptotes: 'x = 2π + 4πk'
  },
  {
    input: 'tan(pi*x)',
    desmos: '\\tan\\left(\\pi*x\\right)',
    period: '1',
    phaseShift: 'none',
    verticalShift: '0',
    amplitude: 'none',
    asymptotes: 'x = 1/2 + k'
  }
];

function runTests(fn) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = fn(test.input);
    const checks = ['period', 'phaseShift', 'verticalShift', 'amplitude', 'asymptotes'];
    let allOk = true;

    for (const prop of checks) {
      if (test[prop] !== undefined && result[prop] !== test[prop]) {
        allOk = false;
        failures.push(
          '❌ "' + test.input + '" ' + prop + ': got "' + result[prop] + '", expected "' + test[prop] + '"'
        );
      }
    }

    if (result.desmos !== test.desmos) {
      allOk = false;
      failures.push(
        '❌ "' + test.input + '" desmos: got "' + result.desmos + '", expected "' + test.desmos + '"'
      );
    }

    if (allOk) passed++;
    else failed++;
  }

  console.log('\n' + '='.repeat(50));
  console.log('GRAPH TRIG TESTS: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed));
  console.log('='.repeat(50) + '\n');

  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach(function (f) {
      console.log(f);
    });
    process.exitCode = 1;
  } else {
    console.log('✅ ALL TESTS PASSED');
  }
}

function expectedRange(amplitude, verticalShift, reflected) {
  var A = Math.abs(amplitude);
  var D = verticalShift;
  var lo = D - A;
  var hi = D + A;
  return '(-∞, ' + lo + '] ∪ [' + hi + ', ∞)';
}

if (require.main === module) {
  runTests(graphTrig.graphTrigAnalyze);
}

module.exports = { tests, runTests, expectedRange };
