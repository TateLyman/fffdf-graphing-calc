'use strict';

const { create, all } = require('mathjs');
const math = create(all, {});
const trigInv = require('./trig-func-inverse.js');
trigInv.setMath(math);

const tests = [
  {
    input: '2*sin(x-5)',
    restriction: '[-pi/2, pi/2]',
    note: 'typo: phase written as x-5 but K>π → treat as vertical 2sin(x)-5',
    inverse: 'arcsin((x + 5) / 2)',
    domainInverse: '[-7, -3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x+5}{2}\\right)'
  },
  {
    input: '2sin(x) - 5',
    restriction: '-pi/2<=x<=pi/2',
    note: 'inequality form for restriction',
    inverse: 'arcsin((x + 5) / 2)',
    domainInverse: '[-7, -3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x+5}{2}\\right)'
  },
  {
    input: '2sin(x) - 5',
    restriction: '[-pi/2, pi/2]',
    note: 'WORKSHEET PROBLEM 11',
    inverse: 'arcsin((x + 5) / 2)',
    domainInverse: '[-7, -3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x+5}{2}\\right)'
  },
  {
    input: 'sin(x)',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin(x)',
    domainInverse: '[-1, 1]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(x\\right)'
  },
  {
    input: '3sin(x)',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin(x / 3)',
    domainInverse: '[-3, 3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x}{3}\\right)',
    desmosYx: 'y=x'
  },
  {
    input: 'sin(x) + 2',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin(x - 2)',
    domainInverse: '[1, 3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(x-2\\right)'
  },
  {
    input: '2sin(x) + 1',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin((x - 1) / 2)',
    domainInverse: '[-1, 3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x-1}{2}\\right)'
  },
  {
    input: '-sin(x)',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin(-x)',
    domainInverse: '[-1, 1]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(-x\\right)'
  },
  {
    input: '4sin(x) - 3',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin((x + 3) / 4)',
    domainInverse: '[-7, 1]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x+3}{4}\\right)'
  },
  {
    input: 'cos(x)',
    restriction: '[0, pi]',
    inverse: 'arccos(x)',
    domainInverse: '[-1, 1]',
    rangeInverse: '[0, π]',
    desmosInverse: '\\arccos\\left(x\\right)'
  },
  {
    input: '2cos(x) + 1',
    restriction: '[0, pi]',
    inverse: 'arccos((x - 1) / 2)',
    domainInverse: '[-1, 3]',
    rangeInverse: '[0, π]',
    desmosInverse: '\\arccos\\left(\\frac{x-1}{2}\\right)'
  },
  {
    input: '3cos(x) - 2',
    restriction: '[0, pi]',
    inverse: 'arccos((x + 2) / 3)',
    domainInverse: '[-5, 1]',
    rangeInverse: '[0, π]',
    desmosInverse: '\\arccos\\left(\\frac{x+2}{3}\\right)'
  },
  {
    input: 'tan(x)',
    restriction: '(-pi/2, pi/2)',
    inverse: 'arctan(x)',
    domainInverse: '(-∞, ∞)',
    rangeInverse: '(-π/2, π/2)',
    desmosInverse: '\\arctan\\left(x\\right)'
  },
  {
    input: '2tan(x) - 1',
    restriction: '(-pi/2, pi/2)',
    inverse: 'arctan((x + 1) / 2)',
    domainInverse: '(-∞, ∞)',
    rangeInverse: '(-π/2, π/2)',
    desmosInverse: '\\arctan\\left(\\frac{x+1}{2}\\right)'
  },
  {
    input: '-2sin(x) + 3',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin((3 - x) / 2)',
    domainInverse: '[1, 5]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{3-x}{2}\\right)',
    note: 'negative A — watch the sign flip'
  },
  {
    input: 'sin(x) - 1',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin(x + 1)',
    domainInverse: '[-2, 0]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(x+1\\right)'
  },

  // ----- vertical D: extra whitespace, implicit multiply -----
  {
    input: '2*sin( x ) - 5',
    restriction: '[-pi/2, pi/2]',
    note: 'spaces inside parens',
    inverse: 'arcsin((x + 5) / 2)',
    domainInverse: '[-7, -3]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x+5}{2}\\right)'
  },

  // ----- true phase shift (K < π): must NOT use vertical typo recovery -----
  {
    input: '2*sin(x-2)',
    restriction: '[-pi/2, pi/2]',
    note: 'phase x-2, not vertical',
    inverse: 'arcsin(x / 2) + 2',
    domainInverse: '[-2, 2]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x}{2}\\right)+2'
  },

  // ----- typo recovery K > π (4) -----
  {
    input: '2*sin(x-4)',
    restriction: '[-pi/2, pi/2]',
    note: 'K>π typo → vertical 2sin(x)-4',
    inverse: 'arcsin((x + 4) / 2)',
    domainInverse: '[-6, -2]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(\\frac{x+4}{2}\\right)'
  },
  {
    input: '2*cos(x-5)',
    restriction: '[0, pi]',
    note: 'cos K>π typo → vertical 2cos(x)-5',
    inverse: 'arccos((x + 5) / 2)',
    domainInverse: '[-7, -3]',
    rangeInverse: '[0, π]',
    desmosInverse: '\\arccos\\left(\\frac{x+5}{2}\\right)'
  },

  // ----- cos: larger A, decimal D -----
  {
    input: '5cos(x)-1',
    restriction: '[0, pi]',
    inverse: 'arccos((x + 1) / 5)',
    domainInverse: '[-6, 4]',
    rangeInverse: '[0, π]',
    desmosInverse: '\\arccos\\left(\\frac{x+1}{5}\\right)'
  },
  {
    input: 'cos(x)+0.5',
    restriction: '[0, pi]',
    note: 'decimal vertical shift',
    inverse: 'arccos(x - 1 / 2)',
    domainInverse: '[-1/2, 3/2]',
    rangeInverse: '[0, π]',
    desmosInverse: '\\arccos\\left(x-\\frac{1}{2}\\right)'
  },

  // ----- tan + open inequality restriction -----
  {
    input: 'tan(x)',
    restriction: '-pi/2<x<pi/2',
    inverse: 'arctan(x)',
    domainInverse: '(-∞, ∞)',
    rangeInverse: '(-π/2, π/2)',
    desmosInverse: '\\arctan\\left(x\\right)'
  },

  // ----- sin + open interval range display -----
  {
    input: 'sin(x)',
    restriction: '(-pi/2, pi/2)',
    inverse: 'arcsin(x)',
    domainInverse: '[-1, 1]',
    rangeInverse: '(-π/2, π/2)',
    desmosInverse: '\\arcsin\\left(x\\right)'
  },

  // ----- A = -1 rearranged -----
  {
    input: '-sin(x)+1',
    restriction: '[-pi/2, pi/2]',
    inverse: 'arcsin(1 - x)',
    domainInverse: '[0, 2]',
    rangeInverse: '[-π/2, π/2]',
    desmosInverse: '\\arcsin\\left(1-x\\right)'
  },

  // ----- must return null (invalid for this tool) -----
  {
    input: 'x^2',
    restriction: '[-1, 1]',
    expectNull: true,
    note: 'not A·trig(Bx+C)+D'
  },
  {
    input: '2*sin(x)+3*cos(x)',
    restriction: '[-pi/2, pi/2]',
    expectNull: true,
    note: 'two trig calls'
  }
];

function runTests(yourInverseFunction) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    const result = yourInverseFunction(test.input, test.restriction);
    const checks = ['inverse', 'domainInverse', 'rangeInverse', 'desmosInverse', 'desmosYx'];
    let allOk = true;

    if (test.expectNull) {
      if (result !== null && result !== undefined) {
        allOk = false;
        failures.push(
          '❌ "' + test.input + '": expected null, got analysisKind=' +
            (result && result.analysisKind) +
            (test.note ? ' (' + test.note + ')' : '')
        );
      }
    } else if (!result) {
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

    if (allOk) passed++;
    else failed++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(
    'TRIG FUNC INVERSE TESTS: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed)
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
  runTests(trigInv.trigFuncInverseAnalyze);
}

module.exports = { tests, runTests };
