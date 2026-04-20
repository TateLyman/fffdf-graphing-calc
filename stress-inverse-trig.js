'use strict';

const { create, all } = require('mathjs');
const math = create(all, {});
const inverseTrig = require('./inverse-trig.js');
inverseTrig.setMath(math);

const tests = [
  {
    input: 'arcsin(x)',
    note: 'parent function',
    desmos: '\\arcsin\\left(x\\right)',
    domain: '[-1, 1]',
    range: '[-π/2, π/2]',
    keyPoints: ['-1, -π/2', '0, 0', '1, π/2']
  },
  {
    input: '3sin^-1(-x) + pi/2',
    note: 'sin^-1 textbook notation',
    desmos: '3\\arcsin\\left(-x\\right)+\\frac{\\pi}{2}',
    domain: '[-1, 1]',
    range: '[-π, 2π]',
    keyPoints: ['1, -π', '0, π/2', '-1, 2π']
  },
  {
    input: '3arcsin(-x) + pi/2',
    note: 'WORKSHEET PROBLEM 8',
    desmos: '3\\arcsin\\left(-x\\right)+\\frac{\\pi}{2}',
    domain: '[-1, 1]',
    range: '[-π, 2π]',
    keyPoints: ['1, -π', '0, π/2', '-1, 2π']
  },
  {
    input: '2arcsin(x) - pi',
    desmos: '2\\arcsin\\left(x\\right)-\\pi',
    domain: '[-1, 1]',
    range: '[-2π, 0]',
    keyPoints: ['-1, -2π', '0, -π', '1, 0']
  },
  {
    input: 'arcsin(x - 1)',
    desmos: '\\arcsin\\left(x-1\\right)',
    domain: '[0, 2]',
    range: '[-π/2, π/2]',
    keyPoints: ['0, -π/2', '1, 0', '2, π/2']
  },
  {
    input: 'arcsin(2x)',
    desmos: '\\arcsin\\left(2x\\right)',
    domain: '[-1/2, 1/2]',
    range: '[-π/2, π/2]',
    keyPoints: ['-1/2, -π/2', '0, 0', '1/2, π/2']
  },
  {
    input: '-arcsin(x) + pi/2',
    desmos: '-\\arcsin\\left(x\\right)+\\frac{\\pi}{2}',
    domain: '[-1, 1]',
    range: '[0, π]',
    keyPoints: ['-1, π', '0, π/2', '1, 0'],
    note: 'reflection over x-axis + shift — range flips'
  },
  {
    input: 'arccos(x)',
    note: 'parent function',
    desmos: '\\arccos\\left(x\\right)',
    domain: '[-1, 1]',
    range: '[0, π]',
    keyPoints: ['-1, π', '0, π/2', '1, 0']
  },
  {
    input: '2arccos(x - 3)',
    note: 'WORKSHEET PROBLEM 9',
    desmos: '2\\arccos\\left(x-3\\right)',
    domain: '[2, 4]',
    range: '[0, 2π]',
    keyPoints: ['2, 2π', '3, π', '4, 0']
  },
  {
    input: 'arccos(x + 1)',
    desmos: '\\arccos\\left(x+1\\right)',
    domain: '[-2, 0]',
    range: '[0, π]',
    keyPoints: ['-2, π', '-1, π/2', '0, 0']
  },
  {
    input: '-arccos(x)',
    desmos: '-\\arccos\\left(x\\right)',
    domain: '[-1, 1]',
    range: '[-π, 0]',
    keyPoints: ['-1, -π', '0, -π/2', '1, 0']
  },
  {
    input: 'arccos(2x) + pi',
    desmos: '\\arccos\\left(2x\\right)+\\pi',
    domain: '[-1/2, 1/2]',
    range: '[π, 2π]',
    keyPoints: ['-1/2, 2π', '0, 3π/2', '1/2, π']
  },
  {
    input: 'arctan(x)',
    note: 'parent function',
    desmos: '\\arctan\\left(x\\right)',
    domain: '(-∞, ∞)',
    range: '(-π/2, π/2)',
    keyPoints: ['0, 0'],
    horizontalAsymptotes: ['y = -π/2', 'y = π/2']
  },
  {
    input: '-arctan(x) - pi',
    note: 'WORKSHEET PROBLEM 10',
    desmos: '-\\arctan\\left(x\\right)-\\pi',
    domain: '(-∞, ∞)',
    range: '(-3π/2, -π/2)',
    keyPoints: ['0, -π'],
    horizontalAsymptotes: ['y = -3π/2', 'y = -π/2']
  },
  {
    input: 'arctan(x) + pi/2',
    desmos: '\\arctan\\left(x\\right)+\\frac{\\pi}{2}',
    domain: '(-∞, ∞)',
    range: '(0, π)',
    keyPoints: ['0, π/2'],
    horizontalAsymptotes: ['y = 0', 'y = π']
  },
  {
    input: '2arctan(x)',
    desmos: '2\\arctan\\left(x\\right)',
    domain: '(-∞, ∞)',
    range: '(-π, π)',
    keyPoints: ['0, 0'],
    horizontalAsymptotes: ['y = -π', 'y = π']
  },
  {
    input: '-2arctan(x) + pi',
    desmos: '-2\\arctan\\left(x\\right)+\\pi',
    domain: '(-∞, ∞)',
    range: '(0, 2π)',
    keyPoints: ['0, π'],
    horizontalAsymptotes: ['y = 0', 'y = 2π']
  },
  {
    input: 'arcsin(-x)',
    desmos: '\\arcsin\\left(-x\\right)',
    domain: '[-1, 1]',
    range: '[-π/2, π/2]',
    keyPoints: ['1, -π/2', '0, 0', '-1, π/2'],
    note: 'reflection over y-axis — same domain/range, key points x-flip'
  },
  {
    input: 'arccos(-x)',
    desmos: '\\arccos\\left(-x\\right)',
    domain: '[-1, 1]',
    range: '[0, π]',
    keyPoints: ['1, π', '0, π/2', '-1, 0'],
    note: 'reflection over y-axis'
  },
  {
    input: 'arctan(x - 2) + pi/4',
    desmos: '\\arctan\\left(x-2\\right)+\\frac{\\pi}{4}',
    domain: '(-∞, ∞)',
    range: '(-π/4, 3π/4)',
    keyPoints: ['2, π/4'],
    horizontalAsymptotes: ['y = -π/4', 'y = 3π/4']
  },
  {
    input: 'arcsin(x/2)',
    desmos: '\\arcsin\\left(\\frac{x}{2}\\right)',
    domain: '[-2, 2]',
    range: '[-π/2, π/2]',
    keyPoints: ['-2, -π/2', '0, 0', '2, π/2']
  }
];

function runTests(yourInverseTrigFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = yourInverseTrigFunction(test.input);
    const checks = ['domain', 'range', 'desmos'];
    let allOk = true;

    if (!result) {
      allOk = false;
      failures.push('❌ "' + test.input + '": returned null');
    } else {
    for (const prop of checks) {
      if (test[prop] !== undefined && result[prop] !== test[prop]) {
        allOk = false;
        failures.push(
          '❌ "' +
            test.input +
            '" ' +
            prop +
            ': got "' +
            result[prop] +
            '", expected "' +
            test[prop] +
            '"' +
            (test.note ? ' (' + test.note + ')' : '')
        );
      }
    }
    }

    if (result && test.keyPoints) {
      for (const pt of test.keyPoints) {
        if (!result.keyPoints || !result.keyPoints.includes(pt)) {
          allOk = false;
          failures.push('❌ "' + test.input + '" missing key point "' + pt + '"');
        }
      }
    }

    if (result && test.horizontalAsymptotes) {
      for (const asy of test.horizontalAsymptotes) {
        if (!result.horizontalAsymptotes || !result.horizontalAsymptotes.includes(asy)) {
          allOk = false;
          failures.push('❌ "' + test.input + '" missing asymptote "' + asy + '"');
        }
      }
    }

    if (allOk) passed++;
    else failed++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(
    'INVERSE TRIG TESTS: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed)
  );
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

if (require.main === module) {
  runTests(inverseTrig.inverseTrigAnalyze);
}

module.exports = { tests, runTests };
